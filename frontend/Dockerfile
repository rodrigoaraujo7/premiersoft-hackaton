# Build stage
FROM node:22

WORKDIR /client

# Copy package files
COPY package*.json /client/

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY . /client/

# Expose port
EXPOSE 5173

# Start with --host to accept connections from any IP
CMD [ "npm", "run", "dev", "--", "--host", "0.0.0.0" ]