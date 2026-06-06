const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const opportunities = await prisma.opportunity.findMany();
  console.log('Seeded opportunities total:', opportunities.length);
  console.log('Opportunities details:', JSON.stringify(opportunities, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
