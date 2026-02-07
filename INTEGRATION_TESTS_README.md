# Integration Tests - Setup Requirements

## MongoDB Replica Set Requirement

The integration tests require MongoDB to be configured as a replica set to support transactions. This is a Prisma/MongoDB requirement for operations like `deleteMany()` and `create()` when using connection pooling with retry logic.

### Current Status

Integration tests are implemented but cannot run successfully without MongoDB replica set configuration. The tests will timeout or fail with error:

```
Invalid `prisma.user.create()` invocation:
Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set.
```

### Setting Up MongoDB Replica Set for Testing

#### Option 1: Local MongoDB Replica Set

```bash
# Start MongoDB with replica set
mongod --replSet rs0 --port 27017 --dbpath /data/db

# Initialize replica set
mongosh
> rs.initiate()
```

#### Option 2: MongoDB Atlas (Recommended for Testing)

MongoDB Atlas automatically provides replica set configuration. Update your `TEST_DATABASE_URL` in `.env` to point to an Atlas cluster.

#### Option 3: Docker Compose

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    command: mongod --replSet rs0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
```

### Running Integration Tests

Once MongoDB replica set is configured:

```bash
# Run all integration tests
npm test src/__tests__/integration

# Run specific integration test file
npm test src/__tests__/integration/auth.integration.test.ts
```

### Test Coverage

The following integration test files have been created:

1. **auth.integration.test.ts** - Authentication endpoints (signup, login, CSRF, rate limiting)
2. **mentor-sessions.integration.test.ts** - Mentor session booking and management
3. **projects.integration.test.ts** - Project submission and approval workflows
4. **notifications.integration.test.ts** - Notification creation and retrieval

### Workaround for Current Environment

For validation testing without replica set:
- Validation tests (invalid input) work correctly
- Tests that require database writes will fail
- Consider using mocked Prisma client for unit-level testing
- Use E2E tests with Playwright against running application

### Next Steps

1. Configure MongoDB replica set in your development/test environment
2. Update `TEST_DATABASE_URL` environment variable
3. Run integration tests to verify API endpoint functionality
4. Add additional test cases as needed

## Test Structure

Each integration test file follows this pattern:

```typescript
describe('Feature Integration Tests', () => {
  describe('Endpoint Name', () => {
    it('should handle success case', async () => {
      // Test implementation
    })
    
    it('should handle validation errors', async () => {
      // Test implementation
    })
    
    it('should handle authorization', async () => {
      // Test implementation
    })
  })
})
```

## References

- [Prisma MongoDB Replica Set Documentation](https://www.prisma.io/docs/orm/overview/databases/mongodb#replica-set-configuration)
- [MongoDB Replica Set Tutorial](https://www.mongodb.com/docs/manual/tutorial/deploy-replica-set/)
