# Build & Production Dockerfile for Google Cloud Run / Google Cloud
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build Vite React frontend to /dist
RUN npm run build

# Remove development dependencies to keep container light
RUN npm prune --production

# Final runtime image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy built frontend dist and backend server
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Google Cloud Run injects PORT environment variable (default 8080)
EXPOSE 8080

CMD ["node", "server/index.js"]
