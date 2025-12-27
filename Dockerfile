# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Install frontend dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build frontend
RUN npm run build

# Expose ports
EXPOSE 3001 5173

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start command (runs backend server)
CMD ["npm", "run", "server"]
