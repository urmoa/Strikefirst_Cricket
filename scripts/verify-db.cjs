require("dotenv/config");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const [role] = await prisma.$queryRaw`
    SELECT current_user AS username, current_database() AS database,
           rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls,
           pg_has_role(current_user, 'postgres', 'MEMBER') AS admin_member
    FROM pg_roles WHERE rolname = current_user
  `;
  assert.equal(role.username, "strikefirst_app");
  assert.equal(role.database, "strikefirst");
  for (const flag of ["rolsuper", "rolcreatedb", "rolcreaterole", "rolreplication", "rolbypassrls", "admin_member"]) {
    assert.equal(role[flag], false, `Unexpected privilege: ${flag}`);
  }

  const tables = await prisma.$queryRaw`
    SELECT tablename,
           has_table_privilege(current_user, format('%I.%I', schemaname, tablename), 'SELECT') AS can_read,
           has_table_privilege(current_user, format('%I.%I', schemaname, tablename), 'INSERT') AS can_insert,
           has_table_privilege(current_user, format('%I.%I', schemaname, tablename), 'UPDATE') AS can_update,
           has_table_privilege(current_user, format('%I.%I', schemaname, tablename), 'DELETE') AS can_delete
    FROM pg_tables WHERE schemaname = 'public'
  `;
  assert(tables.length > 1, "Application tables are missing");
  for (const table of tables) {
    const expected = table.tablename !== "_prisma_migrations";
    for (const permission of ["can_read", "can_insert", "can_update", "can_delete"]) {
      assert.equal(table[permission], expected, `${table.tablename}: ${permission}`);
    }
  }

  const rollback = new Error("Rollback database verification");
  try {
    await prisma.$transaction(async (tx) => {
      const player = await tx.player.create({
        data: { displayName: "Database check", slug: `db-check-${randomUUID()}`, joinedAt: new Date() },
      });
      assert.equal((await tx.player.findUniqueOrThrow({ where: { id: player.id } })).displayName, "Database check");
      assert.equal((await tx.player.update({ where: { id: player.id }, data: { displayName: "Updated check" } })).displayName, "Updated check");
      await tx.player.delete({ where: { id: player.id } });
      assert.equal(await tx.player.findUnique({ where: { id: player.id } }), null);
      throw rollback;
    });
  } catch (error) {
    if (error !== rollback) throw error;
  }

  // If DDL unexpectedly succeeds, the transaction still rolls it back.
  await assert.rejects(
    prisma.$transaction(async (tx) => {
      await tx.$executeRaw`CREATE TABLE public.__strikefirst_permission_check (id integer)`;
      throw rollback;
    }),
    (error) => error.meta?.code === "42501",
    "The application role must not create tables",
  );

  for (const hostname of ["127.0.0.1", "[::1]"]) {
    const allowedUrl = new URL(process.env.DATABASE_URL);
    allowedUrl.hostname = hostname;
    allowedUrl.searchParams.set("connect_timeout", "3");
    const allowedDatabase = new PrismaClient({ datasourceUrl: allowedUrl.toString() });
    try {
      await allowedDatabase.$queryRaw`SELECT 1`;
    } finally {
      await allowedDatabase.$disconnect();
    }
    for (const database of ["postgres", "template1"]) {
      const otherUrl = new URL(allowedUrl);
      otherUrl.pathname = `/${database}`;
      const otherDatabase = new PrismaClient({ datasourceUrl: otherUrl.toString() });
      try {
        await assert.rejects(
          otherDatabase.$queryRaw`SELECT 1`,
          (error) => error.errorCode === "P1010" || error.code === "P1010" ||
            /pg_hba.conf rejects connection|User was denied access/i.test(error.message),
          `Application connection to ${database} via ${hostname} must be denied`,
        );
      } finally {
        await otherDatabase.$disconnect();
      }
    }
  }
  console.log("Database permissions OK: CRUD works; DDL, migration access, admin privileges and connections to other databases are denied (IPv4 and IPv6).");
}

main()
  .catch((error) => {
    console.error("Database verification failed:", error instanceof assert.AssertionError ? error.message : "Connection or database operation failed.");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
