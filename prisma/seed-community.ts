import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting community data seed...\n');

    // Fetch existing users to assign as authors/members
    const users = await prisma.user.findMany({ take: 10 });

    if (users.length < 2) {
        console.error('❌ Need at least 2 users in the database. Run `npx prisma db seed` first.');
        process.exit(1);
    }

    console.log(`📋 Found ${users.length} existing users to work with.`);
    const [admin, alice, bob, carol, david] = users;
    const allUsers = [admin, alice, bob, carol, david].filter(Boolean);

    // ============================================
    // 1. CREATE FOLLOWS
    // ============================================
    console.log('\n👥 Creating follow relationships...');
    const followPairs = [
        { followerId: alice.id, followingId: bob.id },
        { followerId: alice.id, followingId: carol.id },
        { followerId: bob.id, followingId: alice.id },
        { followerId: bob.id, followingId: admin.id },
        { followerId: carol.id, followingId: alice.id },
        { followerId: carol.id, followingId: bob.id },
        { followerId: carol.id, followingId: admin.id },
        ...(david ? [
            { followerId: david.id, followingId: alice.id },
            { followerId: david.id, followingId: carol.id },
            { followerId: alice.id, followingId: david.id },
        ] : []),
    ];

    let followCount = 0;
    for (const pair of followPairs) {
        try {
            await prisma.follow.create({ data: pair });
            followCount++;
        } catch {
            // Skip duplicates
        }
    }
    console.log(`✅ Created ${followCount} follow relationships`);

    // ============================================
    // 2. CREATE COMMUNITY GROUPS
    // ============================================
    console.log('\n🏘️  Creating community groups...');

    const group1 = await prisma.communityGroup.create({
        data: {
            name: 'React Developers Hub',
            description: 'A vibrant community for React enthusiasts — share tips, discuss best practices, and showcase your projects built with React, Next.js, and the broader ecosystem.',
            isPrivate: false,
            ownerId: alice.id,
        },
    });

    const group2 = await prisma.communityGroup.create({
        data: {
            name: 'AI & Machine Learning',
            description: 'Explore the frontier of artificial intelligence and machine learning. From deep learning research to practical ML applications, share papers, projects, and insights.',
            isPrivate: false,
            ownerId: bob.id,
        },
    });

    const group3 = await prisma.communityGroup.create({
        data: {
            name: 'Design Systems & UI',
            description: 'For designers and developers building beautiful, consistent, and scalable design systems. Share components, patterns, and inspiration.',
            isPrivate: false,
            ownerId: carol.id,
        },
    });

    const group4 = await prisma.communityGroup.create({
        data: {
            name: 'Career Growth & Interviews',
            description: 'Prepare for tech interviews, share career advice, and discuss strategies for professional growth in the tech industry.',
            isPrivate: true,
            ownerId: admin.id,
        },
    });

    const groups = [group1, group2, group3, group4];
    console.log(`✅ Created ${groups.length} community groups`);

    // ============================================
    // 3. ADD GROUP MEMBERS
    // ============================================
    console.log('\n👤 Adding group members...');

    const membershipData = [
        // React group — everyone joins
        ...allUsers.filter(u => u.id !== alice.id).map(u => ({ groupId: group1.id, userId: u.id })),
        // AI group
        { groupId: group2.id, userId: alice.id },
        { groupId: group2.id, userId: carol.id },
        { groupId: group2.id, userId: admin.id },
        // Design group
        { groupId: group3.id, userId: alice.id },
        { groupId: group3.id, userId: bob.id },
        { groupId: group3.id, userId: admin.id },
        // Career group
        ...allUsers.filter(u => u.id !== admin.id).map(u => ({ groupId: group4.id, userId: u.id })),
    ];

    let memberCount = 0;
    for (const data of membershipData) {
        try {
            await prisma.groupMember.create({ data });
            memberCount++;
        } catch {
            // skip duplicates
        }
    }
    console.log(`✅ Added ${memberCount} group memberships`);

    // ============================================
    // 4. CREATE COMMUNITY POSTS
    // ============================================
    console.log('\n📝 Creating community posts...');

    const postsData = [
        // ---- Public feed posts ----
        {
            content: '🚀 Just shipped my first full-stack app built with Next.js 16 and Prisma! The new Turbopack is insanely fast. Here\'s a thread on what I learned building it from scratch...',
            authorId: alice.id,
            visibility: 'PUBLIC' as const,
            imageUrls: [],
            linkUrls: ['https://nextjs.org/blog'],
        },
        {
            content: 'Hot take: TypeScript\'s type inference has gotten so good that you rarely need explicit type annotations anymore. The compiler just knows. What are your thoughts on this?',
            authorId: bob.id,
            visibility: 'PUBLIC' as const,
            imageUrls: [],
            linkUrls: [],
        },
        {
            content: 'Finally wrapped up my redesign of our component library. Went with a tokens-first approach — every color, spacing value, and shadow is driven by design tokens. Consistency is 🔑',
            authorId: carol.id,
            visibility: 'PUBLIC' as const,
            imageUrls: [],
            linkUrls: [],
        },
        {
            content: 'Pro tip for junior developers: Don\'t just learn frameworks — understand the fundamentals. Learn how HTTP works, how databases store data, how memory management works. The frameworks come and go, but fundamentals stay.',
            authorId: admin.id,
            visibility: 'PUBLIC' as const,
            imageUrls: [],
            linkUrls: [],
        },
        {
            content: 'Built a real-time collaborative whiteboard using WebSockets and Canvas API this weekend. The latency is under 50ms even with 10+ concurrent users. Really happy with how it turned out!',
            authorId: alice.id,
            visibility: 'PUBLIC' as const,
            imageUrls: [],
            linkUrls: [],
        },
        {
            content: 'Just completed the Stanford CS229 Machine Learning course. The math is intense but the concepts are beautiful. Highly recommend it to anyone wanting to deeply understand ML algorithms beyond just using libraries.',
            authorId: bob.id,
            visibility: 'PUBLIC' as const,
            imageUrls: [],
            linkUrls: ['https://cs229.stanford.edu'],
        },
        {
            content: 'Accessibility isn\'t optional — it\'s a responsibility. Today I audited our app with screen readers and found 14 issues. Fixed them all. Here\'s what I learned about building truly inclusive UIs...',
            authorId: carol.id,
            visibility: 'PUBLIC' as const,
            imageUrls: [],
            linkUrls: [],
        },
        {
            content: 'Excited to announce that Velonx just crossed 500 members! 🎉 Thank you all for making this community so vibrant. We have some amazing features coming soon — stay tuned!',
            authorId: admin.id,
            visibility: 'PUBLIC' as const,
            imageUrls: [],
            linkUrls: [],
            isPinned: true,
        },
        // ---- Group posts ----
        {
            content: 'Has anyone tried React Server Components with streaming SSR? I\'m seeing a 40% improvement in Time to First Byte. Here are my benchmarks...',
            authorId: alice.id,
            groupId: group1.id,
            visibility: 'GROUP' as const,
            imageUrls: [],
            linkUrls: [],
        },
        {
            content: 'Sharing my notes from today\'s deep dive into transformers architecture. The attention mechanism is elegant — essentially a learned lookup table. Thread below 👇',
            authorId: bob.id,
            groupId: group2.id,
            visibility: 'GROUP' as const,
            imageUrls: [],
            linkUrls: ['https://arxiv.org/abs/1706.03762'],
        },
        {
            content: 'New component library comparison: Radix UI vs Headless UI vs Ark UI. After using all three in production, here\'s my honest take on DX, accessibility, and customization...',
            authorId: carol.id,
            groupId: group3.id,
            visibility: 'GROUP' as const,
            imageUrls: [],
            linkUrls: [],
        },
        {
            content: 'I just received 3 offers after 45 days of interviewing. Here\'s my complete preparation strategy: DSA (2 hrs/day), system design (1 hr/day), and behavioral prep (30 min/day). AMA!',
            authorId: admin.id,
            groupId: group4.id,
            visibility: 'GROUP' as const,
            imageUrls: [],
            linkUrls: [],
        },
        // ---- More public posts for volume ----
        {
            content: 'Docker tip: Use multi-stage builds to keep your images small. My Node.js app image went from 1.2GB to 180MB just by switching to a multi-stage Dockerfile with alpine base.',
            authorId: alice.id,
            visibility: 'PUBLIC' as const,
            imageUrls: [],
            linkUrls: [],
        },
        {
            content: 'The best code is code you don\'t have to write. Before building a custom solution, check if there\'s a well-maintained open-source library that does it. Your time is better spent on business logic.',
            authorId: bob.id,
            visibility: 'PUBLIC' as const,
            imageUrls: [],
            linkUrls: [],
        },
        {
            content: 'Learned about the 60-30-10 rule in UI design today: 60% dominant color (background), 30% secondary color (cards/sections), 10% accent color (CTAs/highlights). Simple but powerful!',
            authorId: carol.id,
            visibility: 'PUBLIC' as const,
            imageUrls: [],
            linkUrls: [],
        },
    ];

    // Spread creation timestamps across the past 2 weeks
    const now = Date.now();
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;

    const posts = [];
    for (let i = 0; i < postsData.length; i++) {
        const { isPinned, ...data } = postsData[i] as typeof postsData[number] & { isPinned?: boolean };
        const createdAt = new Date(now - twoWeeksMs + (i / postsData.length) * twoWeeksMs);
        const post = await prisma.communityPost.create({
            data: {
                ...data,
                isPinned: isPinned || false,
                createdAt,
                updatedAt: createdAt,
            },
        });
        posts.push(post);
    }

    console.log(`✅ Created ${posts.length} community posts`);

    // ============================================
    // 5. ADD REACTIONS TO POSTS
    // ============================================
    console.log('\n❤️  Adding reactions to posts...');

    const reactionTypes = ['LIKE', 'LOVE', 'INSIGHTFUL', 'CELEBRATE'] as const;
    let reactionCount = 0;

    for (const post of posts) {
        // Each post gets 1-4 reactions from different users
        const reactors = allUsers.filter(u => u.id !== post.authorId);
        const numReactions = Math.min(reactors.length, 1 + Math.floor(Math.random() * 4));

        for (let i = 0; i < numReactions; i++) {
            try {
                await prisma.postReaction.create({
                    data: {
                        postId: post.id,
                        userId: reactors[i].id,
                        type: reactionTypes[i % reactionTypes.length],
                    },
                });
                reactionCount++;
            } catch {
                // skip duplicates
            }
        }
    }
    console.log(`✅ Added ${reactionCount} reactions`);

    // ============================================
    // 6. ADD COMMENTS TO POSTS
    // ============================================
    console.log('\n💬 Adding comments to posts...');

    const commentTexts = [
        'This is really insightful! Thanks for sharing.',
        'Great post! I had a similar experience.',
        'Totally agree with this. Well said!',
        'This is exactly what I needed to read today. Bookmarked!',
        'Can you elaborate more on this? Would love to learn more.',
        'Awesome work! Keep it up 🙌',
        'I\'ve been thinking about this too. Great perspective.',
        'Really well written. Shared this with my team.',
        'This changed my approach completely. Thank you!',
        'Interesting take! I see it a bit differently though...',
        'Love the practical advice here. Going to try this out.',
        'This reminds me of a similar pattern I saw in a Rust project.',
        'The benchmarks are impressive! What was your testing setup?',
        'Would be great to see a follow-up post on this topic.',
        'Saved this for reference. Super useful!',
    ];

    let commentCount = 0;
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const commenters = allUsers.filter(u => u.id !== post.authorId);
        // Most posts get 1-3 comments; some popular ones get more
        const numComments = i < 4 ? 3 : 1 + Math.floor(Math.random() * 2);

        for (let j = 0; j < Math.min(numComments, commenters.length); j++) {
            const commentDate = new Date(post.createdAt.getTime() + (j + 1) * 3600 * 1000); // stagger by hours
            await prisma.postComment.create({
                data: {
                    postId: post.id,
                    authorId: commenters[j].id,
                    content: commentTexts[(i * 3 + j) % commentTexts.length],
                    createdAt: commentDate,
                    updatedAt: commentDate,
                },
            });
            commentCount++;
        }
    }
    console.log(`✅ Added ${commentCount} comments`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n🎉 Community data seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Follows: ${followCount}`);
    console.log(`   - Community Groups: ${groups.length}`);
    console.log(`   - Group Memberships: ${memberCount}`);
    console.log(`   - Community Posts: ${posts.length}`);
    console.log(`   - Reactions: ${reactionCount}`);
    console.log(`   - Comments: ${commentCount}`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding community data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
