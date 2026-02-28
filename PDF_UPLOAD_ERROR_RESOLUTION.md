# PDF Upload 500 Error - Resolution Guide

## Root Cause Analysis

Based on the errors you're experiencing:

1. **HTTP 500 Error** on `/api/resources/upload-pdf`
2. **Fetch Error** from `useResources` hook showing empty object `{}`

The root cause is likely a **database connection issue**. The application requires:
- MongoDB connection to be active
- Prisma client to be initialized
- Custom server (`server.js`) to be running

## Solution Steps

### Step 1: Verify You're Using the Custom Server

The app MUST be run using the custom server (not `next dev`) because:
- It initializes the Prisma database connection
- It sets up WebSocket support
- It handles graceful shutdown

**Check your package.json scripts:**

```json
{
  "scripts": {
    "dev": "node server.js",
    "build": "next build",
    "start": "NODE_ENV=production node server.js"
  }
}
```

**If you're running `npm run dev` or `yarn dev`**, it should use `node server.js`.

**If you're using Next.js Turbopack**, you might be running `next dev --turbo` which bypasses the custom server. Change to:

```bash
# Stop the current server
# Then run:
npm run dev
# or
yarn dev
```

### Step 2: Verify MongoDB Connection

Check your `.env` file has a valid MongoDB connection string:

```env
DATABASE_URL=mongodb+srv://contactvelonx89_db_user:sDjBzStK57A2Zjw@velonx.fhdnc9w.mongodb.net/velonx?retryWrites=true&w=majority
```

**Test the connection:**

```bash
cd VELONX
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET')"
```

### Step 3: Check Server Startup Logs

When you start the server with `npm run dev`, you should see:

```
[Server] Database initialized
[Server] Redis initialized
[Server] Redis Pub/Sub initialized
[Server] WebSocket server ready
[Server] Ready on http://localhost:3000
```

**If you see:**
- `Failed to initialize database` → MongoDB connection issue
- No database initialization message → Not using custom server

### Step 4: Restart the Development Server

1. Stop the current server (Ctrl+C)
2. Clear Next.js cache:
   ```bash
   cd VELONX
   rm -rf .next
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
4. Wait for all initialization messages
5. Try uploading the PDF again

### Step 5: Check for Port Conflicts

If port 3000 is already in use:

```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)

# Or use a different port
PORT=3001 npm run dev
```

## Verification Checklist

After restarting, verify:

- [ ] Server started with `node server.js` (not `next dev`)
- [ ] Console shows `[Server] Database initialized`
- [ ] Console shows `[Server] Ready on http://localhost:3000`
- [ ] No database connection errors in console
- [ ] Can access http://localhost:3000 in browser
- [ ] Logged in as admin user

## Testing the Fix

1. Navigate to the admin resource management page
2. Try uploading a small PDF (< 1MB)
3. Check the server console for detailed logs:
   - `[PDF Upload] Starting upload process...`
   - `[PDF Upload] Checking admin authentication...`
   - `[PDF Upload] Authentication successful`
   - `[PDF Upload] Uploading to Cloudinary...`
   - `[PDF Upload] Upload successful`

## Common Issues

### Issue 1: Using Next.js Dev Server Instead of Custom Server

**Symptoms:**
- No database initialization logs
- 500 errors on API routes that use Prisma
- WebSocket features don't work

**Solution:**
Ensure `package.json` has:
```json
"dev": "node server.js"
```

NOT:
```json
"dev": "next dev"
```

### Issue 2: MongoDB Connection String Invalid

**Symptoms:**
- `Failed to initialize database` error
- `DATABASE_URL must be a valid MongoDB connection string`

**Solution:**
- Check `.env` file exists in VELONX directory
- Verify DATABASE_URL starts with `mongodb://` or `mongodb+srv://`
- Test connection with MongoDB Compass or mongosh

### Issue 3: Turbopack Mode

**Symptoms:**
- Running with `--turbo` flag
- Custom server not being used

**Solution:**
Remove `--turbo` flag from dev script. The custom server is incompatible with Turbopack's dev server.

### Issue 4: Authentication Not Working

**Symptoms:**
- `[PDF Upload] Authentication failed`
- 401 or 403 errors

**Solution:**
- Ensure you're logged in
- Verify user has ADMIN role in database
- Check NextAuth configuration

## Additional Debugging

If issues persist, check:

1. **Server Console** - Look for error messages
2. **Browser Console** - Check for client-side errors
3. **Network Tab** - Inspect failed requests
4. **Database** - Verify MongoDB is accessible

Run the Cloudinary config test:
```bash
cd VELONX
node scripts/test-cloudinary-config.js
```

## Next Steps

Once the server is running correctly:

1. The PDF upload should work
2. The resources list should load
3. All database-dependent features should function

If you still see errors after following these steps, share:
- Complete server startup logs
- Any error messages from console
- Output of `npm run dev`
