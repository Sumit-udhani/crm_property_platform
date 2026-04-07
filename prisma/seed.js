const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // ✅ 1. Ensure SUPER ADMIN role exists (safe)
  const role = await prisma.roles.upsert({
    where: { name: 'SUPER ADMIN' },
    update: {},
    create: {
      name: 'SUPER ADMIN',
      description: 'Super Admin with full access'
    }
  })

  // 🔐 hash password
  const hashedPassword = await bcrypt.hash('sumit123', 10)

  // ✅ 2. Ensure user exists
  const user = await prisma.users.upsert({
    where: { email: 'sumitudhani9@gmail.com' },
    update: {},
    create: {
      email: 'sumitudhani9@gmail.com',
      password_hash: hashedPassword,
      first_name: 'Sumit',   // ✅ REQUIRED FIELD FIX
      last_name: 'Udhani',   // optional but good
      is_active: true
    }
  })

  // ✅ 3. Assign role to user (safe)
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
  })

  console.log('✅ SUPER ADMIN user + role seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })