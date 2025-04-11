#!/bin/bash

# Print all commands for debugging
set -x

# Create public directory to hold static files
mkdir -p public

# Create api directory for API functions
mkdir -p api

# Copy static assets to public directory
if [ -d attached_assets ]; then
  cp -r attached_assets/* public/
fi

# Create simple index.html if client build not available
cat > public/index.html << 'EOL'
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

# Ensure we have an error.png file
if [ ! -f "public/error.png" ] && [ -f "attached_assets/og.png" ]; then
  cp attached_assets/og.png public/error.png
fi

# Ensure we have an og.png file
if [ ! -f "public/og.png" ] && [ -f "attached_assets/og.png" ]; then
  cp attached_assets/og.png public/og.png
fi

# Verify key files exist
echo "Verifying build contents..."
ls -la
echo "API directory:"
ls -la api/
echo "Public directory:"
ls -la public/

# Install dependencies for API
npm install winston @neondatabase/serverless drizzle-orm ws axios express express-session --save

echo "Build completed successfully!"