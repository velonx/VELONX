# Testing the Seed Script

## Prerequisites

Before running the seed script, ensure:

1. MongoDB is running (local or Atlas)
2. DATABASE_URL is configured in `.env.local`
3. Schema has been pushed to the database: `npx prisma db push`

## Running the Seed Script

```bash
npx prisma db seed
```

Or manually:

```bash
tsx prisma/seed.ts
```

## Expected Output

The seed script will:

1. Clear all existing data
2. Create sample users (1 admin + 4 students)
3. Create 3 events with attendees
4. Create 3 projects with members
5. Create 3 mentors
6. Create 4 resources
7. Create 3 blog posts
8. Create 2 meetings with attendees
9. Create 2 user requests

## Verification

After seeding, you can verify the data:

### Using MongoDB Shell (Local)

```bash
mongosh velonx

# List all collections
db.getCollectionNames()

# Count documents in each collection
db.users.countDocuments()
db.events.countDocuments()
db.projects.countDocuments()
db.mentors.countDocuments()
db.resources.countDocuments()
db.blog_posts.countDocuments()
db.meetings.countDocuments()

# View sample data
db.users.find().pretty()
db.events.find().pretty()
```

### Using MongoDB Atlas

1. Go to your cluster in Atlas
2. Click "Browse Collections"
3. Select the "velonx" database
4. View each collection

## Test Credentials

After seeding, you can log in with:

- **Admin**: admin@velonx.com / password123
- **Student**: alice@example.com / password123
- **Student**: bob@example.com / password123
- **Student**: carol@example.com / password123
- **Student**: david@example.com / password123

## Troubleshooting

### "Cannot find module '@prisma/client'"

Run: `npx prisma generate`

### Connection errors

Verify your DATABASE_URL in `.env.local` is correct and MongoDB is running.

### "bcryptjs not found"

Run: `npm install bcryptjs @types/bcryptjs`

### Schema mismatch errors

Run: `npx prisma db push` to sync the schema
