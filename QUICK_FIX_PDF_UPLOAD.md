# Quick Fix: PDF Upload 500 Error

## The Problem

You're getting HTTP 500 errors when uploading PDFs and an empty fetch error from the resources hook. This is caused by the database not being initialized properly.

## The Solution (3 Steps)

### Step 1: Run Diagnostic

```bash
cd VELONX
node scripts/diagnose-server.js
```

This will check:
- Environment variables are set
- Database connection works
- Server is configured correctly
- Port is available

### Step 2: Restart Server Properly

```bash
# Stop current server (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Start server with custom server.js
npm run dev
```

**IMPORTANT:** Make sure you see these logs:
```
[Server] Database initialized
[Server] Redis initialized
[Server] WebSocket server ready
[Server] Ready on http://localhost:3000
```

If you DON'T see `[Server] Database initialized`, the custom server isn't running.

### Step 3: Test Upload

1. Go to admin resource management page
2. Upload a small PDF
3. Check server console for logs starting with `[PDF Upload]`

## Why This Happens

The error occurs because:

1. **Database not initialized** - The custom `server.js` initializes Prisma on startup
2. **Using wrong dev server** - If you run `next dev` instead of `node server.js`, Prisma isn't initialized
3. **Turbopack interference** - Turbopack dev server bypasses custom server

## Quick Checks

**Are you using the custom server?**
```bash
# Check what's running
ps aux | grep node

# Should show: node server.js
# NOT: next dev
```

**Is database connected?**
```bash
# Test Prisma connection
cd VELONX
npx prisma db pull
```

**Is port 3000 free?**
```bash
# Check port usage
lsof -ti:3000

# If something is using it, kill it:
lsof -ti:3000 | xargs kill -9
```

## Still Not Working?

1. Check `.env` file exists in VELONX directory
2. Verify DATABASE_URL is correct
3. Make sure MongoDB is accessible
4. Check you're logged in as admin

Run the full diagnostic:
```bash
node scripts/diagnose-server.js
```

See detailed guide: `PDF_UPLOAD_ERROR_RESOLUTION.md`
