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
2. Try the recommended implementation by visiting `https://your-domain.vercel.app/best-frame.html` 
3. This page shows the 7-day timeframe data with beautifully formatted share text
4. The share button pre-formats a message with emoji-enhanced trader data
5. Even if frame detection fails, the cast still shows all the important data
6. Verify that the frame appears and the Share button works correctly

## Step 5: Share on Warpcast
The most reliable way to share your frame on Warpcast is to use our enhanced share format:

1. Visit `https://your-domain.vercel.app/best-frame.html`
2. Click the "Share Results" button which takes you to Warpcast with pre-formatted text
3. The pre-formatted text includes:
   - Emoji-formatted trader data (✅ for positive PnL, ⛔ for negative PnL)
   - All the top traders with their performance metrics
   - The frame URL at the end

This approach creates a visually appealing cast that works with or without frame detection:

## Troubleshooting
If you encounter any issues:
- **Frame not rendering**: Our solution works even without frame rendering since all data is in the cast text
- **Frame detection issue**: If Warpcast doesn't detect the frame, the emoji-formatted cast text still looks great
- **Buttons not working**: Check that your domain is correctly set in all references
- **No data displayed**: Make sure your API keys are set correctly in Vercel
- **SVG not loading**: Try using a different browser or clearing your cache
- **API errors**: Check for any CORS issues in your browser console
- **General frame issues**: Try some of the alternate implementations on the homepage

## Need More Help?
Check out the full documentation in WARPCAST_FRAME_INSTRUCTIONS.md for more details on the available options and how to debug common issues.