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
2. Try the recommended implementation by visiting `https://your-domain.vercel.app/direct-share.html` 
3. This page shows the 7-day timeframe data and provides pre-formatted text that can be copied
4. When sharing, simply copy the entire text block and paste it directly into Warpcast
5. No text modifications are needed - the frame will display automatically
6. Verify that the frame appears and the Share button works correctly

## Step 5: Share on Warpcast
The most reliable way to share your frame on Warpcast is to use the copy-paste approach:

1. Visit `https://your-domain.vercel.app/direct-share.html`
2. Click the "Copy to Clipboard" button (or click on the text block)
3. Open Warpcast and create a new cast
4. Paste the copied text directly into your cast
5. Post your cast - the frame will display automatically!

This approach provides a pre-formatted message that includes both the trader data and the frame URL:

## Troubleshooting
If you encounter any issues:
- **Frame not detected**: Use the direct-share.html copy-paste approach instead of sharing a URL
- **Copy button not working**: Try clicking directly on the text box to copy
- **Frame doesn't load**: Make sure the full text including the URL was copied correctly
- **Buttons not working**: Check that your domain is correctly set in all references
- **No data displayed**: Make sure your API keys are set correctly in Vercel
- **SVG not loading**: Try using a different browser or clearing your cache
- **API errors**: Check for any CORS issues in your browser console

## Need More Help?
Check out the full documentation in WARPCAST_FRAME_INSTRUCTIONS.md for more details on the available options and how to debug common issues.