# Deployment Instructions for Warplet Traders

This document outlines the steps to deploy the Warplet Traders app to Vercel's Hobby plan.

## Prerequisites

1. A Vercel account
2. Required environment variables:
   - `DATABASE_URL` - PostgreSQL database connection string (Neon.tech)
   - `NEYNAR_API_KEY` - API key for Neynar
   - `DUNE_API_KEY` - API key for Dune Analytics

## Deployment Steps

### Option 1: Direct Deployment from GitHub

1. Fork or push the repository to GitHub
2. Connect Vercel to your GitHub repository
3. Configure environment variables in the Vercel project settings
4. Deploy from the main branch

### Option 2: Manual Deployment using Vercel CLI

1. Navigate to the `deploy` directory:
   ```bash
   cd deploy
   ```

2. Install Vercel CLI globally if you haven't already:
   ```bash
   npm install -g vercel
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy to production:
   ```bash
   vercel --prod
   ```

5. When prompted, add the required environment variables

## Troubleshooting

### Image Caching Issues

If Warpcast is caching old images, the deployment includes cache-busting parameters:

- Static version parameter: `?v=20250415`
- Dynamic timestamp parameter: `&t=${Date.now()}`

If you need to update the cache-busting version:

1. Run the update command to update all OG image references:
   ```bash
   for file in client/index.html public/index.html api/all-routes.js api/frame-action.js api/index.js api/direct-html.js api/minimal.js api/edge.js deploy/api/all-routes.js deploy/public/index.html; do
     if [ -f "$file" ]; then
       sed -i 's|og.png?v=[0-9]\+|og.png?v=YYYYMMDD|g' "$file"
       echo "Updated: $file"
     fi
   done
   ```
   (Replace `YYYYMMDD` with the current date)

2. Regenerate the deployment package:
   ```bash
   node create-minimal-deploy.js
   ```

### Vercel Hobby Plan Limitations

This project works around the 12 serverless function limit by:

1. Consolidating API endpoints into a single `all-routes.js` handler
2. Using the `.vercelignore` file to exclude unnecessary files
3. Implementing a minimal deployment structure

## Post-Deployment Verification

After deployment, test the following:

1. Open the app URL in a browser to verify the frontend works
2. Test the API endpoint: `https://your-domain.vercel.app/api/all-routes`
3. Test the Frame in Warpcast by sharing the URL