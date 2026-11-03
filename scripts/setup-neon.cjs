// Bootstrap an empty Neon database, keeping owner credentials out of the app env.
const fs = require("node:fs");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

const adminFile = process.argv[2] || ".env.neon.migrations";
const runtimeFile = process.argv[3] || ".env";
const admin = dotenv.parse(fs.readFileSync(adminFile));
const direct = new URL(admin.DATABASE_URL_UNPOOLED || admin.DATABASE_URL);
if (!direct.hostname.endsWith(".neon.tech") || direct.hostname.includes("-pooler")) {
  throw new Error("A direct Neon owner connection is required.");
}
const role = "strikefirst_app";
const quote = (value) => '"' + value.replaceAll('"', '""') + '"';
const literal = (value) => "'" + value.replaceAll("'", "''") + "'";
const prisma = new PrismaClient({ datasourceUrl: direct.toString() });

async function main() {
  const cli = require.resolve("prisma/build/index.js");
  const migrated = spawnSync(process.execPath, [cli, "migrate", "deploy"], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: direct.toString() },
  });
  if (migrated.error || migrated.status !== 0) throw new Error("Migration failed.");

  const existing = fs.existsSync(runtimeFile) ? dotenv.parse(fs.readFileSync(runtimeFile)) : {};
  const runtimeUrl = new URL(admin.DATABASE_URL || direct.toString());
  const [connection] = await prisma.$queryRaw`SELECT current_user AS owner, current_database() AS database`;
  const roles = await prisma.$queryRaw`SELECT rolname FROM pg_roles WHERE rolname = ${role}`;
  let password;
  if (roles.length) {
    const saved = existing.DATABASE_URL && new URL(existing.DATABASE_URL);
    if (!saved || saved.username !== role || saved.hostname !== runtimeUrl.hostname || saved.pathname !== runtimeUrl.pathname) {
      throw new Error("Application role already exists; supply its existing runtime env file. Password was not reset.");
    }
    password = decodeURIComponent(saved.password);
  } else {
    password = crypto.randomBytes(32).toString("hex");
    await prisma.$executeRawUnsafe(`CREATE ROLE ${quote(role)} LOGIN PASSWORD ${literal(password)} NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT`);
  }
  runtimeUrl.username = role;
  runtimeUrl.password = password;
  runtimeUrl.searchParams.set("connection_limit", "5");
  runtimeUrl.searchParams.set("connect_timeout", "15");
  // Save credentials immediately so a later permission error does not strand the role.
  const values = { ...existing, DATABASE_URL: runtimeUrl.toString(), NEON_BRANCH: admin.NEON_BRANCH || "production" };
  delete values.DATABASE_URL_UNPOOLED;
  fs.writeFileSync(runtimeFile, Object.entries(values).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join("\n") + "\n", { mode: 0o600 });

  const statements = [
    `REVOKE ALL ON DATABASE ${quote(connection.database)} FROM PUBLIC`,
    `GRANT CONNECT ON DATABASE ${quote(connection.database)} TO ${quote(role)}`,
    "REVOKE ALL ON SCHEMA public FROM PUBLIC",
    `GRANT USAGE ON SCHEMA public TO ${quote(role)}`,
    `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${quote(role)}`,
    `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${quote(role)}`,
    `REVOKE ALL ON TABLE public._prisma_migrations FROM ${quote(role)}`,
    `ALTER DEFAULT PRIVILEGES FOR ROLE ${quote(connection.owner)} IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${quote(role)}`,
    `ALTER DEFAULT PRIVILEGES FOR ROLE ${quote(connection.owner)} IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${quote(role)}`,
  ];
  await prisma.$transaction(statements.map((sql) => prisma.$executeRawUnsafe(sql)));
  const app = new PrismaClient({ datasourceUrl: runtimeUrl.toString() });
  try {
    const players = await app.player.count();
    console.log(`Neon setup OK: runtime role=${role}, players=${players}; owner env=${adminFile}, runtime env=${runtimeFile}`);
  } finally {
    await app.$disconnect();
  }
}

main().catch((error) => {
  // Driver errors can contain connection details; never print their raw message.
  console.error("Neon setup failed:", error.code || error.name);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
