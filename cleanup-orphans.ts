import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching all users...");
  const users = await prisma.user.findMany({ select: { id: true } });
  const userIds = users.map((u: any) => u.id);

  console.log(`Found ${userIds.length} users. Finding orphaned community posts...`);
  
  // Delete all orphaned community posts where authorId is not in the list of valid user IDs
  const result = await prisma.communityPost.deleteMany({
    where: {
      authorId: {
        notIn: userIds
      }
    }
  });

  console.log(`Successfully deleted ${result.count} orphaned community posts.`);
}

main()
  .catch((e) => {
    console.error("Error cleaning up orphans:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
