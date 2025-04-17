# Fixing Vercel API 500 Errors: Troubleshooting Guide

If you're seeing 500 (INTERNAL_SERVER_ERROR) errors with your Vercel API functions, here are systematic steps to troubleshoot and fix the issue:

## 1. Check Basic Functionality

We've created an ultra-minimal API at `/api/index.js` that returns plain text. If this still returns a 500 error, the issue is likely with the Vercel configuration, not your code.

## 2. Environment Variables

Make sure all required environment variables are set in the Vercel project dashboard:
- Go to Project Settings > Environment Variables
- Verify that NEYNAR_API_KEY and DUNE_API_KEY are set
- Check that DATABASE_URL is configured properly

## 3. Vercel Configuration

We've added a `vercel.json` file that explicitly configures the serverless functions:
- Reduces memory to 128MB (the minimum)
- Sets a 10-second timeout
- Ensures proper routing of API requests

## 4. Test with Ultra-Minimal Frame

We've created `public/ultra-minimal.html` which uses the smallest possible frame code to test the API functionality. Visit this URL to test:
```
https://warplet-traders.vercel.app/ultra-minimal.html
```

## 5. Check Vercel Logs

The most useful debugging information will be in the Vercel function logs:
1. Go to your Vercel dashboard
2. Navigate to the project
3. Click on "Deployments"
4. Select the latest deployment
5. Click on "Functions"
6. Look for the `/api` function and check its logs

## 6. Local Testing

If possible, test the API locally to confirm it works:
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull

# Run development server
vercel dev
```

## 7. Function Size

Vercel has limits on function size. Try simplifying your function to see if that's the issue:
- Remove unnecessary dependencies
- Split into smaller functions
- Use dynamic imports for large libraries

## 8. Serverless vs Edge Functions

Consider switching to edge functions if there are issues with the serverless environment:
- Create a new API endpoint at `/api/edge.js`
- Use edge-compatible code (simpler, fewer dependencies)
- Export a function with the proper edge runtime annotation

## 9. Alternative Solution

If API functions continue to fail, consider using static HTML files with direct links between them:
- See `public/static-frame.html` and related files for examples
- This approach doesn't use APIs but loses the ability to refresh frame content in place

## 10. Contact Vercel Support

If all else fails, contact Vercel support with:
- Function logs
- Error messages
- Deployment information
- Minimal reproduction steps