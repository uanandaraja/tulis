# Use the latest Bun version
FROM oven/bun:1.3.1-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["bun", "start"]