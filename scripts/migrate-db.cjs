const { spawnSync } = require("node:child_process");
const dotenv = require("dotenv");

// Admin credentials are loaded only by this CLI, never by Next.js.
const loaded = dotenv.config({ path: ".env.migrations", override: true, quiet: true });
if (loaded.error || !process.env.DATABASE_URL) {
  console.error("Create .env.migrations with the administrator DATABASE_URL first.");
  process.exit(1);
}

const cli = require.resolve("prisma/build/index.js");
for (const args of [
  ["migrate", "deploy"],
  ["db", "execute", "--file", "prisma/permissions.sql", "--schema", "prisma/schema.prisma"],
]) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
