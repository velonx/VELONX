/**
 * One-time backfill script: fix-null-blog-views.ts
 *
 * Problem: Blog posts created before the `views` field was added to the schema
 * have views = null in MongoDB. MongoDB's $inc operator cannot increment a null
 * field and throws a type error, causing view counts to stay stuck at 0.
 *
 * This script sets views = 0 on all affected posts so future increments work.
 *
 * Usage:
 *   npx ts-node -P tsconfig.json scripts/fix-null-blog-views.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Scanning for blog posts with null views...\n');

  // Use raw MongoDB command to find posts with null views.
  // Prisma TypeScript types don't allow `null` in Int where filters,
  // so we bypass them with a raw aggregation/find command.
  const findResult = await prisma.$runCommandRaw({
    find: 'blog_posts',
    filter: { views: null },
    projection: { _id: 1, title: 1, status: 1 },
  }) as any;

  const docs = findResult.cursor?.firstBatch ?? [];

  if (docs.length === 0) {
    console.log('✅ No posts with null views found. Database is clean!');
    return;
  }

  console.log(`⚠️  Found ${docs.length} post(s) with null views:`);
  docs.forEach((p: any) => {
    const id = p._id?.$oid ?? p._id;
    const title = (p.title ?? '(no title)').substring(0, 60);
    console.log(`   - [${p.status ?? '?'}] ${id} | ${title}`);
  });

  console.log('\n📝 Setting views = 0 for all affected posts...');

  // Raw MongoDB updateMany: set views = 0 where views is null
  const updateResult = await prisma.$runCommandRaw({
    update: 'blog_posts',
    updates: [
      {
        q: { views: null },
        u: { $set: { views: 0 } },
        multi: true,
      },
    ],
  }) as any;

  const modified = updateResult.nModified ?? updateResult.n ?? '?';
  console.log(`\n✅ Done! Updated ${modified} post(s).`);
  console.log('   View counts will now increment correctly on visits.');
}

main()
  .catch((e) => {
    console.error('❌ Backfill failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
