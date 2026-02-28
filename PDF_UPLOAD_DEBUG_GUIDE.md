# PDF Upload 500 Error - Debugging Guide

## Error Description
HTTP 500 error occurs when uploading PDF via PDFUploadField component at `/api/resources/upload-pdf` endpoint.

## Enhanced Logging
Added detailed logging to help identify the root cause:

### API Route Logs (`/api/resources/upload-pdf`)
- `[PDF Upload] Starting upload process...`
- `[PDF Upload] Checking admin authentication...`
- `[PDF Upload] Authentication successful`
- `[PDF Upload] Parsing request body...`
- `[PDF Upload] Request body parsed, fileName: <name>`
- `[PDF Upload] Validating request data...`
- `[PDF Upload] Validation successful`
- `[PDF Upload] Uploading to Cloudinary...`
- `[PDF Upload] Upload successful, publicId: <id>`

### Cloudinary Service Logs
- `[Cloudinary] Starting PDF upload...`
- `[Cloudinary] Config check: { hasCloudName, hasApiKey, hasApiSecret, cloudName }`
- `[Cloudinary] Upload successful: { publicId, url }`

## Debugging Steps

### 1. Check Server Console Logs
Look for the log messages above to identify where the error occurs:
- If logs stop at "Checking admin authentication" → Authentication issue
- If logs stop at "Parsing request body" → Request parsing issue
- If logs stop at "Validating request data" → Validation issue
- If logs stop at "Uploading to Cloudinary" → Cloudinary configuration or upload issue

### 2. Verify Cloudinary Configuration
Run the test script:
```bash
cd VELONX
node scripts/test-cloudinary-config.js
```

This will verify:
- All environment variables are set
- Cloudinary API connection works

### 3. Check Environment Variables
Ensure these are set in `VELONX/.env`:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Verify Authentication
Check if you're logged in as an admin:
- The endpoint requires admin role
- Check browser console for authentication errors
- Verify session is valid

### 5. Check Database Connection
The authentication system requires database access:
- Verify MongoDB connection string is correct
- Check if database is accessible
- Look for database connection errors in logs

### 6. Test with Smaller PDF
Try uploading a very small PDF (< 1MB) to rule out:
- File size issues
- Base64 encoding issues
- Network timeout issues

## Common Issues and Solutions

### Issue 1: Cloudinary Configuration Missing
**Symptoms:** Logs show `hasCloudName: false` or similar
**Solution:** Add missing environment variables to `.env` file

### Issue 2: Authentication Failure
**Symptoms:** Logs stop at "Checking admin authentication"
**Solution:** 
- Ensure you're logged in
- Verify user has ADMIN role
- Check NextAuth configuration

### Issue 3: Database Connection Error
**Symptoms:** Authentication check hangs or fails
**Solution:**
- Verify DATABASE_URL in `.env`
- Check MongoDB is running
- Test database connection

### Issue 4: File Too Large
**Symptoms:** Error mentions "10MB"
**Solution:** Reduce PDF file size or increase limit

### Issue 5: Invalid Base64 Data
**Symptoms:** Cloudinary upload fails with encoding error
**Solution:** Verify PDF is properly converted to base64 in client

## Next Steps After Identifying Issue

1. **Authentication Issue:** Check auth configuration and user role
2. **Cloudinary Issue:** Verify credentials and test connection
3. **Database Issue:** Check connection string and database status
4. **Validation Issue:** Check request payload format
5. **File Issue:** Try different PDF file

## Testing the Fix

After making changes:
1. Restart the development server
2. Clear browser cache
3. Try uploading a small test PDF
4. Check server console for detailed logs
5. Verify upload completes successfully

## Additional Resources

- Cloudinary Node.js SDK: https://cloudinary.com/documentation/node_integration
- NextAuth.js: https://next-auth.js.org/
- Next.js API Routes: https://nextjs.org/docs/api-routes/introduction
