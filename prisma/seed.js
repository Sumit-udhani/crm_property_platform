const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // 🔐 hash password
  const hashedPassword = await bcrypt.hash('sumit123', 10);

  // ✅ 1. Ensure SUPER ADMIN role exists (SAFE)
  const role = await prisma.roles.upsert({
    where: { name: 'SUPER ADMIN' },
    update: {},
    create: {
      name: 'SUPER ADMIN',
      description: 'Super Admin with full access'
    }
  });

  // ✅ 2. Ensure user exists (SAFE)
  const user = await prisma.users.upsert({
    where: { email: 'sumitudhani9@gmail.com' },
    update: {},
    create: {
      email: 'sumitudhani9@gmail.com',
      password_hash: hashedPassword
    }
  });

  // ✅ 3. Ensure mapping exists (SAFE)
  await prisma.user_roles.upsert({
    where: {
      user_id_role_id: {
        user_id: user.id,
        role_id: role.id
      }
    },
    update: {},
    create: {
      user_id: user.id,
      role_id: role.id
    }
  });

  console.log('✅ SUPER ADMIN role + user + mapping ensured');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });