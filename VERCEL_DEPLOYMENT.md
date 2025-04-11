# Vercel Deployment Instructions

This document provides detailed steps to successfully deploy your Warpcast Top Traders application to Vercel.

## Prerequisites

1. A Vercel account linked to your GitHub account
2. A PostgreSQL database (Vercel Postgres or Neon works well)
3. Neynar API key
4. Dune Analytics API key

## Environment Variables

Set up the following environment variables in your Vercel project settings:

1. `DATABASE_URL` - Your PostgreSQL database connection string
2. `NEYNAR_API_KEY` - Your Neynar API key for fetching Warpcast followers
3. `DUNE_API_KEY` - Your Dune Analytics API key for fetching trading data
4. `NODE_ENV` - Set to "production"

## Deployment Steps

1. Push this codebase to your GitHub repository

2. Create a new project in Vercel and link it to your GitHub repository

3. Configure the environment variables in your Vercel project settings under "Settings" > "Environment Variables"

4. Set up the build configuration (should be auto-detected):
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. Deploy your project by clicking "Deploy"

## Troubleshooting

If your deployment shows a blank screen:

1. Check the Vercel function logs for errors
2. Verify that all environment variables are correctly set
3. Make sure your database is accessible from Vercel's servers
4. Check that the API routes are correctly configured in vercel.json

## Database Migration

This project uses Drizzle ORM. To set up your database schema:

1. Clone the repository locally
2. Configure the DATABASE_URL in your local .env file
3. Run `npm run db:push` to push the schema to your database

## API Endpoints

The project uses two main API endpoints:

- `GET /api/traders` - Retrieves trader data
- `POST /api/refresh-data` - Refreshes trader data from Neynar and Dune

These endpoints are already configured in vercel.json to use the serverless handler.

## Testing the Deployment

After deployment:

1. Visit your deployed site
2. Click the "Refresh" button to fetch fresh data
3. Toggle between 24h and 7d views to verify timeframe functionality
4. Test the Share button to ensure Warpcast sharing works correctly