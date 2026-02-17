# MongoDB Replica Set Setup Instructions

## Why This Is Needed

The property-based test for schema referential integrity (Task 1.2) requires MongoDB to run as a **replica set** to support Prisma transactions. Your production environment (MongoDB Atlas) already has this, but local development needs configuration.

## Quick Setup (5 minutes)

### Step 1: Start Docker Desktop

Make sure Docker Desktop is running on your Mac.

### Step 2: Run the Setup Script

```bash
cd VELONX
./scripts/setup-mongodb-replica.sh
```

This script will:
- Start 3 MongoDB containers as a replica set
- Initialize the replica set automatically
- Update your `.env` file with the local connection string
- Run Prisma migrations
- Generate the Prisma client

### Step 3: Run the Property-Based Tests

```bash
npm test schema-referential-integrity
```

## Manual Setup (if script fails)

### 1. Start the Replica Set

```bash
cd VELONX
docker-compose -f docker-compose.mongodb.yml up -d
```

### 2. Wait for Initialization (~30 seconds)

```bash
# Check status
docker exec mongo1 mongosh --eval "rs.status()"
```

You should see 3 members with states: PRIMARY, SECONDARY, SECONDARY

### 3. Update .env File

Backup your current `.env`:
```bash
cp .env .env.backup
```

Update the `DATABASE_URL` in `.env`:
```bash
# Comment out Atlas URL
#DATABASE_URL=mongodb+srv://...

# Add local replica set URL
DATABASE_URL=mongodb://localhost:27017,localhost:27018,localhost:27019/velonx?replicaSet=rs0
```

### 4. Run Prisma Migrations

```bash
npx prisma db push
npx prisma generate
```

### 5. Run the Tests

```bash
npm test schema-referential-integrity
```

## Verification

After setup, verify the replica set is working:

```bash
# Check replica set status
docker exec mongo1 mongosh --eval "rs.status().members.forEach(m => print(m.name + ' - ' + m.stateStr))"

# Should output:
# mongo1:27017 - PRIMARY
# mongo2:27018 - SECONDARY
# mongo3:27019 - SECONDARY
```

## Switching Between Environments

### Use Local Replica Set (for testing)
```bash
DATABASE_URL=mongodb://localhost:27017,localhost:27018,localhost:27019/velonx?replicaSet=rs0
```

### Use Atlas (for production/staging)
```bash
DATABASE_URL=mongodb+srv://contactvelonx89_db_user:sDjBzStK57A2Zjw@velonx.fhdnc9w.mongodb.net/velonx?retryWrites=true&w=majority
```

## Useful Commands

### Check Status
```bash
docker exec mongo1 mongosh --eval "rs.status()"
```

### View Logs
```bash
docker-compose -f docker-compose.mongodb.yml logs -f mongo1
```

### Stop Replica Set
```bash
docker-compose -f docker-compose.mongodb.yml down
```

### Stop and Remove All Data
```bash
docker-compose -f docker-compose.mongodb.yml down -v
```

### Restart Replica Set
```bash
docker-compose -f docker-compose.mongodb.yml restart
```

## Troubleshooting

### "Connection refused" error
- Ensure Docker is running: `docker ps`
- Check if containers are up: `docker-compose -f docker-compose.mongodb.yml ps`
- Restart containers: `docker-compose -f docker-compose.mongodb.yml restart`

### "Replica set not initialized" error
- Wait 30 seconds after starting
- Check healthcheck: `docker inspect mongo1 | grep Health`
- Initialize manually:
  ```bash
  docker exec -it mongo1 mongosh
  rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "mongo1:27017" },
      { _id: 1, host: "mongo2:27018" },
      { _id: 2, host: "mongo3:27019" }
    ]
  })
  ```

### Tests still fail with "requires replica set"
- Verify connection string includes `?replicaSet=rs0`
- Check all 3 containers are running: `docker ps | grep mongo`
- Verify replica set status: `docker exec mongo1 mongosh --eval "rs.status()"`

### Port conflicts (27017 already in use)
- Stop any existing MongoDB: `brew services stop mongodb-community` (if installed via Homebrew)
- Or change ports in `docker-compose.mongodb.yml`

## CI/CD Considerations

For GitHub Actions or other CI environments, you can use the same Docker Compose setup:

```yaml
- name: Start MongoDB Replica Set
  run: |
    docker-compose -f docker-compose.mongodb.yml up -d
    sleep 30
    docker exec mongo1 mongosh --eval "rs.status()"

- name: Run Tests
  run: npm test
  env:
    DATABASE_URL: mongodb://localhost:27017,localhost:27018,localhost:27019/velonx?replicaSet=rs0
```

## Why Not Use Single MongoDB Instance?

Prisma requires transactions for certain operations (like cascade deletes in tests). MongoDB only supports transactions in replica set mode. This is a MongoDB limitation, not a Prisma or test issue.

Production environments (MongoDB Atlas) already run as replica sets, so this setup matches production behavior.

## Resources

- [MongoDB Replica Set Documentation](https://www.mongodb.com/docs/manual/replication/)
- [Prisma with MongoDB Transactions](https://www.prisma.io/docs/concepts/components/prisma-client/transactions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
