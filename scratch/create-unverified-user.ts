import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Check if test user already exists
  const existing = await prisma.user.findUnique({
    where: { email: 'unverified-builder@test.com' },
  });

  if (existing) {
    console.log('User already exists:', existing);
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: 'Unverified Test Builder',
      email: 'unverified-builder@test.com',
      emailVerified: null,
      password: 'password123', // credentials user
      role: 'STUDENT',
    },
  });
  console.log('Created unverified credentials user:', user);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
