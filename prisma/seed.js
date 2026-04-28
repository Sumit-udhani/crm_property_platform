const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { Country, State, City } = require('country-state-city');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });


async function seedAdmin() {
    const existing = await prisma.roles.findFirst({
    where: { name: 'super admin' }
  });

  if (existing) {
    console.log("⚠️ Super Admin already exists, skipping...");
    return;
  }
  const role = await prisma.roles.upsert({
    where: { name: 'super admin' },
    update: {},
    create: {
      name: 'SUPER ADMIN',
      description: 'Super Admin with full access'
    }
  });

  const hashedPassword = await bcrypt.hash('sumit123', 10);

  const user = await prisma.users.upsert({
    where: { email: 'sumitudhani9@gmail.com' },
    update: {},
    create: {
      email: 'sumitudhani9@gmail.com',
      password_hash: hashedPassword,
      first_name: 'Sumit',
      last_name: 'Udhani',
      is_active: true
    }
  });

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

  console.log('✅ Super Admin seeded');
}
async function clearLocations() {
  console.log("🧹 Deleting locations...");

  await prisma.cities.deleteMany();
  await prisma.states.deleteMany();
  await prisma.countries.deleteMany();

  console.log("✅ Locations deleted");
}
async function seedLocations() {
  console.log("🌍 Seeding locations...");

  const countries = Country.getAllCountries();

  for (const c of countries) {
  
    const country = await prisma.countries.upsert({
      where: { code: c.isoCode },
      update: {},
      create: {
        name: c.name,
        code: c.isoCode,
      },
    });

   
    const states = State.getStatesOfCountry(c.isoCode);

    for (const s of states) {
      if (c.isoCode === "IN") {
  const states = State.getStatesOfCountry("IN");
  console.log("India states count:", states.length);
  console.log(states.slice(0, 3));
}
      const state = await prisma.states.upsert({
        where: {
          code_country_id: {
            code: s.isoCode,
            country_id: country.id,
          },
        },
        update: {},
        create: {
          name: s.name,
          code: s.isoCode,
          country_id: country.id,
        },
      });

     
      const cities = City.getCitiesOfState(c.isoCode, s.isoCode);

    
      if (cities.length) {
        await prisma.cities.createMany({
          data: cities.map((city) => ({
            name: city.name,
            state_id: state.id,
          })),
          skipDuplicates: true,
        });
      }
    }
  }

  console.log("✅ Locations seeded successfully");
}

async function main() {
  await seedAdmin();
  await clearLocations();
  await seedLocations();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });