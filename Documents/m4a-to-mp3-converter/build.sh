#!/usr/bin/env bash
set -e

# Install FFmpeg on Render server
apt-get update
apt-get install -y ffmpeg

# Build app
chmod +x mvnw
./mvnw clean package -DskipTests=true

# Run app
java -jar target/*.jar
