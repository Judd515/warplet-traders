# URLs to Test After Deployment

## API Endpoints (Direct Access)
Test these URLs directly in your browser to see if they return a response:

1. `https://warplet-traders.vercel.app/api` - Now using export default format
2. `https://warplet-traders.vercel.app/api/direct-html` - Direct HTML handler 
3. `https://warplet-traders.vercel.app/api/edge` - Edge function
4. `https://warplet-traders.vercel.app/api/all-routes` - Combined handler

## Pages/API Format
Vercel's preferred API route format:

1. `https://warplet-traders.vercel.app/api/index` - Pages API index
2. `https://warplet-traders.vercel.app/api/direct-html` - Pages API direct-html

## Frame HTML Pages (For Warpcast)
Post these URLs to Warpcast to test the frames:

1. `https://warplet-traders.vercel.app/ultra-minimal.html` - Simplest frame
2. `https://warplet-traders.vercel.app/edge-frame.html` - Edge function frame
3. `https://warplet-traders.vercel.app/direct-html-frame.html` - Direct HTML frame
4. `https://warplet-traders.vercel.app/all-routes-frame.html` - All routes frame
5. `https://warplet-traders.vercel.app/pages-api-frame.html` - Pages API frame
6. `https://warplet-traders.vercel.app/static-frame.html` - Static fallback (no API)

## Testing Process

1. First, check the API endpoints directly in your browser to see if they return any response
2. If direct API access works, test the frames in Warpcast
3. Check if button interactions work properly

The Pages/API format is most likely to work out of the box with Vercel, as it's their preferred way of handling API routes.