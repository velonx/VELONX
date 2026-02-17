import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding student user...');

  try {
    const studentPassword = await bcrypt.hash('password123', 10);

    const student = await prisma.user.create({
      data: {
        name: 'Test Student',
        email: 'student@velonx.com',
        password: studentPassword,
        role: 'STUDENT',
        bio: 'Test student account for development',
        xp: 0,
        level: 1,
        image: '/avatars/space-cat.png',
      },
    });

    console.log('✅ Student user created successfully!');
    console.log('');
    console.log('🔐 Credentials:');
    console.log('   Email: student@velonx.com');
    console.log('   Password: password123');
    console.log('   Role: STUDENT');
    console.log('   ID:', student.id);
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('⚠️  User with email student@velonx.com already exists');
    } else {
      throw error;
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding student:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
