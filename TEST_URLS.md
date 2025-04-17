# Warplet Traders Test URLs

## Static Frame Solution
These URLs use direct link-based navigation with no API dependencies:

- **Main Frame:** https://warplet-traders.vercel.app/static-frame.html
- **24h Data:** https://warplet-traders.vercel.app/static-24h.html
- **7d Data:** https://warplet-traders.vercel.app/static-7d.html
- **About Page:** https://warplet-traders.vercel.app/about.html

## API-Based Solutions (In-Frame Updates)
These solutions attempt to use API endpoints to handle frame interactions without navigating to new pages:

### Basic PNG Image Approach
Uses direct hosted PNG images with minimal API:
- **Entry Point:** https://warplet-traders.vercel.app/api-test.html
- **API Endpoint:** https://warplet-traders.vercel.app/api/ultra-minimal

### Minimal Headers Approach
Uses only the essential frame headers to maximize compatibility:
- **Entry Point:** https://warplet-traders.vercel.app/minimal-headers.html
- **API Endpoint:** https://warplet-traders.vercel.app/api/minimal-headers

### Base64 Image Approach
Uses base64-encoded SVG images to avoid remote URL loading:
- **Entry Point:** https://warplet-traders.vercel.app/base64-test.html
- **API Endpoint:** https://warplet-traders.vercel.app/api/base64

### Other API Approaches
These may still return 500 errors but are available for testing:
- **Standard API:** https://warplet-traders.vercel.app/api
- **Direct HTML:** https://warplet-traders.vercel.app/api/direct-html
- **Edge Function:** https://warplet-traders.vercel.app/api/edge
- **Pages API:** https://warplet-traders.vercel.app/pages/api

## Development Testing
When testing locally, use:

- **Local Static Frame:** http://localhost:5000/static-frame.html
- **Local API Test:** http://localhost:5000/api-test.html
- **Local Minimal Headers:** http://localhost:5000/minimal-headers.html
- **Local Base64 Test:** http://localhost:5000/base64-test.html

## Troubleshooting Notes

1. If images fail to load in Warpcast:
   - Try the base64-test.html approach which embeds images directly
   - Try the minimal-headers.html approach which uses dummyimage.com
   - Try the static-frame.html approach as a fallback

2. If API endpoints return 500 errors:
   - Try the static frame solution which avoids API calls
   - Try the minimal-headers approach which has minimal overhead
   - Try the base64 approach which doesn't require external resources

3. If buttons navigate to new pages instead of updating in-frame:
   - This is expected with the static solution (static-frame.html)
   - Try the API-based solutions which should update in-frame if they work properly
   - The base64-test.html approach has the best chance of working with in-frame updates