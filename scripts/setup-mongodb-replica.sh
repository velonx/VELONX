#!/bin/bash

# MongoDB Replica Set Setup Script
# This script sets up a local MongoDB replica set for development and testing

set -e

echo "🚀 Setting up MongoDB Replica Set for local development..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Stop any existing MongoDB containers
echo "🧹 Cleaning up existing MongoDB containers..."
docker-compose -f docker-compose.mongodb.yml down -v 2>/dev/null || true
echo ""

# Start the replica set
echo "🐳 Starting MongoDB replica set (3 nodes)..."
docker-compose -f docker-compose.mongodb.yml up -d
echo ""

# Wait for containers to be healthy
echo "⏳ Waiting for replica set to initialize (this takes ~30 seconds)..."
sleep 5

# Check if containers are running
if ! docker ps | grep -q mongo1; then
    echo "❌ Error: MongoDB containers failed to start"
    docker-compose -f docker-compose.mongodb.yml logs
    exit 1
fi

echo "✅ Containers started"
echo ""

# Wait for replica set initialization
echo "⏳ Waiting for replica set initialization..."
for i in {1..30}; do
    if docker exec mongo1 mongosh --quiet --eval "rs.status().ok" 2>/dev/null | grep -q "1"; then
        echo "✅ Replica set initialized successfully!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  Replica set initialization is taking longer than expected"
        echo "   Attempting manual initialization..."
        docker exec mongo1 mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'mongo1:27017'},{_id:1,host:'mongo2:27018'},{_id:2,host:'mongo3:27019'}]})" || true
        sleep 5
    fi
    echo -n "."
    sleep 2
done
echo ""

# Verify replica set status
echo "📊 Checking replica set status..."
docker exec mongo1 mongosh --quiet --eval "rs.status().members.forEach(m => print(m.name + ' - ' + m.stateStr))"
echo ""

# Update .env file
echo "📝 Updating .env file with local replica set connection..."
if [ -f .env ]; then
    # Backup original .env
    cp .env .env.backup
    echo "✅ Backed up .env to .env.backup"
    
    # Update DATABASE_URL
    if grep -q "^DATABASE_URL=" .env; then
        # Comment out the existing DATABASE_URL
        sed -i.tmp 's/^DATABASE_URL=/#DATABASE_URL=/' .env
        rm -f .env.tmp
    fi
    
    # Add local replica set URL
    echo "" >> .env
    echo "# Local MongoDB Replica Set (for development/testing)" >> .env
    echo "DATABASE_URL=mongodb://localhost:27017,localhost:27018,localhost:27019/velonx?replicaSet=rs0" >> .env
    
    echo "✅ Updated .env with local replica set connection"
else
    echo "⚠️  .env file not found. Please create it manually with:"
    echo "   DATABASE_URL=mongodb://localhost:27017,localhost:27018,localhost:27019/velonx?replicaSet=rs0"
fi
echo ""

# Run Prisma migrations
echo "🔄 Running Prisma migrations..."
if npx prisma db push --skip-generate; then
    echo "✅ Database schema synchronized"
else
    echo "⚠️  Prisma migration had issues. You may need to run it manually."
fi
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
if npx prisma generate; then
    echo "✅ Prisma client generated"
else
    echo "⚠️  Prisma client generation had issues."
fi
echo ""

echo "✨ MongoDB Replica Set setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Run tests: npm test"
echo "   2. Run property tests: npm test schema-referential-integrity"
echo "   3. Start dev server: npm run dev"
echo ""
echo "🛠️  Useful commands:"
echo "   • Check status: docker exec mongo1 mongosh --eval 'rs.status()'"
echo "   • View logs: docker-compose -f docker-compose.mongodb.yml logs -f"
echo "   • Stop replica set: docker-compose -f docker-compose.mongodb.yml down"
echo "   • Reset data: docker-compose -f docker-compose.mongodb.yml down -v"
echo ""
echo "💡 To switch back to Atlas, restore .env.backup or update DATABASE_URL"
