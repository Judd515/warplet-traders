# Vercel Minimal Deployment Instructions

## Issue: Hobby Plan Function Limit
You're encountering the Vercel Hobby plan's 12 Serverless Function limit. To solve this, we need to create a minimal deployment package containing only the essential files.

## Minimal Deployment Solution

### Step 1: Create a separate deployment branch
Create a branch specifically for deployment with only the necessary files:

```bash
git checkout -b minimal-deploy
```

### Step 2: Prepare a minimal .vercelignore file
Create or update your .vercelignore file to exclude most API functions:

```
# Exclude all API files except the ones we need
api/all-routes.js
api/base64.js
api/db.js
api/direct-html.js
api/edge.js
api/edge-frame.js
api/frame-action.js
api/frame-debug.js
api/frame-service.js
api/minimal-headers.js
api/one-file-frame.js
api/one-file-frame-real-data.js
api/serverless-handler.js
api/serverless-storage.js
api/simple-frame.js
api/simple-profile-frame.js
api/storage.js
api/test-neynar.js
api/traders.js
api/ultra-minimal.js
api/ultra-stable.js
api/ultra-stable-backup.js
api/vercel-minimal-frame.js
api/vercel-real-data.js
api/warpcast-stable.js
api/warpcast-stable-updated.js
api/profile-cache.js
api/profile-handler.js

# Keep only the essential files we need
!api/real-data-frame.js
!api/health.js
!api/index.js
```

### Step 3: Push only essential files to deployment branch
Keep only the essential files we need for deployment:

1. The real-data-frame.js implementation - uses real API data from Neynar and Dune
2. A health check endpoint
3. Your public images folder
4. Your Vercel configuration

### Step 4: Update the post_url in real-data-frame.js
Make sure the post_url in the frame HTML references your Vercel domain:

```javascript
<meta property="fc:frame:post_url" content="https://your-vercel-app.vercel.app/api/real-data-frame">
```

### Step 5: Deploy the minimal branch
Push your minimal-deploy branch to GitHub and deploy it to Vercel:

```bash
git push origin minimal-deploy
```

Then in Vercel, you can either:
1. Create a new project pointing to this branch
2. Update your existing project to deploy from this branch

## Essential Files for Deployment
1. **api/real-data-frame.js** - The main frame handler using real API data (Neynar & Dune)
2. **api/health.js** - Simple health check endpoint
3. **public/images/** - Directory with all your image assets
4. **.vercelignore** - Configured to exclude unnecessary functions

## Post-Deployment
After deploying, test your frame by accessing:
- https://your-vercel-app.vercel.app/api/real-data-frame

This approach ensures you stay within the 12-function limit while still having a fully functional frame implementation.