# Warplet Traders Test URLs

## Latest Solutions (In-Frame Updates)

### NEW: Edge Runtime Frame
Uses Vercel Edge Runtime instead of Node.js runtime for better compatibility:
- **Entry Point:** https://warplet-traders.vercel.app/edge-frame-test.html
- **API Endpoint:** https://warplet-traders.vercel.app/api/edge-frame

### NEW: Debug Frame
Logs detailed information about requests to help diagnose issues:
- **Entry Point:** https://warplet-traders.vercel.app/debug-frame.html
- **API Endpoint:** https://warplet-traders.vercel.app/api/frame-debug

### Ultra-Simple Frame
Simple implementation with minimal processing:
- **Entry Point:** https://warplet-traders.vercel.app/simple-frame-test.html
- **API Endpoint:** https://warplet-traders.vercel.app/api/simple-frame

## Previous API-Based Solutions

### Base64 Image Approach
Uses base64-encoded SVG images to avoid remote URL loading:
- **Entry Point:** https://warplet-traders.vercel.app/base64-test.html
- **API Endpoint:** https://warplet-traders.vercel.app/api/base64

### Minimal Headers Approach
Uses only essential frame headers:
- **Entry Point:** https://warplet-traders.vercel.app/minimal-headers.html
- **API Endpoint:** https://warplet-traders.vercel.app/api/minimal-headers

### Basic PNG Image Approach
Uses direct hosted PNG images:
- **Entry Point:** https://warplet-traders.vercel.app/api-test.html
- **API Endpoint:** https://warplet-traders.vercel.app/api/ultra-minimal

## Static Frame Solution (Works but opens new pages)
These URLs use direct link-based navigation with no API dependencies:

- **Main Frame:** https://warplet-traders.vercel.app/static-frame.html
- **24h Data:** https://warplet-traders.vercel.app/static-24h.html
- **7d Data:** https://warplet-traders.vercel.app/static-7d.html

## Testing Priority

1. **Try first:** Edge Runtime Frame - https://warplet-traders.vercel.app/edge-frame-test.html
   - Uses Vercel Edge Runtime which has different characteristics than Node.js
   - Extremely simple request handling with minimal error surface
   - Base64 SVG images for reliable display

2. **Try second:** Debug Frame - https://warplet-traders.vercel.app/debug-frame.html
   - This will help us understand the request format that Warpcast is sending
   - Logs detailed information about the request to help diagnose issues

3. **If still having issues:** Keep trying other approaches in order

## Development Testing
When testing locally, use:

- **Edge Runtime:** http://localhost:5000/edge-frame-test.html
- **Debug Frame:** http://localhost:5000/debug-frame.html
- **Simple Frame:** http://localhost:5000/simple-frame-test.html