#!/bin/bash

# Print all commands for debugging
set -x

# Clean up any existing output directories
rm -rf public api_build

# Create directories
mkdir -p public
mkdir -p api_build

# Copy API files to the api_build directory
if [ -d "api" ]; then
  echo "Copying API files..."
  find api -type f \( -name "*.js" -o -name "*.ts" -o -name "*.json" \) | xargs -I{} cp {} api_build/
fi

# Copy static assets to public directory
if [ -d attached_assets ]; then
  cp -r attached_assets/* public/
fi

# Copy client dist folder if it exists
if [ -d client/dist ]; then
  cp -r client/dist/* public/
fi

# Create simple index.html if it doesn't exist
if [ ! -f "public/index.html" ]; then
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
fi

# Ensure we have an error.png file
if [ ! -f "public/error.png" ] && [ -f "attached_assets/og.png" ]; then
  cp attached_assets/og.png public/error.png
fi

# Ensure we have an og.png file
if [ ! -f "public/og.png" ] && [ -f "attached_assets/og.png" ]; then
  cp attached_assets/og.png public/og.png
fi

# Compile TypeScript files if they exist
if ls api_build/*.ts 1> /dev/null 2>&1; then
  echo "Compiling TypeScript files..."
  npm install -g typescript
  
  # Copy tsconfig.json to api_build if it exists
  if [ -f api/tsconfig.json ]; then
    cp api/tsconfig.json api_build/
  else
    # Create a simple tsconfig.json
    cat > api_build/tsconfig.json << 'EOL'
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "commonjs",
    "outDir": "./",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false
  },
  "include": ["./*.ts"],
  "exclude": ["node_modules"]
}
EOL
  fi
  
  # Compile TypeScript files
  cd api_build
  npx tsc --project tsconfig.json
  cd ..
fi

# Move api_build to api directory for Vercel
mkdir -p api
cp -r api_build/* api/

# Verify key files exist
echo "Verifying build contents..."
ls -la
echo "API directory:"
ls -la api/
echo "Public directory:"
ls -la public/

# Install only the absolutely necessary dependencies for API
npm install express --save

echo "Build completed successfully!"