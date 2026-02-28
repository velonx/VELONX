#!/usr/bin/env node

/**
 * Server Diagnostic Script
 * Checks if the development environment is properly configured
 */

require('dotenv').config({ path: '.env' });

console.log('=== VELONX Server Diagnostic ===\n');

// Check 1: Environment Variables
console.log('1. Environment Variables Check:');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET');
console.log('   CLOUDINARY_CLOUD_NAME:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✅ SET' : '❌ NOT SET');
console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('   AUTH_SECRET:', process.env.AUTH_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('   UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? '✅ SET' : '❌ NOT SET');
console.log('   UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? '✅ SET' : '❌ NOT SET');

// Check 2: Package.json scripts
console.log('\n2. Package.json Scripts Check:');
const packageJson = require('../package.json');
console.log('   dev script:', packageJson.scripts.dev);
if (packageJson.scripts.dev === 'node server.js') {
  console.log('   ✅ Correctly configured to use custom server');
} else {
  console.log('   ⚠️  Not using custom server - this may cause issues');
}

// Check 3: Server.js exists
console.log('\n3. Server File Check:');
const fs = require('fs');
const path = require('path');
const serverPath = path.join(__dirname, '..', 'server.js');
if (fs.existsSync(serverPath)) {
  console.log('   ✅ server.js exists');
} else {
  console.log('   ❌ server.js not found');
}

// Check 4: Prisma client
console.log('\n4. Prisma Client Check:');
try {
  const prismaPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
  if (fs.existsSync(prismaPath)) {
    console.log('   ✅ Prisma client generated');
  } else {
    console.log('   ⚠️  Prisma client not found - run: npx prisma generate');
  }
} catch (error) {
  console.log('   ❌ Error checking Prisma client:', error.message);
}

// Check 5: Database connection
console.log('\n5. Database Connection Test:');
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  if (url.startsWith('mongodb://') || url.startsWith('mongodb+srv://')) {
    console.log('   ✅ Valid MongoDB connection string format');
    
    // Try to connect
    (async () => {
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.$connect();
        console.log('   ✅ Successfully connected to database');
        await prisma.$disconnect();
      } catch (error) {
        console.log('   ❌ Failed to connect to database:', error.message);
      }
    })();
  } else {
    console.log('   ❌ Invalid MongoDB connection string format');
  }
} else {
  console.log('   ❌ DATABASE_URL not set');
}

// Check 6: Port availability
console.log('\n6. Port Availability Check:');
const net = require('net');
const port = parseInt(process.env.PORT || '3000', 10);

const server = net.createServer();
server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`   ⚠️  Port ${port} is already in use`);
    console.log(`   Run: lsof -ti:${port} | xargs kill -9`);
  } else {
    console.log('   ❌ Error checking port:', err.message);
  }
});

server.once('listening', () => {
  console.log(`   ✅ Port ${port} is available`);
  server.close();
});

server.listen(port);

// Summary
console.log('\n=== Summary ===');
console.log('If all checks pass, run: npm run dev');
console.log('If database connection fails, check your MongoDB connection string');
console.log('If port is in use, kill the process or use a different port');
console.log('\nFor detailed troubleshooting, see: PDF_UPLOAD_ERROR_RESOLUTION.md');
