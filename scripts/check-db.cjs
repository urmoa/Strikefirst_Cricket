require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const [connection] = await prisma.$queryRaw`
    SELECT current_database() AS database, current_user AS username
  `;
  const players = await prisma.player.count();
  console.log("Database connection OK:", { ...connection, players });
}

main()
  .catch(() => {
    console.error("Database check failed. Check DATABASE_URL and run migrations.");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
