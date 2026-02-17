# MongoDB Replica Set Setup Guide

This guide explains how to set up and use a MongoDB replica set for local development.

## Overview

A MongoDB replica set provides:
- **High availability**: Automatic failover if primary node fails
- **Data redundancy**: Multiple copies of your data
- **Read scalability**: Distribute read operations across nodes
- **Transaction support**: Required for multi-document ACID transactions

## Current Setup

Your production environment uses **MongoDB Atlas**, which already runs as a replica set by default.

For local development, you can use the Docker Compose configuration provided.

## Quick Start

### 1. Start the Replica Set

```bash
cd VELONX
docker-compose -f docker-compose.mongodb.yml up -d
```

This starts 3 MongoDB instances:
- `mongo1` on port 27017 (Primary)
- `mongo2` on port 27018 (Secondary)
- `mongo3` on port 27019 (Secondary)

### 2. Wait for Initialization

The replica set initializes automatically via healthcheck. Wait about 30 seconds, then verify:

```bash
docker exec -it mongo1 mongosh --eval "rs.status()"
```

You should see all three members with states like:
- `PRIMARY` (one node)
- `SECONDARY` (two nodes)

### 3. Update Environment Variables

Copy `.env.local` to `.env` or update your `.env`:

```bash
# For connecting from host machine
DATABASE_URL=mongodb://localhost:27017,localhost:27018,localhost:27019/velonx?replicaSet=rs0
```

### 4. Run Prisma Migrations

```bash
npx prisma db push
# or
npx prisma migrate dev
```

### 5. Start Your Application

```bash
npm run dev
```

## Manual Replica Set Initialization (if needed)

If automatic initialization fails, initialize manually:

```bash
# Connect to mongo1
docker exec -it mongo1 mongosh

# Initialize replica set
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27018" },
    { _id: 2, host: "mongo3:27019" }
  ]
})

# Check status
rs.status()
```

## Useful Commands

### Check Replica Set Status
```bash
docker exec -it mongo1 mongosh --eval "rs.status()"
```

### Check Which Node is Primary
```bash
docker exec -it mongo1 mongosh --eval "rs.isMaster()"
```

### View Logs
```bash
docker-compose -f docker-compose.mongodb.yml logs -f mongo1
```

### Stop Replica Set
```bash
docker-compose -f docker-compose.mongodb.yml down
```

### Stop and Remove Data
```bash
docker-compose -f docker-compose.mongodb.yml down -v
```

## Connection Strings

### From Host Machine (outside Docker)
```
mongodb://localhost:27017,localhost:27018,localhost:27019/velonx?replicaSet=rs0
```

### From Docker Container (same network)
```
mongodb://mongo1:27017,mongo2:27018,mongo3:27019/velonx?replicaSet=rs0
```

## Testing Failover

To test automatic failover:

```bash
# Stop the primary node
docker stop mongo1

# Check status - a secondary should become primary
docker exec -it mongo2 mongosh --eval "rs.status()"

# Restart mongo1 - it will rejoin as secondary
docker start mongo1
```

## Troubleshooting

### Connection Refused
- Ensure all containers are running: `docker ps`
- Check logs: `docker-compose -f docker-compose.mongodb.yml logs`

### Replica Set Not Initialized
- Wait 30 seconds after starting
- Check healthcheck: `docker inspect mongo1 | grep Health`
- Initialize manually (see above)

### Application Can't Connect
- Verify connection string includes `?replicaSet=rs0`
- Ensure all three hosts are reachable
- Check firewall/network settings

### Data Persistence
Data is stored in Docker volumes:
- `mongo1_data`, `mongo2_data`, `mongo3_data`
- Survives container restarts
- Remove with `docker-compose down -v` to reset

## Production Considerations

For production, continue using **MongoDB Atlas**:
- Already configured as replica set
- Automatic backups and monitoring
- Managed scaling and updates
- No infrastructure management needed

## Switching Between Environments

### Use Atlas (Production/Staging)
```bash
# Use .env with Atlas connection string
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/velonx?retryWrites=true&w=majority
```

### Use Local Replica Set (Development)
```bash
# Use .env.local or update .env
DATABASE_URL=mongodb://localhost:27017,localhost:27018,localhost:27019/velonx?replicaSet=rs0
```

## Resources

- [MongoDB Replica Set Documentation](https://www.mongodb.com/docs/manual/replication/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma with MongoDB](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
