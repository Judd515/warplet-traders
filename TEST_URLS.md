# Warplet Traders Test URLs

## Static Frame Solution
These URLs use direct link-based navigation with no API dependencies:

- **Main Frame:** https://warplet-traders.vercel.app/static-frame.html
- **24h Data:** https://warplet-traders.vercel.app/static-24h.html
- **7d Data:** https://warplet-traders.vercel.app/static-7d.html
- **About Page:** https://warplet-traders.vercel.app/about.html

## API-Based Solutions
These solutions attempt to use API endpoints to handle frame interactions:

### Ultra-Minimal API
This approach uses a zero-dependency API with pre-rendered HTML:
- **Entry Point:** https://warplet-traders.vercel.app/ultra-minimal.html
- **API Endpoint:** https://warplet-traders.vercel.app/api/ultra-minimal

### Other API Approaches
These may still return 500 errors but are available for testing:

- **Standard API:** https://warplet-traders.vercel.app/api
- **Direct HTML:** https://warplet-traders.vercel.app/api/direct-html
- **Edge Function:** https://warplet-traders.vercel.app/api/edge
- **Pages API:** https://warplet-traders.vercel.app/pages/api

## Development Testing
When testing locally, use:

- **Local Static Frame:** http://localhost:5000/static-frame.html
- **Local Ultra-Minimal:** http://localhost:5000/ultra-minimal.html

## Troubleshooting Notes

1. If images fail to load in Warpcast:
   - We're now using direct Imgur links which should resolve this issue

2. If API endpoints return 500 errors:
   - Try the static frame solution which avoids API calls
   - Try the ultra-minimal API which has minimal dependencies

3. If buttons navigate to new pages instead of updating in-frame:
   - This is expected with the static solution
   - The API-based solutions should update in-frame if they work properly