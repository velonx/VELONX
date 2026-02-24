import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const allUsers = await prisma.user.findMany({
      select: { referralCode: true }
    });
    
    const totalUsers = allUsers.length;
    const usersWithCodes = allUsers.filter(u => u.referralCode).length;
    const usersWithoutCodes = allUsers.filter(u => !u.referralCode).length;
    
    console.log('User Statistics:');
    console.log(`Total users: ${totalUsers}`);
    console.log(`Users with referral codes: ${usersWithCodes}`);
    console.log(`Users without referral codes: ${usersWithoutCodes}`);
    
    if (totalUsers > 0) {
      const sampleUsers = await prisma.user.findMany({
        take: 3,
        select: {
          id: true,
          email: true,
          name: true,
          referralCode: true
        }
      });
      
      console.log('\nSample users:');
      sampleUsers.forEach(user => {
        console.log(`- ${user.email}: ${user.referralCode || 'NO CODE'}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
