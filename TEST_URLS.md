# Warplet Traders Test URLs

## Latest Solution (Recommended)

### Ultra-Simple Frame Approach
The simplest possible implementation with no complex processing:
- **Entry Point:** https://warplet-traders.vercel.app/simple-frame-test.html
- **API Endpoint:** https://warplet-traders.vercel.app/api/simple-frame

## Previous API-Based Solutions (In-Frame Updates)
These solutions also attempt to use API endpoints to handle frame interactions:

### Base64 Image Approach
Uses base64-encoded SVG images to avoid remote URL loading:
- **Entry Point:** https://warplet-traders.vercel.app/base64-test.html
- **API Endpoint:** https://warplet-traders.vercel.app/api/base64

### Minimal Headers Approach
Uses only the essential frame headers:
- **Entry Point:** https://warplet-traders.vercel.app/minimal-headers.html
- **API Endpoint:** https://warplet-traders.vercel.app/api/minimal-headers

### Basic PNG Image Approach
Uses direct hosted PNG images:
- **Entry Point:** https://warplet-traders.vercel.app/api-test.html
- **API Endpoint:** https://warplet-traders.vercel.app/api/ultra-minimal

## Static Frame Solution (No API)
These URLs use direct link-based navigation with no API dependencies:

- **Main Frame:** https://warplet-traders.vercel.app/static-frame.html
- **24h Data:** https://warplet-traders.vercel.app/static-24h.html
- **7d Data:** https://warplet-traders.vercel.app/static-7d.html
- **About Page:** https://warplet-traders.vercel.app/about.html

### Other API Approaches
- **Standard API:** https://warplet-traders.vercel.app/api
- **Direct HTML:** https://warplet-traders.vercel.app/api/direct-html
- **Edge Function:** https://warplet-traders.vercel.app/api/edge
- **Pages API:** https://warplet-traders.vercel.app/pages/api

## Development Testing
When testing locally, use:

- **Local Simple Frame:** http://localhost:5000/simple-frame-test.html
- **Local Base64 Test:** http://localhost:5000/base64-test.html
- **Local Minimal Headers:** http://localhost:5000/minimal-headers.html
- **Local Static Frame:** http://localhost:5000/static-frame.html

## Troubleshooting Notes

1. **First Try:** Ultra-Simple Frame Approach
   - This has the simplest API implementation with minimal error surface
   - Uses base64 SVG images embedded directly in the HTML
   - Has special handling for button clicks to maximize compatibility

2. **If That Doesn't Work:** Base64 Image Approach
   - Similar to the ultra-simple approach but with slightly different implementation
   - Also uses embedded base64 SVG images

3. **If API Endpoints Return 500 Errors:**
   - Try the static frame solution which avoids API calls entirely
   - This works but will open new pages instead of updating in-frame

4. **If Images Don't Display:**
   - All the latest approaches use base64-encoded SVGs that don't require external URLs
   - This should resolve any image loading issues in Warpcast