# Deploying to Vercel Hobby Plan

## Problem
The Vercel Hobby plan has a limit of 12 serverless functions per deployment. This project might exceed that limit when deploying all API files.

## Solution
We've implemented multiple strategies to work within this limit:

### Option 1: Use a consolidated API endpoint
The `api/all-routes.js` file serves as a combined handler for all API routes. This means we only need one serverless function instead of multiple.

### Option 2: Use .vercelignore
The `.vercelignore` file is configured to exclude all API files except `all-routes.js`. This prevents Vercel from creating serverless functions for each API file.

### Option 3: Manual deployment of a minimal version
If the above automated methods don't work, you can create a minimal deployment directory with only the essential files:

```bash
# Create deploy directory with minimal files
mkdir -p deploy/api deploy/public

# Copy only the necessary files
cp api/all-routes.js deploy/api/
cp public/index.html deploy/public/
cp public/og.png deploy/public/  # Required for frame
cp vercel.json deploy/

# Create a minimal package.json
echo '{
  "name": "warplet-top-traders",
  "version": "1.0.0", 
  "dependencies": { 
    "express": "^4.18.2" 
  }
}' > deploy/package.json

# Deploy from the minimal directory
cd deploy
vercel
```

## Important Notes

1. All API requests are directed to `api/all-routes.js` via the rewrites in `vercel.json`.
2. Static assets (HTML, images) are served from the `public` directory.
3. The only serverless function that should be deployed is `api/all-routes.js`.

## Troubleshooting

If you still see the 12 function limit error, check these common issues:

1. Make sure your `.vercelignore` file is in the root directory of your project.
2. Check that the patterns in `.vercelignore` correctly match your file paths.
3. Try deploying with the CLI instead of GitHub integration as it provides more debugging options.

```bash
vercel --debug
```