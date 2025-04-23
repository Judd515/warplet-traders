# Warplet Traders Deployment Instructions

This document contains simple instructions for deploying the Warplet Traders frame to Vercel.

## Files to Deploy

The essential files for deployment are:

1. `/api/minimal-frame.js` - Simple frame handler that works reliably
2. `/public/static-image.svg` - Styled image with the proper branding
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

This URL should display a valid frame that can be shared on Warpcast.

## Frame Features

- Clean, visually consistent design matching the Warplet brand
- View 7d data with button clicks
- Share button to post frame to Warpcast
- Tip button to support the creator

## Troubleshooting

- If the frame doesn't appear in Warpcast, check that the meta tags are correct
- If you get 404 errors, verify that vercel.json has the correct routes
- Make sure the static-image.svg file is properly deployed