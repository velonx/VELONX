import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Check if data already exists
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('⚠️  Database already contains data. Skipping seed...');
    console.log('   To re-seed, manually clear the database first.');
    return;
  }

  // Create Users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@velonx.com',
      password: hashedPassword,
      role: 'ADMIN',
      bio: 'Platform administrator',
      xp: 5000,
      level: 8,
      image: '/avatars/robot-hero.png',
    },
  });

  const students = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: hashedPassword,
        role: 'STUDENT',
        bio: 'Full-stack developer passionate about React and Node.js',
        xp: 2500,
        level: 5,
        image: '/avatars/space-cat.png',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: hashedPassword,
        role: 'STUDENT',
        bio: 'Data science enthusiast learning machine learning',
        xp: 1800,
        level: 4,
        image: '/avatars/cool-ape.png',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Carol Williams',
        email: 'carol@example.com',
        password: hashedPassword,
        role: 'STUDENT',
        bio: 'UI/UX designer who codes',
        xp: 3200,
        level: 6,
        image: '/avatars/wizard-owl.png',
      },
    }),
    prisma.user.create({
      data: {
        name: 'David Brown',
        email: 'david@example.com',
        password: hashedPassword,
        role: 'STUDENT',
        bio: 'Mobile app developer specializing in React Native',
        xp: 1200,
        level: 3,
        image: '/avatars/punk-dog.png',
      },
    }),
  ]);

  console.log(`✅ Created ${students.length + 1} users`);

  // Create Events
  console.log('📅 Creating events...');
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Spring Hackathon 2026',
        description: 'Join us for a 48-hour coding marathon to build innovative solutions for real-world problems.',
        type: 'HACKATHON',
        date: new Date('2026-03-15T09:00:00Z'),
        endDate: new Date('2026-03-17T18:00:00Z'),
        location: 'Tech Hub, Building A',
        imageUrl: '/illustrations/community-members.png',
        maxSeats: 100,
        status: 'UPCOMING',
        creatorId: admin.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'React Advanced Workshop',
        description: 'Deep dive into React hooks, context, and performance optimization techniques.',
        type: 'WORKSHOP',
        date: new Date('2026-02-20T14:00:00Z'),
        endDate: new Date('2026-02-20T17:00:00Z'),
        location: 'Online - Zoom',
        maxSeats: 50,
        status: 'UPCOMING',
        creatorId: admin.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Career in Tech Webinar',
        description: 'Learn from industry experts about career paths in software development.',
        type: 'WEBINAR',
        date: new Date('2026-02-10T18:00:00Z'),
        endDate: new Date('2026-02-10T19:30:00Z'),
        location: 'Online - YouTube Live',
        maxSeats: 200,
        status: 'UPCOMING',
        creatorId: admin.id,
      },
    }),
  ]);

  console.log(`✅ Created ${events.length} events`);

  // Create Event Attendees
  console.log('🎫 Registering event attendees...');
  await Promise.all([
    prisma.eventAttendee.create({
      data: {
        eventId: events[0].id,
        userId: students[0].id,
        status: 'REGISTERED',
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[0].id,
        userId: students[1].id,
        status: 'REGISTERED',
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[1].id,
        userId: students[0].id,
        status: 'REGISTERED',
      },
    }),
    prisma.eventAttendee.create({
      data: {
        eventId: events[1].id,
        userId: students[2].id,
        status: 'REGISTERED',
      },
    }),
  ]);

  console.log('✅ Registered event attendees');

  // Create Projects
  console.log('🚀 Creating projects...');
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: 'E-Commerce Platform',
        description: 'A full-stack e-commerce platform with payment integration and admin dashboard.',
        techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        status: 'IN_PROGRESS',
        githubUrl: 'https://github.com/example/ecommerce',
        ownerId: students[0].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'AI Chatbot',
        description: 'An intelligent chatbot using natural language processing for customer support.',
        techStack: ['Python', 'TensorFlow', 'Flask', 'React'],
        status: 'COMPLETED',
        githubUrl: 'https://github.com/example/ai-chatbot',
        liveUrl: 'https://ai-chatbot-demo.com',
        outcomes: 'Successfully deployed and handling 1000+ conversations daily',
        ownerId: students[1].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'Task Management App',
        description: 'A collaborative task management tool with real-time updates.',
        techStack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
        status: 'PLANNING',
        ownerId: students[2].id,
      },
    }),
  ]);

  console.log(`✅ Created ${projects.length} projects`);

  // Create Project Members
  console.log('👨‍💻 Adding project members...');
  await Promise.all([
    prisma.projectMember.create({
      data: {
        projectId: projects[0].id,
        userId: students[1].id,
        role: 'Backend Developer',
      },
    }),
    prisma.projectMember.create({
      data: {
        projectId: projects[0].id,
        userId: students[2].id,
        role: 'UI/UX Designer',
      },
    }),
    prisma.projectMember.create({
      data: {
        projectId: projects[1].id,
        userId: students[0].id,
        role: 'Frontend Developer',
      },
    }),
  ]);

  console.log('✅ Added project members');

  // Create Mentors
  console.log('🎓 Creating mentors...');
  const mentors = await Promise.all([
    prisma.mentor.create({
      data: {
        name: 'Dr. Sarah Chen',
        email: 'sarah.chen@techcorp.com',
        expertise: ['Machine Learning', 'Data Science', 'Python'],
        company: 'TechCorp AI',
        bio: 'PhD in Computer Science with 10+ years of experience in AI and machine learning.',
        rating: 4.8,
        totalSessions: 45,
        available: true,
        imageUrl: '/illustrations/expert-avatar.png',
      },
    }),
    prisma.mentor.create({
      data: {
        name: 'John Martinez',
        email: 'john.martinez@webdev.io',
        expertise: ['React', 'Node.js', 'Full-Stack Development'],
        company: 'WebDev Solutions',
        bio: 'Senior full-stack developer specializing in modern web technologies.',
        rating: 4.9,
        totalSessions: 62,
        available: true,
      },
    }),
    prisma.mentor.create({
      data: {
        name: 'Emily Taylor',
        email: 'emily.taylor@designstudio.com',
        expertise: ['UI/UX Design', 'Figma', 'Design Systems'],
        company: 'Creative Design Studio',
        bio: 'Award-winning designer with expertise in creating user-centered digital experiences.',
        rating: 4.7,
        totalSessions: 38,
        available: true,
      },
    }),
  ]);

  console.log(`✅ Created ${mentors.length} mentors`);

  // Create Resources
  console.log('📚 Creating resources...');
  const resources = await Promise.all([
    prisma.resource.create({
      data: {
        title: 'React Documentation',
        description: 'Official React documentation with comprehensive guides and API reference.',
        category: 'WEB',
        type: 'DOCUMENTATION',
        url: 'https://react.dev',
        accessCount: 245,
      },
    }),
    prisma.resource.create({
      data: {
        title: 'JavaScript: The Good Parts',
        description: 'Classic book on JavaScript best practices and patterns.',
        category: 'PROGRAMMING',
        type: 'BOOK',
        url: 'https://example.com/js-good-parts',
        accessCount: 128,
      },
    }),
    prisma.resource.create({
      data: {
        title: 'Full Stack Open Course',
        description: 'Free online course covering modern web development with React, Node.js, and more.',
        category: 'WEB',
        type: 'COURSE',
        url: 'https://fullstackopen.com',
        accessCount: 312,
      },
    }),
    prisma.resource.create({
      data: {
        title: 'Figma Design Tutorial',
        description: 'Comprehensive video tutorial series on UI/UX design with Figma.',
        category: 'DESIGN',
        type: 'VIDEO',
        url: 'https://youtube.com/figma-tutorial',
        accessCount: 89,
      },
    }),
  ]);

  console.log(`✅ Created ${resources.length} resources`);

  // Create Blog Posts
  console.log('📝 Creating blog posts...');
  const blogPosts = await Promise.all([
    prisma.blogPost.create({
      data: {
        title: 'Getting Started with Next.js 16',
        content: 'Next.js 16 introduces exciting new features including improved App Router, enhanced server components, and better performance. In this post, we\'ll explore the key changes and how to migrate your existing applications...',
        excerpt: 'Explore the new features in Next.js 16 and learn how to get started.',
        tags: ['Next.js', 'React', 'Web Development'],
        status: 'PUBLISHED',
        publishedAt: new Date('2026-01-10T10:00:00Z'),
        authorId: admin.id,
      },
    }),
    prisma.blogPost.create({
      data: {
        title: 'Building Scalable APIs with Node.js',
        content: 'Learn best practices for building scalable and maintainable REST APIs using Node.js, Express, and MongoDB. We\'ll cover authentication, error handling, testing, and deployment strategies...',
        excerpt: 'Best practices for building production-ready Node.js APIs.',
        tags: ['Node.js', 'API', 'Backend'],
        status: 'PUBLISHED',
        publishedAt: new Date('2026-01-05T14:00:00Z'),
        authorId: students[0].id,
      },
    }),
    prisma.blogPost.create({
      data: {
        title: 'Machine Learning for Beginners',
        content: 'An introduction to machine learning concepts, algorithms, and practical applications. This guide will help you understand the fundamentals and get started with your first ML project...',
        excerpt: 'A beginner-friendly introduction to machine learning.',
        tags: ['Machine Learning', 'AI', 'Python'],
        status: 'DRAFT',
        authorId: students[1].id,
      },
    }),
  ]);

  console.log(`✅ Created ${blogPosts.length} blog posts`);

  // Create Meetings
  console.log('🤝 Creating meetings...');
  const meetings = await Promise.all([
    prisma.meeting.create({
      data: {
        title: 'Project Kickoff Meeting',
        description: 'Initial meeting to discuss project requirements and timeline.',
        date: new Date('2026-02-15T10:00:00Z'),
        duration: 60,
        platform: 'Zoom',
        meetingLink: 'https://zoom.us/j/123456789',
        creatorId: students[0].id,
      },
    }),
    prisma.meeting.create({
      data: {
        title: 'Mentorship Session: React Best Practices',
        description: 'One-on-one mentorship session covering React hooks and state management.',
        date: new Date('2026-02-18T15:00:00Z'),
        duration: 45,
        platform: 'Google Meet',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        creatorId: students[2].id,
      },
    }),
  ]);

  console.log(`✅ Created ${meetings.length} meetings`);

  // Create Meeting Attendees
  console.log('📞 Adding meeting attendees...');
  await Promise.all([
    prisma.meetingAttendee.create({
      data: {
        meetingId: meetings[0].id,
        userId: students[1].id,
        status: 'ACCEPTED',
      },
    }),
    prisma.meetingAttendee.create({
      data: {
        meetingId: meetings[0].id,
        userId: students[2].id,
        status: 'ACCEPTED',
      },
    }),
    prisma.meetingAttendee.create({
      data: {
        meetingId: meetings[1].id,
        userId: students[0].id,
        status: 'INVITED',
      },
    }),
  ]);

  console.log('✅ Added meeting attendees');

  // Create User Requests
  console.log('📋 Creating user requests...');
  await Promise.all([
    prisma.userRequest.create({
      data: {
        userId: students[3].id,
        type: 'ACCOUNT_APPROVAL',
        status: 'PENDING',
      },
    }),
    prisma.userRequest.create({
      data: {
        userId: students[0].id,
        type: 'PROJECT_SUBMISSION',
        status: 'APPROVED',
        reviewedBy: admin.id,
        reviewedAt: new Date('2026-01-12T09:00:00Z'),
      },
    }),
  ]);

  console.log('✅ Created user requests');

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Users: ${students.length + 1} (1 admin, ${students.length} students)`);
  console.log(`   - Events: ${events.length}`);
  console.log(`   - Projects: ${projects.length}`);
  console.log(`   - Mentors: ${mentors.length}`);
  console.log(`   - Resources: ${resources.length}`);
  console.log(`   - Blog Posts: ${blogPosts.length}`);
  console.log(`   - Meetings: ${meetings.length}`);
  console.log('');
  console.log('🔐 Test Credentials:');
  console.log('   Admin: admin@velonx.com / password123');
  console.log('   Student: alice@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
