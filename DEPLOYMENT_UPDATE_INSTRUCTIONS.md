# Deployment Update Instructions

## Issue Analysis
The buttons in the Warpcast frame are currently not working because of a mismatch between the endpoint URLs in the frame HTML and the actual API endpoints on the Vercel deployment.

## Update Process

### Option 1: Update the Current Deployment
1. Push the following changes to your GitHub repository:
   - Update references in `api/warpcast-stable.js` to point to `/api/warpcast-stable` as the post_url
   - Ensure the handler in `api/warpcast-stable.js` properly processes button clicks

2. Deploy from GitHub to Vercel:
   - Connect your GitHub repository to Vercel if not already connected
   - Trigger a new deployment from the Vercel dashboard

### Option 2: Create a Self-Contained Version (Preferred)
1. Create a new file in `api/self-contained-frame.js` with both the frame HTML and button processing logic
2. Ensure the frame HTML points to itself (e.g., `post_url` = `/api/self-contained-frame`)
3. Deploy this new file to Vercel
4. Update your Warpcast cast link to point to this new endpoint

## Quick Fix Testing
To verify if a solution works before deployment:

1. Make a local update to `server/api/warpcast-stable.js` to include this HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8IS0tIEJhY2tncm91bmQgLS0+CiAgICA8cmVjdCB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIGZpbGw9IiMxMjEyMTgiLz4KICAgIAogICAgPCEtLSBQcm9maWxlIGNpcmNsZSAodmlzaWJsZSBvbiBhbGwgZnJhbWVzKSBwb3NpdGlvbmVkIGRpZmZlcmVudGx5IHRvIGZpdCAtIDIyJSBsYXJnZXIgLS0+CiAgICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNzYiIGZpbGw9IiM1MDllYzciLz4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iODUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjIwIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+V0FSUDwvdGV4dD4KICAgIAogICAgPCEtLSBUaXRsZSBiYXIgd2l0aCBiYWNrZ3JvdW5kIC0gbW92ZWQgcmlnaHQgdG8gbWFrZSByb29tIGZvciBwcm9maWxlIHBpYyAtLT4KICAgIDxyZWN0IHg9IjE4MCIgeT0iNjAiIHdpZHRoPSI5NTAiIGhlaWdodD0iMTAwIiByeD0iMTYiIGZpbGw9IiMyYTMzNGEiLz4KICAgIDx0ZXh0IHg9IjY1MCIgeT0iMTI1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSI0OCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNlNGYxZmYiPldhcnBsZXQgVG9wIFRyYWRlcnM8L3RleHQ+CiAgICAKICAgIDwhLS0gTWFpbiBjb250ZW50IGFyZWEgLSBzaGlmdGVkIGRvd24gNXB4IC0tPgogICAgPHJlY3QgeD0iMTAwIiB5PSIyMDUiIHdpZHRoPSIxMDAwIiBoZWlnaHQ9IjM0MCIgcng9IjE2IiBmaWxsPSIjMWExYTI0IiBzdHJva2U9IiM0NDQ0NTUiIHN0cm9rZS13aWR0aD0iMyIvPgogICAgPHRleHQgeD0iNjAwIiB5PSIzMjUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIj5WaWV3IHRoZSB0b3AgdHJhZGluZyBwZXJmb3JtYW5jZTwvdGV4dD4KICAgIDx0ZXh0IHg9IjYwMCIgeT0iMzY1IiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+b24gRmFyY2FzdGVyIHVzaW5nIHJlYWwtdGltZSBkYXRhPC90ZXh0PgogICAgPHRleHQgeD0iNjAwIiB5PSI0MDUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjN2U4Mjk2Ij5DbGljayBhIGJ1dHRvbiBiZWxvdyB0byBnZXQgc3RhcnRlZDwvdGV4dD4KICAgIAogICAgPCEtLSBGb290ZXIgd2l0aCAyNHB4IGZvbnQgLS0+CiAgICA8dGV4dCB4PSI2MDAiIHk9IjU4MCIgZm9udC1mYW1pbHk9IlZlcmRhbmEiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM3ZTgyOTYiPkZyYW1lIGNyZWF0ZWQgYnkgMHhqdWRkPC90ZXh0PgogIDwvc3ZnPg==">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/ultra-minimal">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%2412%2C580%20%2F%20%24144.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%2410%2C940%20%2F%20%24128.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%249%2C450%20%2F%20%24112.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%247%2C840%20%2F%20%2494.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%246%2C250%20%2F%20%2482.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body></body>
</html>
```

2. Test locally to verify this works with the ultra-minimal endpoint

## Solution Recommended
For immediate results, we recommend updating your Vercel deployment to use `api/ultra-minimal.js` which has a simpler, more reliable implementation. This file already exists in the repo and should work without modifications.

1. Update frames to point to `/api/ultra-minimal`
2. Deploy to Vercel
3. Share the updated frame URL

This provides a stable solution while we can work on a more robust implementation for future updates.