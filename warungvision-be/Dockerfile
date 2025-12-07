FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --production

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "src/index.ts"]
