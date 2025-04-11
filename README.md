# Warplet Top Traders

A Warpcast mini-app that transforms blockchain follower trading insights into an engaging, visually dynamic experience. Track trading performances of accounts you follow on Warpcast with intuitive, real-time interactions.

## Features

- View top 5 traders among the accounts you follow
- Compare 24-hour and 7-day performance
- Achievement system with animated unlocks
- Share results via Warpcast

## Deployment on Vercel

### Prerequisites

1. Create a [Vercel](https://vercel.com) account if you don't have one
2. Make sure you have the following API keys:
   - Neynar API key - for Warpcast data
   - Dune Analytics API key - for trading data

### Deployment Steps

1. **Prepare your repository**

   First, create a GitHub repository and push your code to it. You can use the following commands:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/warplet-top-traders.git
   git push -u origin main
   ```

2. **Connect to Vercel**

   - Go to [Vercel](https://vercel.com) and sign in
   - Click "Add New" > "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project Settings**

   In the configuration page:
   - **Framework Preset**: Select "Other" (since we have a custom setup)
   - **Build and Output Settings**:
     - Build Command: `npm run build` (this is already configured in package.json)
     - Output Directory: `dist` (already set in vercel.json)
   - **Environment Variables**:
     - Add `NEYNAR_API_KEY` and your Neynar API key value
     - Add `DUNE_API_KEY` and your Dune Analytics API key value
     - Add `SESSION_SECRET` with a random secure string

4. **Deploy**

   - Click "Deploy"
   - Wait for the build to complete (this may take a few minutes)
   - Vercel will provide you with a URL when deployment is successful (e.g., https://your-project.vercel.app)

5. **Post-Deployment**

   - Test that your application works correctly
   - Add your custom domain if you have one (through Vercel's domain settings)

### Troubleshooting

If you encounter issues during deployment:

1. Check the Vercel build logs for errors
2. Ensure your API keys are correctly set in the Environment Variables
3. Make sure the API routes are correctly defined in the `api` directory

## Development

To run this project locally:

```bash
npm install
npm run dev
```

This will start the development server at http://localhost:3000.