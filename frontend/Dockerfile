# Build stage
FROM node:22

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start nginx
CMD [ "npm", "start"]