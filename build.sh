#!/bin/bash

# Print all commands for debugging
set -x

# Create build directory structure
mkdir -p build/api
mkdir -p build/public

# Copy API files
cp -r api/* build/api/

# Copy server files
cp server-vercel.js build/

# Copy static assets to public directory
if [ -d attached_assets ]; then
  cp -r attached_assets/* build/public/
fi

# Create simple index.html if client build not available
cat > build/public/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>Warpcast Top Traders</title>
    
    <!-- Open Graph meta tags for better sharing -->
    <meta property="og:title" content="Warpcast Top Traders" />
    <meta property="og:description" content="See which of the people you follow are the top traders on BASE using their warplets" />
    <meta property="og:image" content="https://topwarplettraders.vercel.app/og.png" />
    <meta property="og:url" content="https://topwarplettraders.vercel.app" />
    <meta property="og:type" content="website" />
    
    <!-- Warpcast Frame Tags -->
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="https://topwarplettraders.vercel.app/og.png" />
    <meta property="fc:frame:button:1" content="24 Hours" />
    <meta property="fc:frame:button:2" content="7 Days" />
    <meta property="fc:frame:button:3" content="Share Results" />
    <meta property="fc:frame:post_url" content="https://topwarplettraders.vercel.app/api/frame-action" />
  </head>
  <body>
    <div id="root">Loading Top Traders...</div>
    <script>
      window.location.href = "/api/frame-action";
    </script>
  </body>
</html>
EOL

# Create a basic error page
cat > build/public/error.png << 'EOL'
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#1e1e2e" />
  <text x="400" y="300" font-family="Arial" font-size="32" fill="#ff5555" text-anchor="middle">Error loading data</text>
</svg>
EOL

# Verify key files exist
echo "Verifying build contents..."
ls -la build/
echo "API directory:"
ls -la build/api/
echo "Public directory:"
ls -la build/public/

# Install dependencies in build directory
cd build
npm init -y
npm install winston @neondatabase/serverless drizzle-orm ws axios express express-session

echo "Build completed successfully!"