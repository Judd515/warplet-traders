# Vercel Minimal Deployment Guide

This guide helps you deploy your Warplet Top Traders frame to Vercel's Hobby plan, which has a limit of 12 serverless functions per project.

## The Problem

Vercel's Hobby plan limits you to no more than 12 serverless functions per deployment. Our project has more API endpoints than this limit allows, causing deployments to fail with the error:

```
Error: No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan. 
Create a team (Pro plan) to deploy more. Learn More: https://vercel.link/function-count-limit
```

## The Solution

We've created a deployment script that will:

1. Back up all your API files
2. Create a `.vercelignore` file that excludes all but the essential API endpoints
3. Let you deploy only the most important functions to stay under the limit

## Deployment Steps

### 1. Prepare for Deployment

Run the script to create a minimal deployment package:

```bash
node create-minimal-deploy.js
```

This will:
- Create a backup of all API files in `.api_backup/`
- Generate a `.vercelignore` file that excludes non-essential API endpoints

### 2. Deploy to Vercel

Run the Vercel deployment command:

```bash
vercel --prod
```

### 3. Restore Your Dev Environment (After Deployment)

After successful deployment, restore your development environment:

```bash
node restore-api-files.js
```

This will:
- Restore all API files from the backup
- Reset the `.vercelignore` file

## Essential Endpoints

The minimal deployment includes only these essential endpoints:

1. `api/warpcast-stable.js` - Our ultra-stable endpoint with no external API dependencies
2. `api/health.js` - Health check endpoint
3. `api/index.js` - Main API entry point
4. `api/frame-action.js` - Frame action handler
5. `api/minimal.js` - Minimal implementation

## Production URLs

After deployment, your frame will be available at:

- Main URL: `https://warplet-traders.vercel.app`
- Ultra-stable URL: `https://warplet-traders.vercel.app/warpcast-frame.html`

## Troubleshooting

If you encounter issues:

1. Check the Vercel deployment logs
2. Verify that the `.vercelignore` file was created correctly
3. Make sure you have the latest changes pushed to your repository

If all else fails, you can manually edit the `.vercelignore` file to exclude specific API endpoints.