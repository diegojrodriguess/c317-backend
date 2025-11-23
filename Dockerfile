# Backend (NestJS) Dockerfile
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Environment
ENV NODE_ENV=production \
    PORT=3000

# Start
CMD ["npm", "run", "start:prod"]
