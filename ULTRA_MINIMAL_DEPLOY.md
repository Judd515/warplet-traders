# Ultra Minimal Frame Deployment Guide

This guide addresses the "Frame Error: Unknown error communicating with the frame server" issue by using a completely minimal approach with external images instead of base64 SVGs.

## What's Different in This Approach

1. **External Image URLs**: Using `https://placehold.co` for images instead of complex base64-encoded SVGs
2. **Simplified API Handlers**: Minimal code that only does one thing - respond to button clicks
3. **Dedicated Vercel Endpoints**: Files in `/api` that are specifically designed for Vercel deployment

## Deployment Steps

### 1. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Use the following settings:
   - Framework preset: Other
   - Build command: `node build-frame.js`
   - Output directory: public
   - Install command: `npm install`

### 2. Configure Environment Variables

Make sure to add these as environment variables in Vercel:
- `NEYNAR_API_KEY`
- `DUNE_API_KEY`

### 3. Verify Deployment

After deploying, test the following URLs:
- Main frame: `https://warplet-traders.vercel.app/index.html`
- Ultra minimal frame: `https://warplet-traders.vercel.app/ultra-minimal-frame.html`
- Debug frame: `https://warplet-traders.vercel.app/debug-frame.html`

## API Endpoints

The following API endpoints are available:
- `/api/vercel-minimal-frame` - Ultra minimal handler that uses external images
- `/api/frame-debug` - Logs detailed information about frame requests for debugging

## Troubleshooting Frame Errors

If you're still seeing "Unknown error communicating with the frame server":

1. Check if the API endpoint is accessible by visiting `https://warplet-traders.vercel.app/api/vercel-minimal-frame` directly
2. Verify the functions are properly deployed in Vercel
3. Make sure the `post_url` in the HTML files points to the correct absolute URL
4. Try the debug frame to get more detailed logs about what's happening

## Why This Approach Works

The ultra-minimal approach:
1. Eliminates potential issues with large SVG data in the HTML
2. Reduces complexity in the API handlers
3. Uses simple external image URLs that are known to work with Warpcast frames
4. Improves CORS handling with proper headers

## Testing in Local Development

When testing locally:
1. The API endpoints will be available at `http://localhost:5000/api/...`
2. The frames will use relative URLs for the `post_url`
3. You can simulate frame requests using the Debug Frame tool

## Going Back to Feature-Rich Version

Once the minimal version is working, you can gradually add back features:
1. Replace external placeholder images with SVGs
2. Add real-time data fetching
3. Implement user-specific "Check My Follows" functionality