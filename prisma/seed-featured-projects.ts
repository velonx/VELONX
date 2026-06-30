import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Adding featured projects: UnityDrive & KeyRacer...');

  // Find the admin user (or any existing user) to use as owner
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminUser) {
    console.error('❌ No admin user found. Please ensure the database has at least one user.');
    process.exit(1);
  }

  console.log(`✅ Found admin user: ${adminUser.name} (${adminUser.email})`);

  // Check if UnityDrive already exists
  const existingUnity = await prisma.project.findFirst({
    where: { title: 'UnityDrive' },
  });

  if (!existingUnity) {
    const unityDrive = await prisma.project.create({
      data: {
        title: 'UnityDrive',
        description:
          'An NGO Connect Platform bridging the gap between nonprofits and volunteers. UnityDrive enables real-time coordination, campaign management, and community-driven social impact — connecting organisations with passionate volunteers across India.',
        techStack: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'Node.js'],
        status: 'IN_PROGRESS',
        category: 'WEB_DEV',
        difficulty: 'INTERMEDIATE',
        liveUrl: 'https://unitydrive.netlify.app',
        ownerId: adminUser.id,
      },
    });
    console.log(`✅ Created project: ${unityDrive.title} (${unityDrive.id})`);
  } else {
    console.log(`⚠️  UnityDrive already exists (${existingUnity.id}), skipping.`);
  }

  // Check if KeyRacer already exists
  const existingKeyRacer = await prisma.project.findFirst({
    where: { title: 'KeyRacer' },
  });

  if (!existingKeyRacer) {
    const keyRacer = await prisma.project.create({
      data: {
        title: 'KeyRacer',
        description:
          'A competitive real-time typing race platform built for developers. KeyRacer features live multiplayer races, global leaderboards, and code-snippet typing challenges designed to sharpen keyboard speed and programming muscle memory.',
        techStack: ['React', 'JavaScript', 'WebSockets', 'Node.js', 'CSS'],
        status: 'IN_PROGRESS',
        category: 'WEB_DEV',
        difficulty: 'INTERMEDIATE',
        liveUrl: 'https://keyracer.in',
        ownerId: adminUser.id,
      },
    });
    console.log(`✅ Created project: ${keyRacer.title} (${keyRacer.id})`);
  } else {
    console.log(`⚠️  KeyRacer already exists (${existingKeyRacer.id}), skipping.`);
  }

  console.log('');
  console.log('🎉 Featured projects added successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
