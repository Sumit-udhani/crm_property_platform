import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  await prisma.roles.upsert({
    where: { name: 'SUPER ADMIN' },
    update: {},
    create: {
      name: 'SUPER ADMIN',
      description: 'Super Admin with full access'
    }
  });

  console.log('✅ SUPER ADMIN role ensured');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });