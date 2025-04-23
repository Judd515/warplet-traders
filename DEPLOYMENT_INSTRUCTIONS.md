# Minimal Deployment Instructions for Warplet Traders

This document contains simplified instructions for deploying the Warplet Traders frame to Vercel.

## Files to Deploy

The essential files for deployment are:

1. `/api/minimal-frame.js` - Ultra-minimal frame handler 
2. `/public/static-image.svg` - Static frame image
3. `/vercel.json` - Vercel routing configuration

## Deployment Steps

1. Connect your GitHub repository to Vercel
2. Deploy with the following settings:
   - Framework preset: Other
   - Root directory: ./
   - Build command: None
   - Output directory: ./

## Testing After Deployment

After deployment, test your frame by visiting:

```
https://warplet-traders.vercel.app/api
```

or

```
https://warplet-traders.vercel.app/api/minimal-frame
```

Both URLs should display a valid frame that can be shared on Warpcast.

## Troubleshooting

- If you get 404 errors, verify that vercel.json has the correct routes
- Ensure the static-image.svg file is present in your public directory
- Check that minimal-frame.js is properly exported and accessible