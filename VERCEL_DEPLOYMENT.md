# Vercel Deployment Instructions

This document provides detailed steps to successfully deploy your Warpcast Top Traders application to Vercel.

## Prerequisites

1. A Vercel account linked to your GitHub account
2. A PostgreSQL database (Vercel Postgres or Neon works well)
3. Neynar API key
4. Dune Analytics API key

## Important Files for Deployment

We've prepared several files specifically for Vercel deployment:

1. `vercel.json` - Contains routing rules and build configuration
2. `build.sh` - Custom build script to copy files to the right locations
3. `server-vercel.js` - Express server for Vercel's serverless environment
4. `api/serverless-handler.js` - Handler for API routes on Vercel

## Environment Variables

Set up the following environment variables in your Vercel project settings:

1. `DATABASE_URL` - Your PostgreSQL database connection string
2. `NEYNAR_API_KEY` - Your Neynar API key for fetching Warpcast followers
3. `DUNE_API_KEY` - Your Dune Analytics API key for fetching trading data
4. `NODE_ENV` - Set to "production"

## Deployment Steps

1. **Download the project**: 
   - Use Replit's "Download as ZIP" feature from the Files menu (three dots)
   - Extract the ZIP on your computer

2. **Push to GitHub**:
   - Create a new repository or use your existing one
   - Push all the files to your GitHub repository

3. **Create a Vercel project**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - The framework preset should be "Vite"

4. **Configure environment variables**:
   - Go to "Settings" > "Environment Variables" in your Vercel project
   - Add all required environment variables listed above

5. **Deploy**:
   - Click "Deploy" at the bottom of the page
   - Vercel will use our custom build script to handle deployment

## PostgreSQL Database Setup

You need a Postgres database for your deployment. Two good options:

1. **Neon Database (Free Tier)**:
   - Go to https://neon.tech
   - Sign up and create a new project
   - Get the connection string from the dashboard

2. **Vercel Postgres**:
   - In your Vercel project dashboard
   - Go to Storage tab
   - Create a new Postgres database

## Troubleshooting

If you encounter issues with deployment:

1. **Check build logs**: 
   - Look for errors in the Vercel build logs
   - Make sure the build.sh script is executing properly

2. **Verify API access**:
   - Test API endpoints directly (e.g., https://yourdomain.vercel.app/api/traders)
   - Check environment variables are set correctly

3. **Database connectivity**:
   - Make sure your DATABASE_URL is correct and accessible from Vercel
   - Run npm run db:push locally to set up the schema first

## Testing the Deployment

After successful deployment:

1. Visit your deployed site
2. The app should automatically fetch data on load
3. Test switching between 24h and 7d timeframes
4. Try the Share button to ensure Warpcast sharing works