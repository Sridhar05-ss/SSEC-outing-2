# Multi-stage build for better optimization
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY bun.lockb ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy backend source
COPY BACKEND ./BACKEND

# Copy pre-build script
COPY pre-build.js ./

# Copy start script
COPY start-railway.js ./

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:railway"]
