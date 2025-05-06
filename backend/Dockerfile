# Use Node.js 22 LTS image from Docker Hub
FROM node:22-bullseye-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of your application files
COPY . .

# Install necessary dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    libatk-1.0-0 \
    libcups2 \
    libx11-xcb1 \
    libgdk-pixbuf2.0-0 \
    libnss3 \
    libxss1 \
    libgdk-pixbuf2.0-0 \
    libasound2 \
    libatk-bridge2.0-0 \
    libnspr4 \
    libgbm1 \
    libpangocairo-1.0-0 \
    libpci3 \
    libxcomposite1 \
    libxrandr2 \
    libxdamage1 \
    libpango-1.0-0 \
    libx11-6 \
    libfontconfig1 \
    libfreetype6 \
    libgl1-mesa-glx \
    libnss3 \
    libnss3-dev \
    && rm -rf /var/lib/apt/lists/*

# Expose the port the app will run on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
