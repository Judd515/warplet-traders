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
4. When sharing, paste ONLY the URL and then make a small edit to the text
5. Warpcast requires some interaction with the composer text to trigger frame detection
6. Verify that the frame appears and the Share button works correctly

## Step 5: Share on Warpcast
Share your frame on Warpcast with JUST the URL for the most reliable frame detection:
```
https://your-domain.vercel.app/auto-frame.html
```

**Important:** After pasting the URL, add a space character or make any small change to the text. Warpcast requires some interaction with the composer text to trigger frame detection.

You can also add a custom message:
```
Check out my Top Warplet Traders app! See which of your follows are crushing it on BASE 📊

https://your-domain.vercel.app/auto-frame.html
```

Remember to always make a small edit to the text after pasting to ensure the frame renders properly.

## Troubleshooting
If you encounter any issues:
- **Frame not detected**: Always make a small edit to the composer text after pasting the URL
- **Frame doesn't appear**: Try pasting just the URL with no additional text
- **Buttons not working**: Check that your domain is correctly set in all post_url references
- **No data displayed**: Make sure your API keys are set correctly in Vercel
- **SVG not loading**: Try the simpler frames first (super-minimal.html, static.html)
- **API errors**: Check for any CORS issues in your browser console

## Need More Help?
Check out the full documentation in WARPCAST_FRAME_INSTRUCTIONS.md for more details on the available options and how to debug common issues.