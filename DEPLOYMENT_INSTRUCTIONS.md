# Warplet Traders Deployment Instructions

This document contains instructions for deploying the Warplet Traders frame to Vercel.

## Files to Deploy

The essential files for deployment are:

1. `/api/stable-data-frame.js` - Real-time trader data handler
2. `/public/static-image.svg` - Fallback image for error states
3. `/vercel.json` - Vercel routing configuration

## Environment Variables

Make sure to set up the following environment variables in your Vercel project:

1. `DUNE_API_KEY` - Your Dune Analytics API key (required for real-time data)
2. `NODE_ENV` - Set to "production"

## Deployment Steps

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy with the following settings:
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
https://warplet-traders.vercel.app/api/stable-data-frame
```

Both URLs should display a valid frame with real-time trader data that can be shared on Warpcast.

## Frame Features

- Shows top traders on BASE by earnings
- Toggles between 24h and 7d data with button clicks
- Share button to post frame to Warpcast
- Tip button to support the creator

## Troubleshooting

- If data doesn't load, verify your Dune API key is set correctly
- If you get 404 errors, verify that vercel.json has the correct routes
- If buttons aren't working, check that the post_url is correct in the HTML