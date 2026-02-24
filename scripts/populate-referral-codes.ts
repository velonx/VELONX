/**
 * Script to populate referral codes for existing users
 * 
 * This script generates unique referral codes for all users who don't have one yet.
 * It uses crypto.randomBytes for secure code generation and handles collision detection.
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Generate a random 8-character alphanumeric referral code
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(8);
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  
  return code;
}

/**
 * Generate a unique referral code with collision detection
 */
async function generateUniqueReferralCode(maxAttempts = 10): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateReferralCode();
    
    // Check if code already exists
    const existing = await prisma.user.findUnique({
      where: { referralCode: code }
    });
    
    if (!existing) {
      return code;
    }
    
    console.log(`Collision detected for code ${code}, retrying... (attempt ${attempt + 1}/${maxAttempts})`);
  }
  
  throw new Error('Failed to generate unique referral code after max attempts');
}

/**
 * Main function to populate referral codes
 */
async function populateReferralCodes() {
  try {
    console.log('Starting referral code population...');
    
    // Find all users without referral codes
    // Get all users and filter for those without codes
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        referralCode: true
      }
    });
    
    const usersWithoutCodes = allUsers.filter(user => !user.referralCode);
    
    console.log(`Found ${usersWithoutCodes.length} users without referral codes`);
    
    if (usersWithoutCodes.length === 0) {
      console.log('All users already have referral codes. Nothing to do.');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each user
    for (const user of usersWithoutCodes) {
      try {
        const code = await generateUniqueReferralCode();
        
        await prisma.user.update({
          where: { id: user.id },
          data: { referralCode: code }
        });
        
        successCount++;
        console.log(`✓ Generated code ${code} for user ${user.email} (${user.name || 'No name'})`);
      } catch (error) {
        errorCount++;
        console.error(`✗ Failed to generate code for user ${user.email}:`, error);
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`Total users processed: ${usersWithoutCodes.length}`);
    console.log(`Successfully generated codes: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    
    // Verify all users now have codes
    const allUsersAfter = await prisma.user.findMany({
      select: { referralCode: true }
    });
    const remainingWithoutCodes = allUsersAfter.filter(u => !u.referralCode).length;
    
    if (remainingWithoutCodes === 0) {
      console.log('\n✓ All users now have referral codes!');
    } else {
      console.log(`\n⚠ Warning: ${remainingWithoutCodes} users still without referral codes`);
    }
    
  } catch (error) {
    console.error('Error populating referral codes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateReferralCodes()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });
