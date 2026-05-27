import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const post = await prisma.blogPost.findUnique({
    where: { slug: 'career-paths-after-btech-computer-science-engineering-cse-a-detailed-guide-2026' }
  });
  console.log('Post views:', post?.views);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
