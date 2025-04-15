# Warplet Traders - Warpcast Frame Instructions

## What We've Built
A dynamic Warpcast mini-app that displays which people you are following are top traders on BASE using their warplet (Warpcast's built-in wallet). The app shows real-time PnL (Profit and Loss) for the top traders among the accounts you follow.

## Multiple Frame Options Available

We've created several different frame versions to test which works best with Warpcast:

1. **Simple Static Frame**: `https://your-domain.vercel.app/static.html`
   - Just displays data with no buttons

2. **Single Button Frame**: `https://your-domain.vercel.app/tiny.html`
   - One button, minimal implementation

3. **Text Only Frame with Button**: `https://your-domain.vercel.app/text-only.html`
   - Simple frame with one button and base64 encoded SVG

4. **Full Frame with Multiple Buttons**: `https://your-domain.vercel.app/fallback.html`
   - Complete interface with three buttons (24h, 7d, Share)

## API Endpoints

We've also created multiple API handlers to test compatibility:

1. **Minimal Handler**: `/api/minimal`
   - Ultra-simple implementation with minimal dependencies

2. **Frame Action Handler**: `/api/frame-action`
   - More advanced handler that generates dynamic SVGs

3. **All Routes Handler**: `/api/all-routes`
   - Combined handler that can process different request types

## Deployment Instructions

To deploy this to Vercel:

1. Push this code to your GitHub repository
   ```
   git remote add origin https://github.com/your-username/warplet-traders.git
   git add .
   git commit -m "Warplet Traders Frame"
   git push -u origin main
   ```

2. Create a new Vercel project and connect to your GitHub repository

3. Set up the following environment variables in Vercel:
   - `NEYNAR_API_KEY` - Your Neynar API key (for social data)
   - `DUNE_API_KEY` - Your Dune Analytics API key (for trading data)
   - `DATABASE_URL` - Your PostgreSQL connection string

4. Deploy the project

5. Set your domain in Vercel settings

6. Update all post_url references in the HTML files to use your domain instead of "warplet-traders.vercel.app"

7. Test your frames by posting them on Warpcast

## Debugging Frame Issues

If you encounter "Unknown error communicating with the frame server" errors:

1. Try the simpler frame implementations first (tiny.html, static.html)
2. Check that your post_url is correctly set to your domain
3. Make sure your API endpoint responds with the proper FC frame headers
4. Use Frame DevTools in Warpcast to debug frame issues
5. Add debugging logs to your API handlers to see what's coming in

## Next Steps

1. Switch from sample data to using real data from Dune Analytics
2. Implement 7-day timeframe data fetching
3. Add achievement badges for top traders
4. Create interactive UI components for the web experience