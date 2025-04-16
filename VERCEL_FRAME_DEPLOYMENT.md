# Vercel Deployment Guide for Warpcast Frames

## The Issue: Frame Communication in Production

From the error screenshot, it's clear that we're encountering a "Frame error: Unknown error communicating with the frame server" when trying to interact with the Warpcast frame. This usually happens when:

1. The `post_url` is not an absolute URL in production
2. CORS headers are not properly set for the API endpoint
3. The API endpoint is not correctly handling the frame POST request

## Solution Steps

### 1. Update clean-frame.html with Absolute URLs

The main entry point `public/clean-frame.html` has been updated to use absolute URLs in production:

```html
<meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/frame-action">
```

### 2. Use the Correct Route in all-routes.js

Make sure the route mapping in `deploy/api/all-routes.js` includes:

```javascript
if (path === '/api/frame-action' || path === '/frame-action') {
  return simpleFrameHandler(req, res);
}
```

### 3. Enhanced CORS Headers

All API endpoints now include proper CORS headers to ensure frame communication works:

```javascript
// Set CORS headers - critical for frame communication
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Requested-With');
res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
```

### 4. Dedicated API File for Vercel

A new file `simple-api-vercel.js` has been created, which is optimized for Vercel deployment. It always uses absolute URLs for frames.

## Deployment Process

1. Push these changes to your GitHub repository
2. Deploy to Vercel using the following settings:
   - Framework preset: Other
   - Build command: `node build-frame.js`
   - Output directory: public
   - Install command: `npm install`

## Testing the Deployment

After deploying, test the frame by:

1. First accessing the clean-frame.html in the browser
2. Verify the frame loads
3. Click each button to check if the frame updates correctly
4. If errors occur, check Vercel logs for specific issues

## Debugging Tips

If you still see frame errors after deploying:

1. Check the Network tab in browser dev tools to see if the API requests to `/api/frame-action` are working
2. Verify the response headers include the CORS headers
3. Test with a direct curl request to the API endpoint
4. Check Vercel function logs for any errors

## Important Routes

- Main frame entry: `/clean-frame.html`
- API endpoint: `/api/frame-action`
- Health check: `/api/health`