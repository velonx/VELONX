import { prisma } from "../src/lib/prisma";

async function check() {
  console.log("Keys on prisma object:");
  const keys = Object.keys(prisma).filter(k => !k.startsWith("$"));
  console.log(keys);
  
  if ("eventReward" in prisma) {
    console.log("SUCCESS: eventReward exists");
  } else {
    console.log("FAILURE: eventReward DOES NOT exist");
  }
}

check().catch(console.error);
