# Quick Deployment Guide for Warplet Traders

## Step 1: Fork and Clone the Repository
```
git clone https://github.com/your-username/warplet-traders.git
cd warplet-traders
```

## Step 2: Deploy on Vercel
1. Create a [Vercel](https://vercel.com) account if you don't have one
2. From the Vercel dashboard, click "Add New" > "Project"
3. Import your GitHub repository
4. Set the following environment variables:
   - `NEYNAR_API_KEY`: Your Neynar API key
   - `DUNE_API_KEY`: Your Dune Analytics API key
   - `DATABASE_URL`: PostgreSQL connection string

## Step 3: Update Domain References
After deploying, update all references to "warplet-traders.vercel.app" in the code to your own Vercel domain.

## Step 4: Test Your Deployment
1. Once deployed, visit `https://your-domain.vercel.app` to see all the frame options
2. Try the recommended implementation by visiting `https://your-domain.vercel.app/auto-frame.html` 
3. This version shows the 7-day timeframe data with a Share button that properly renders the frame
4. For best automatic frame detection, share ONLY the URL with no additional text
5. Cast the URL on Warpcast to test how the frame appears and verify that the Share button works correctly

## Step 5: Share on Warpcast
Share your frame on Warpcast with JUST the URL for the most reliable frame detection:
```
https://your-domain.vercel.app/auto-frame.html
```

Or if you want to add a message:
```
Check out my Top Warplet Traders app! See which of your follows are crushing it on BASE 📊

https://your-domain.vercel.app/auto-frame.html
```

## Troubleshooting
If you encounter any issues:
- Make sure your API keys are set correctly in Vercel
- Try using the simpler frames first (super-minimal.html, static.html)
- Check for any CORS issues in your browser console
- Verify that your domain is correctly set in all post_url references

## Need More Help?
Check out the full documentation in WARPCAST_FRAME_INSTRUCTIONS.md for more details on the available options and how to debug common issues.