# Deploying to Vercel (Hobby Plan)

This document explains how to deploy this application to Vercel's Hobby plan while working within the 12 serverless function limit.

## Key Strategy

This app uses a consolidated API approach where all endpoints are handled by a single serverless function (`api/all-routes.js`). This works around the 12-function limit on the Hobby plan by using a single entry point.

## Files Required for Deployment

Only a minimal set of files is needed for deployment:

- `api/all-routes.js` - The single serverless function that handles all API routes
- `public/index.html` - Static HTML for the web interface
- `public/og.png` - The OpenGraph image used by Warpcast Frame
- `vercel.json` - Configuration for routing and function settings
- `package.json` - Minimal dependencies

## Vercel Configuration

The `vercel.json` file is configured to:

1. Skip the standard build process (which would fail without the full codebase)
2. Route all API requests to the single handler
3. Configure memory and timeout settings for the function

```json
{
  "version": 2,
  "buildCommand": "echo 'Skipping build step'",
  "installCommand": "npm ci --omit=dev",
  "functions": {
    "api/all-routes.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "rewrites": [
    { "source": "/", "destination": "/api/all-routes.js" },
    { "source": "/api", "destination": "/api/all-routes.js" },
    { "source": "/api/(.*)", "destination": "/api/all-routes.js" }
  ]
}
```

## Deployment Steps

1. Ensure your `.vercelignore` file is properly configured to only include necessary files
2. Push your changes to GitHub
3. Deploy from the Vercel dashboard or CLI

## Deployment Scripts

For manual, controlled deployments, you can use the `create-minimal-deploy.js` script to create a deployment-ready directory with only the essential files:

```bash
node create-minimal-deploy.js
cd deploy
vercel
```

## Environment Variables

Make sure to set these environment variables in your Vercel project:

- `NEYNAR_API_KEY` - For Warpcast integration
- `DUNE_API_KEY` - For trader data
- `DATABASE_URL` - For data persistence

## Debugging Deployment Issues

If you encounter issues:

1. Check Vercel deployment logs for errors
2. Verify the function limit is not being exceeded
3. Ensure all necessary files are included (and unnecessary ones excluded)
4. Confirm environment variables are properly set

Remember that production logs can be viewed in the Vercel dashboard under "Functions" when debugging runtime issues.