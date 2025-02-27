// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clean the database
  await prisma.comment.deleteMany();
  await prisma.share.deleteMany();
  await prisma.spreadsheet.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database cleaned');

  // Add demo data if needed
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@example.com',
      username: 'demouser',
    },
  });

  const spreadsheet = await prisma.spreadsheet.create({
    data: {
      name: 'Demo Spreadsheet',
      userId: user.id,
      data: {
        cells: {
          'A1': { value: 'Hello', format: { bold: true } },
          'B1': { value: 'World', format: { italic: true } },
        },
        rowCount: 100,
        columnCount: 26,
      },
    },
  });

  console.log('Demo data created:', { user, spreadsheet });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });