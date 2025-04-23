# Deployment Instructions for Warplet Traders

This document contains instructions for deploying the Warplet Traders frame to Vercel.

## Files to Deploy

The important files for deployment are:

1. `/api/index.js` - Main frame handler
2. `/api/image.js` - Image generation endpoint
3. `/public/images/error.svg` - Error state image
4. `/vercel.json` - Vercel configuration

## Environment Variables

Make sure to set up the following environment variables in your Vercel project:

1. `DUNE_API_KEY` - Your Dune Analytics API key
2. `NODE_ENV` - Set to "production"

## Deployment Steps

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy with the following settings:
   - Framework preset: Other
   - Root directory: ./
   - Build command: None
   - Output directory: ./

## Troubleshooting

- If you get 404 errors, check that your vercel.json routes are correct
- If buttons aren't working, check that your fc:frame:post_url is correct in the HTML
- If image generation fails, verify your Dune API key is set correctly

## Testing

After deployment, test your frame by visiting:

```
https://YOUR-VERCEL-URL/api
```

This should display a valid frame that can be shared on Warpcast.