import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple database seed...');

  try {
    // Create Users
    console.log('👥 Creating users...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const studentPassword = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@velonx.com',
        password: adminPassword,
        role: 'ADMIN',
        bio: 'Platform administrator',
        xp: 5000,
        level: 8,
        image: '/avatars/robot-hero.png',
      },
    });

    const alice = await prisma.user.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: studentPassword,
        role: 'STUDENT',
        bio: 'Full-stack developer passionate about React and Node.js',
        xp: 2500,
        level: 5,
        image: '/avatars/space-cat.png',
      },
    });

    const bob = await prisma.user.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: studentPassword,
        role: 'STUDENT',
        bio: 'Data science enthusiast learning machine learning',
        xp: 1800,
        level: 4,
        image: '/avatars/cool-ape.png',
      },
    });

    console.log(`✅ Created 3 users`);

    // Create Events
    console.log('📅 Creating events...');
    const event1 = await prisma.event.create({
      data: {
        title: 'Spring Hackathon 2026',
        description: 'Join us for a 48-hour coding marathon to build innovative solutions.',
        type: 'HACKATHON',
        date: new Date('2026-03-15T09:00:00Z'),
        endDate: new Date('2026-03-17T18:00:00Z'),
        location: 'Tech Hub, Building A',
        maxSeats: 100,
        status: 'UPCOMING',
        creatorId: admin.id,
      },
    });

    const event2 = await prisma.event.create({
      data: {
        title: 'React Advanced Workshop',
        description: 'Deep dive into React hooks and performance optimization.',
        type: 'WORKSHOP',
        date: new Date('2026-02-20T14:00:00Z'),
        maxSeats: 50,
        status: 'UPCOMING',
        creatorId: admin.id,
      },
    });

    console.log(`✅ Created 2 events`);

    // Create Projects
    console.log('🚀 Creating projects...');
    const project1 = await prisma.project.create({
      data: {
        title: 'E-Commerce Platform',
        description: 'A full-stack e-commerce platform with payment integration.',
        techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        status: 'IN_PROGRESS',
        githubUrl: 'https://github.com/example/ecommerce',
        ownerId: alice.id,
      },
    });

    console.log(`✅ Created 1 project`);

    // Create Mentors
    console.log('🎓 Creating mentors...');
    await prisma.mentor.create({
      data: {
        name: 'Dr. Sarah Chen',
        email: 'sarah.chen@techcorp.com',
        expertise: ['Machine Learning', 'Data Science', 'Python'],
        company: 'TechCorp AI',
        bio: 'PhD in Computer Science with 10+ years of experience in AI.',
        rating: 4.8,
        totalSessions: 45,
        available: true,
      },
    });

    console.log(`✅ Created 1 mentor`);

    // Create Resources
    console.log('📚 Creating resources...');
    await prisma.resource.create({
      data: {
        title: 'React Documentation',
        description: 'Official React documentation with comprehensive guides.',
        category: 'WEB',
        type: 'DOCUMENTATION',
        url: 'https://react.dev',
        accessCount: 245,
      },
    });

    console.log(`✅ Created 1 resource`);

    // Create Blog Posts
    console.log('📝 Creating blog posts...');
    await prisma.blogPost.create({
      data: {
        title: 'Getting Started with Next.js 16',
        content: 'Next.js 16 introduces exciting new features...',
        excerpt: 'Explore the new features in Next.js 16.',
        tags: ['Next.js', 'React', 'Web Development'],
        status: 'PUBLISHED',
        publishedAt: new Date('2026-01-10T10:00:00Z'),
        authorId: admin.id,
      },
    });

    console.log(`✅ Created 1 blog post`);

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('🔐 Test Credentials:');
    console.log('   Admin: admin@velonx.com / admin123');
    console.log('   Student: alice@example.com / password123');
    console.log('   Student: bob@example.com / password123');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
