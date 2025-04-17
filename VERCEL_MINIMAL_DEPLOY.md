# Minimal Vercel Deployment for Warpcast Frames (Hobby Plan)

This guide solves the "Frame error: Unknown error communicating with the frame server" issue on Vercel's Hobby Plan by using an absolute minimal implementation.

## Why this approach works:

1. **Single API file**: Uses just one `/api/index.js` file to handle all frame interactions
2. **Remote-hosted images**: Uses Imgur-hosted images instead of base64-encoded SVGs or placeholders
3. **Minimal HTML**: Reduces frame HTML to only essential meta tags
4. **Direct API path**: Uses `/api` as the endpoint rather than a more complex path

## Deployment Instructions

### 1. Files to Deploy

The minimal deployment requires just these files:
- `/api/index.js` - The serverless function that handles all frame requests
- `/public/vercel-minimal.html` - The entry point HTML file for the frame

### 2. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Use these settings:
   - Framework preset: **Other**
   - Build command: Leave blank
   - Output directory: **public**
   - Install command: Leave blank

### 3. Test the Frame

After deployment, the frame should be accessible at:
```
https://your-project-name.vercel.app/vercel-minimal.html
```

Each button click should work without the "Frame error" message.

## Understanding the Implementation

### The Single API File (/api/index.js)

This file handles all HTTP requests to `/api` and:
1. Sets proper CORS headers
2. Extracts the button index from the request
3. Returns appropriate HTML based on the button clicked
4. Handles the share button redirect

### Pre-hosted Images

Instead of generating SVGs or using base64 encoding, we use direct URLs to images hosted on Imgur:
- Main view: https://i.imgur.com/QT7rPHB.png
- 24h data: https://i.imgur.com/LWL18gi.png
- 7d data: https://i.imgur.com/0eXt1zi.png
- Check My Follows: https://i.imgur.com/mfQaxzJ.png

### Frame HTML Structure

The frame HTML is kept minimal:
```html
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://i.imgur.com/QT7rPHB.png">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="https://your-project-name.vercel.app/api">
</head>
<body>
  <h1>Warplet Top Traders</h1>
</body>
</html>
```

## Troubleshooting

If you still encounter issues:

1. **Check Vercel Functions**: Make sure the serverless function is deployed correctly
2. **Verify the post_url**: It should be the absolute URL to your `/api` endpoint
3. **Test with curl**: Try making a direct POST request to your API endpoint
4. **Check Vercel logs**: Look for any errors in the function execution

## Return to Advanced Implementation

Once this minimal version is working, you can gradually restore the full functionality:

1. Replace the static images with dynamic SVGs
2. Implement the Neynar and Dune Analytics integrations
3. Add user-specific data functionality

The key is to make incremental changes while testing each step to ensure everything continues to work.