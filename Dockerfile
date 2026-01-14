# Use official Node.js runtime as base image
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy entire application
COPY . .

# Copy prisma and generate client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Set environment variable
ENV NODE_ENV=development

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start application in dev mode
CMD ["npm", "run", "dev"]
