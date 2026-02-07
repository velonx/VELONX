# Database Setup Instructions

## MongoDB Setup

This project uses MongoDB as the database. You have two options:

### Option 1: Local MongoDB (Recommended for Development)

1. Install MongoDB locally:
   - **macOS**: `brew install mongodb-community`
   - **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - **Linux**: Follow [MongoDB installation guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. Start MongoDB:
   ```bash
   # macOS/Linux
   brew services start mongodb-community
   # or
   mongod --config /usr/local/etc/mongod.conf
   
   # Windows
   net start MongoDB
   ```

3. Update `.env.local` with local connection string:
   ```
   DATABASE_URL="mongodb://localhost:27017/velonx"
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. Create a new cluster (free tier available)

3. Create a database user with read/write permissions

4. Get your connection string from Atlas dashboard

5. Update `.env.local` with Atlas connection string:
   ```
   DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/velonx?retryWrites=true&w=majority"
   ```

## Push Schema to Database

Once MongoDB is configured, run:

```bash
npx prisma db push
```

This will:
- Create all collections in MongoDB
- Set up indexes
- Generate the Prisma Client

## Verify Setup

Check that collections were created:

```bash
# For local MongoDB
mongosh velonx --eval "db.getCollectionNames()"

# For MongoDB Atlas
# Use the Atlas web interface to view collections
```

You should see collections like:
- users
- accounts
- sessions
- events
- projects
- mentors
- resources
- blog_posts
- meetings
- user_requests

## Generate Prisma Client

If you make changes to the schema, regenerate the client:

```bash
npx prisma generate
```

## Troubleshooting

### Connection Issues

If you get connection errors:

1. **Local MongoDB**: Ensure MongoDB is running
   ```bash
   # Check if MongoDB is running
   ps aux | grep mongod
   ```

2. **MongoDB Atlas**: 
   - Check your IP is whitelisted in Atlas Network Access
   - Verify username/password are correct
   - Ensure connection string format is correct

### Schema Validation Errors

If you get schema validation errors:
- Check that all model relations are properly defined
- Ensure all `@db.ObjectId` annotations are present for MongoDB IDs
- Verify enum values match the design document

## Next Steps

After successful database setup:

1. Run the seed script to populate initial data:
   ```bash
   npx prisma db seed
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
