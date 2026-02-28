#!/usr/bin/env node

/**
 * Test script to verify Cloudinary configuration
 * Run with: node scripts/test-cloudinary-config.js
 */

require('dotenv').config({ path: '.env' });

console.log('=== Cloudinary Configuration Test ===\n');

const config = {
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

console.log('Environment Variables:');
console.log('---------------------');
Object.entries(config).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${key.includes('SECRET') ? '***' : value}`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
  }
});

console.log('\n=== Configuration Status ===');
const allSet = Object.values(config).every(v => !!v);
if (allSet) {
  console.log('✅ All Cloudinary environment variables are configured');
} else {
  console.log('❌ Some Cloudinary environment variables are missing');
  console.log('\nPlease ensure the following are set in your .env file:');
  console.log('- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
  console.log('- CLOUDINARY_API_KEY');
  console.log('- CLOUDINARY_API_SECRET');
}

console.log('\n=== Testing Cloudinary Connection ===');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: config.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

// Test API connection
cloudinary.api.ping()
  .then(() => {
    console.log('✅ Successfully connected to Cloudinary API');
  })
  .catch((error) => {
    console.log('❌ Failed to connect to Cloudinary API');
    console.error('Error:', error.message);
  });
