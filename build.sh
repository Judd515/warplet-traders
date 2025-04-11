#!/bin/bash

# Make sure the build directory exists
mkdir -p build

# Copy server files
cp -r server-vercel.js build/
cp -r server/api build/

# Copy API files
mkdir -p build/api
cp -r api/* build/api/

# Copy package.json and install dependencies
cp package.json build/
cd build
npm install --production
npm install winston @neondatabase/serverless drizzle-orm ws axios express express-session --save

# Copy the client build
mkdir -p client
cp -r ../client/dist/* client/

# Create a public directory and copy assets
mkdir -p public
cp -r ../client/public/* public/

# Verify key files exist
echo "Verifying build contents..."
ls -la
echo "API directory:"
ls -la api/
echo "Public directory:"
ls -la public/

# Go back to root
cd ..