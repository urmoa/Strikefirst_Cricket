const fs = require("node:fs");
const assert = require("node:assert/strict");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const env = dotenv.parse(fs.readFileSync(process.argv[2] || ".env"));
const url = new URL(env.DATABASE_URL);
assert(url.hostname.endsWith(".neon.tech") && url.hostname.includes("-pooler"));
assert.equal(url.username, "strikefirst_app");
assert.equal(url.searchParams.get("sslmode"), "require");
const prisma = new PrismaClient({ datasourceUrl: env.DATABASE_URL });

async function denied(sql) {
  await assert.rejects(prisma.$queryRawUnsafe(sql), (error) => error.meta?.code === "42501");
}

async function main() {
  const [role] = await prisma.$queryRaw`SELECT rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls FROM pg_roles WHERE rolname = current_user`;
  assert(Object.values(role).every((value) => value === false));
  const memberships = await prisma.$queryRaw`SELECT 1 FROM pg_auth_members WHERE member = (SELECT oid FROM pg_roles WHERE rolname = current_user)`;
  assert.equal(memberships.length, 0);
  const tables = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  assert.equal(tables.length, 21);
  for (const { tablename } of tables) {
    const [rights] = await prisma.$queryRaw`SELECT has_table_privilege(current_user, ${'public."' + tablename + '"'}, 'TRUNCATE') AS truncate`;
    // Check each privilege separately: PostgreSQL's comma list tests ANY privilege.
    for (const privilege of ["SELECT", "INSERT", "UPDATE", "DELETE"]) {
      const [value] = await prisma.$queryRaw`SELECT has_table_privilege(current_user, ${'public."' + tablename + '"'}, ${privilege}) AS allowed`;
      assert(value.allowed, `${tablename}: ${privilege}`);
    }
    assert.equal(rights.truncate, false);
  }
  await denied('SELECT * FROM public._prisma_migrations');
  const [schema] = await prisma.$queryRaw`SELECT has_schema_privilege(current_user, 'public', 'CREATE') AS allowed`;
  assert.equal(schema.allowed, false);
  const rollback = new Error("verification rollback");
  await assert.rejects(prisma.$transaction(async (tx) => {
    const slug = `neon-verification-${require("node:crypto").randomUUID()}`;
    const player = await tx.player.create({ data: { displayName: "Verification", slug, joinedAt: new Date() } });
    assert.equal((await tx.player.findUniqueOrThrow({ where: { id: player.id } })).slug, slug);
    await tx.player.update({ where: { id: player.id }, data: { displayName: "Updated verification" } });
    assert.equal((await tx.player.findUniqueOrThrow({ where: { id: player.id } })).displayName, "Updated verification");
    await tx.player.delete({ where: { id: player.id } });
    throw rollback;
  }), (error) => error === rollback);
  assert.equal(await prisma.player.count({ where: { slug: { startsWith: "neon-verification-" } } }), 0);
  console.log("PASS: pooled TLS connection; restricted role; 21 tables with CRUD; no schema CREATE, TRUNCATE or migration access; Player CRUD transaction rolled back.");
  console.log(`Players: ${await prisma.player.count()}`);
}

main().catch((error) => {
  console.error("Neon verification failed:", error.code || error.name);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
