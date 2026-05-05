# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Install system dependencies needed for Prisma
RUN apt-get update && apt-get install -y openssl python3 build-essential && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Stage 2: Runner
FROM node:20-slim AS runner

WORKDIR /app

# Install openssl for Prisma runtime
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
# Set memory limit for Node.js (GCP Cloud Run will have 1GB+)
ENV NODE_OPTIONS="--max-old-space-size=768"

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Expose the port (Cloud Run uses PORT env var)
EXPOSE 8080

# Use tsx to run the custom server.js which imports .ts files
# This is safe because we'll allocate 1GB+ to Cloud Run
CMD ["npx", "tsx", "server.js"]
