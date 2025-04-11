#!/bin/bash
# This script ensures that all necessary files are copied to the correct locations during the build process

# Run the standard build
npm run build

# Create necessary directories
mkdir -p dist/api

# Copy API files to the dist directory
cp -r api/* dist/api/

# Copy server file for Vercel
cp server-vercel.js dist/index.js

echo "Build process completed successfully"