# Serverless Deployment Update

This folder contains the updated files needed for proper serverless deployment on Vercel. The key changes include:

1. **Serverless-compatible storage** - The `serverless-storage.js` file replaces the memory storage with a version that works in stateless serverless functions.

2. **Session configuration** - The Express session middleware has been updated to work correctly in a serverless environment.

3. **Initial state handling** - The storage now displays a "Click Refresh" placeholder when first loaded to guide users.

## Deployment Guide

1. Ensure your Vercel project has both API keys set in the Environment Variables:
   - `NEYNAR_API_KEY`
   - `DUNE_API_KEY`

2. Push these files to your GitHub repository

3. Re-deploy your Vercel project, making sure to include the `/api` directory in the deployment

4. Your app should now properly handle the serverless environment!

## Troubleshooting

If you encounter any issues:

1. Check the Vercel deployment logs for specific errors
2. Verify that both API keys are correctly set in your Vercel project settings
3. Make sure the `/api` directory is included in your GitHub repository