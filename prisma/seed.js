const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('@prisma/client')

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({ adapter })

async function main() {
 await prisma.roles.create({
    data: {
      name: 'SUPER ADMIN',
      description: 'Super Admin with full access'
    }
  })
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