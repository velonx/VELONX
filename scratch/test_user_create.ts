import { prisma } from "../src/lib/prisma";
import { generateReferralCode } from "../src/lib/services/referral.service";

async function test() {
  const user = {
    id: "some-uuid-from-next-auth",
    name: "Google User Test",
    email: `google-test-${Date.now()}@example.com`,
    image: "https://lh3.googleusercontent.com/a/default-user",
    emailVerified: null,
  };
  
  console.log("Simulating createUser with:", user);
  const referralCode = await generateReferralCode();
  const { id, ...userData } = user;
  
  const newUser = await prisma.user.create({
    data: {
      ...userData,
      emailVerified: userData.emailVerified || new Date(),
      referralCode,
    },
  });
  
  console.log("SUCCESS: Created user:", newUser);
}

test().catch(console.error).finally(() => prisma.$disconnect());
