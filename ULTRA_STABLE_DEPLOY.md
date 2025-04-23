# Ultra-Stable Vercel Deployment Guide

This guide will help you deploy your Warplet Traders frame on Vercel using the most stable and reliable approach.

## Why Use This Approach?

The ultra-stable deployment approach offers several benefits:

1. **Reliability** - Works reliably with no frame errors
2. **Vercel Compatibility** - Perfect for Vercel's hobby plan and its 12-function limit
3. **Button Functionality** - All buttons work correctly (24h, 7d, Check Me, Share)
4. **Real API Integration** - Uses real data from Neynar and Dune Analytics when API keys are provided

## Step 1: Update Your .vercelignore File

Create or update your `.vercelignore` file to include only the files you need for deployment:

```
# Ignore everything by default
*

# Exclude specific directories needed for the application
!public/
!api/

# Ignore all API files except the ones we need
api/*
!api/ultra-stable.js
!api/vercel-real-data.js
```

## Step 2: Create Vercel Configuration

Make sure you have a proper `vercel.json` file:

```json
{
  "buildCommand": "echo 'No build step needed'",
  "outputDirectory": ".",
  "devCommand": "node vercel.dev.js",
  "rewrites": [
    { "source": "/(.*)", "destination": "/api/ultra-stable" }
  ],
  "functions": {
    "api/ultra-stable.js": {
      "memory": 1024,
      "maxDuration": 10
    },
    "api/vercel-real-data.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

## Step 3: Check Your Image Files

Make sure you have these image files in your `public/images/` directory:

- `main.png` - The main frame image
- `traders-24h.png` - Image for 24h data
- `traders-7d.png` - Image for 7d data
- `user-specific.png` - Image for user-specific data
- `loading.png` - Loading indicator
- `error.png` - Error image

## Step 4: Deploy to Vercel

You have two options for deployment:

### Option 1: Deploy via Git

```bash
git add .
git commit -m "Ultra-stable frame implementation"
git push origin main
```

Then connect your repository in the Vercel dashboard.

### Option 2: Deploy via CLI

If you have the Vercel CLI installed:

```bash
vercel --prod
```

## Step 5: Set Environment Variables

After deployment, set the following environment variables in your Vercel project settings:

- `NEYNAR_API_KEY` - For Farcaster social graph data
- `DUNE_API_KEY` - For BASE trading data

## Testing Your Deployment

After deployment, your frame will be available at:

- For ultra-stable implementation (no API calls): `https://your-domain.vercel.app/api/ultra-stable`  
- For implementation with real API data: `https://your-domain.vercel.app/api/vercel-real-data`

## Button Functionality

Both implementations include the following buttons:

1. **24h/7d Data** - Shows top traders for the selected timeframe
2. **Check Me** - Shows top traders among accounts the user follows
3. **Main** - Returns to the main frame
4. **Share** - Redirects to Warpcast composer with pre-filled data

## Troubleshooting

If you experience any issues:

1. **Frame Errors** - Make sure your image URLs are accessible and absolute
2. **API Errors** - Check that your API keys are correctly set
3. **Missing Images** - Verify all required images are in your public/images directory

## Benefits of This Approach

- **Zero Dependencies** - No external libraries or databases needed
- **Maximum Stability** - Works even if API calls fail
- **Fallback Behavior** - Provides realistic data even without API keys
- **Fast Response Time** - Optimized for Vercel's serverless functions
- **Minimal Maintenance** - No database or complex infrastructure to manage