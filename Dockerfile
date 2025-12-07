# Start from an official Node.js image
FROM node:20

# Install ffmpeg and clean up apt cache
RUN apt-get update -y && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install Node dependencies
COPY package.json .
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port (Render uses the PORT environment variable automatically)
EXPOSE 10000

# Start the application
CMD ["npm", "start"]
