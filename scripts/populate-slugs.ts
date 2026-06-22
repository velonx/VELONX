/**
 * Script to populate slugs for existing Users, Events, and Opportunities.
 * 
 * This script generates unique slugs for all documents who don't have one yet.
 * It resolves the duplicate null key error when trying to build unique indexes on MongoDB.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate a URL slug from text
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word characters
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores/hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // Trim hyphens
}

/**
 * Get a unique URL slug for user profile
 */
async function getUniqueUserSlug(name: string, userId: string): Promise<string> {
  const baseSlug = generateSlug(name || "user");
  const existingUserWithSlug = await prisma.user.findFirst({
    where: { slug: baseSlug }
  });
  if (!existingUserWithSlug || existingUserWithSlug.id === userId) {
    return baseSlug;
  }
  let uniqueSlug = baseSlug;
  let counter = 1;
  let exists = true;
  while (exists) {
    uniqueSlug = `${baseSlug}-${counter}`;
    const check = await prisma.user.findUnique({
      where: { slug: uniqueSlug }
    });
    if (!check) {
      exists = false;
    } else {
      counter++;
    }
  }
  return uniqueSlug;
}

/**
 * Get a unique URL slug for event
 */
async function getUniqueEventSlug(title: string, eventId: string): Promise<string> {
  const baseSlug = generateSlug(title || "event");
  const existingEventWithSlug = await prisma.event.findFirst({
    where: { slug: baseSlug }
  });
  if (!existingEventWithSlug || existingEventWithSlug.id === eventId) {
    return baseSlug;
  }
  let uniqueSlug = baseSlug;
  let counter = 1;
  let exists = true;
  while (exists) {
    uniqueSlug = `${baseSlug}-${counter}`;
    const check = await prisma.event.findUnique({
      where: { slug: uniqueSlug }
    });
    if (!check) {
      exists = false;
    } else {
      counter++;
    }
  }
  return uniqueSlug;
}

/**
 * Get a unique URL slug for opportunity
 */
async function getUniqueOpportunitySlug(title: string, company: string, oppId: string): Promise<string> {
  const nameSource = company ? `${title} at ${company}` : title;
  const baseSlug = generateSlug(nameSource || "opportunity");
  const existingOppWithSlug = await prisma.opportunity.findFirst({
    where: { slug: baseSlug }
  });
  if (!existingOppWithSlug || existingOppWithSlug.id === oppId) {
    return baseSlug;
  }
  let uniqueSlug = baseSlug;
  let counter = 1;
  let exists = true;
  while (exists) {
    uniqueSlug = `${baseSlug}-${counter}`;
    const check = await prisma.opportunity.findUnique({
      where: { slug: uniqueSlug }
    });
    if (!check) {
      exists = false;
    } else {
      counter++;
    }
  }
  return uniqueSlug;
}

/**
 * Main function to populate slugs
 */
async function populateAllSlugs() {
  try {
    console.log('=== Starting Slug Population ===');

    // 1. POPULATE USER SLUGS
    console.log('\n--- Processing Users ---');
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true, slug: true }
    });
    const usersWithoutSlugs = allUsers.filter(user => !user.slug);
    console.log(`Found ${usersWithoutSlugs.length} users without slugs.`);
    
    let userSuccess = 0;
    for (const user of usersWithoutSlugs) {
      try {
        const displayName = user.name || user.email.split('@')[0] || 'user';
        const slug = await getUniqueUserSlug(displayName, user.id);
        await prisma.user.update({
          where: { id: user.id },
          data: { slug }
        });
        userSuccess++;
      } catch (err) {
        console.error(`✗ Failed for user ${user.email}:`, err);
      }
    }
    console.log(`✓ Populated ${userSuccess} user slugs.`);

    // 2. POPULATE EVENT SLUGS
    console.log('\n--- Processing Events ---');
    const allEvents = await prisma.event.findMany({
      select: { id: true, title: true, slug: true }
    });
    const eventsWithoutSlugs = allEvents.filter(event => !event.slug);
    console.log(`Found ${eventsWithoutSlugs.length} events without slugs.`);
    
    let eventSuccess = 0;
    for (const event of eventsWithoutSlugs) {
      try {
        const slug = await getUniqueEventSlug(event.title, event.id);
        await prisma.event.update({
          where: { id: event.id },
          data: { slug }
        });
        eventSuccess++;
      } catch (err) {
        console.error(`✗ Failed for event ${event.title}:`, err);
      }
    }
    console.log(`✓ Populated ${eventSuccess} event slugs.`);

    // 3. POPULATE OPPORTUNITY SLUGS
    console.log('\n--- Processing Opportunities ---');
    const allOpps = await prisma.opportunity.findMany({
      select: { id: true, title: true, company: true, slug: true }
    });
    const oppsWithoutSlugs = allOpps.filter(opp => !opp.slug);
    console.log(`Found ${oppsWithoutSlugs.length} opportunities without slugs.`);
    
    let oppSuccess = 0;
    for (const opp of oppsWithoutSlugs) {
      try {
        const slug = await getUniqueOpportunitySlug(opp.title, opp.company, opp.id);
        await prisma.opportunity.update({
          where: { id: opp.id },
          data: { slug }
        });
        oppSuccess++;
      } catch (err) {
        console.error(`✗ Failed for opportunity ${opp.title}:`, err);
      }
    }
    console.log(`✓ Populated ${oppSuccess} opportunity slugs.`);

    console.log('\n=== Summary ===');
    console.log(`Users populated: ${userSuccess}/${usersWithoutSlugs.length}`);
    console.log(`Events populated: ${eventSuccess}/${eventsWithoutSlugs.length}`);
    console.log(`Opportunities populated: ${oppSuccess}/${oppsWithoutSlugs.length}`);
    console.log('\nAll database records now have valid slugs. You can now safely run: npx prisma db push');

  } catch (error) {
    console.error('Error populating slugs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateAllSlugs()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
