import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.DATABASE_URL || 'mongodb+srv://contactvelonx89_db_user:fzOPRW3yoHfP3cyp@velonx.fhdnc9w.mongodb.net/velonx?retryWrites=true&w=majority';

async function main() {
  console.log('🌱 Starting direct MongoDB seed...');
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('velonx');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.collection('users').deleteMany({});
    await db.collection('events').deleteMany({});
    await db.collection('projects').deleteMany({});
    await db.collection('mentors').deleteMany({});
    await db.collection('resources').deleteMany({});
    await db.collection('blog_posts').deleteMany({});
    
    // Create Users
    console.log('👥 Creating users...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const studentPassword = await bcrypt.hash('password123', 10);
    
    const usersResult = await db.collection('users').insertMany([
      {
        name: 'Admin User',
        email: 'admin@velonx.com',
        password: adminPassword,
        role: 'ADMIN',
        bio: 'Platform administrator',
        xp: 5000,
        level: 8,
        currentStreak: 0,
        longestStreak: 0,
        lastLoginDate: null,
        image: '/avatars/robot-hero.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: studentPassword,
        role: 'STUDENT',
        bio: 'Full-stack developer passionate about React and Node.js',
        xp: 2500,
        level: 5,
        currentStreak: 0,
        longestStreak: 0,
        lastLoginDate: null,
        image: '/avatars/space-cat.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: studentPassword,
        role: 'STUDENT',
        bio: 'Data science enthusiast learning machine learning',
        xp: 1800,
        level: 4,
        currentStreak: 0,
        longestStreak: 0,
        lastLoginDate: null,
        image: '/avatars/cool-ape.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    
    const adminId = usersResult.insertedIds[0];
    const aliceId = usersResult.insertedIds[1];
    
    console.log(`✅ Created 3 users`);
    
    // Create Events
    console.log('📅 Creating events...');
    await db.collection('events').insertMany([
      {
        title: 'Spring Hackathon 2026',
        description: 'Join us for a 48-hour coding marathon to build innovative solutions.',
        type: 'HACKATHON',
        date: new Date('2026-03-15T09:00:00Z'),
        endDate: new Date('2026-03-17T18:00:00Z'),
        location: 'Tech Hub, Building A',
        maxSeats: 100,
        status: 'UPCOMING',
        creatorId: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'React Advanced Workshop',
        description: 'Deep dive into React hooks and performance optimization.',
        type: 'WORKSHOP',
        date: new Date('2026-02-20T14:00:00Z'),
        maxSeats: 50,
        status: 'UPCOMING',
        creatorId: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    
    console.log(`✅ Created 2 events`);
    
    // Create Projects
    console.log('🚀 Creating projects...');
    await db.collection('projects').insertOne({
      title: 'E-Commerce Platform',
      description: 'A full-stack e-commerce platform with payment integration.',
      techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      status: 'IN_PROGRESS',
      githubUrl: 'https://github.com/example/ecommerce',
      ownerId: aliceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log(`✅ Created 1 project`);
    
    // Create Mentors
    console.log('🎓 Creating mentors...');
    await db.collection('mentors').insertOne({
      name: 'Dr. Sarah Chen',
      email: 'sarah.chen@techcorp.com',
      expertise: ['Machine Learning', 'Data Science', 'Python'],
      company: 'TechCorp AI',
      bio: 'PhD in Computer Science with 10+ years of experience in AI.',
      rating: 4.8,
      totalSessions: 45,
      available: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log(`✅ Created 1 mentor`);
    
    // Create Resources
    console.log('📚 Creating resources...');
    await db.collection('resources').insertOne({
      title: 'React Documentation',
      description: 'Official React documentation with comprehensive guides.',
      category: 'WEB',
      type: 'DOCUMENTATION',
      url: 'https://react.dev',
      accessCount: 245,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log(`✅ Created 1 resource`);
    
    // Create Blog Posts
    console.log('📝 Creating blog posts...');
    await db.collection('blog_posts').insertOne({
      title: 'Getting Started with Next.js 16',
      content: 'Next.js 16 introduces exciting new features...',
      excerpt: 'Explore the new features in Next.js 16.',
      tags: ['Next.js', 'React', 'Web Development'],
      status: 'PUBLISHED',
      publishedAt: new Date('2026-01-10T10:00:00Z'),
      authorId: adminId,
      createdAt: new Date(),
      updatedAt: new Date(),
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
  } finally {
    await client.close();
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  });
