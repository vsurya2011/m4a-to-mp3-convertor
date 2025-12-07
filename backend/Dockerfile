# backend/Dockerfile

# 1. Use a Node.js base image
FROM node:22-slim

# 2. Install FFmpeg
# RUN apt-get update && apt-get install -y ffmpeg ... (This is where the magic happens)
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# 3. Set the working directory (This is the line you quoted!)
WORKDIR /usr/src/app

# 4. Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# 5. Copy the rest of the application code (server.js, etc.)
COPY . .

# 6. Expose the port
EXPOSE 3000

# 7. Command to run the application
CMD [ "node", "server.js" ]