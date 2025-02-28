# Use official Node.js image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Compile TypeScript
RUN npx tsc

# Expose the WebSocket port
EXPOSE 3500

# Start the backend server
CMD ["node", "dist/server.js"]
