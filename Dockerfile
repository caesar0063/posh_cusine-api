# Use a lightweight Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose application port
EXPOSE 5000

# Default environment
ENV NODE_ENV=production

# Start the server
CMD ["node", "server/server.js"]
