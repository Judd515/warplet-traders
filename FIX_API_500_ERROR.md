# Fixing the 500 Server Error in Vercel API Functions

We've identified the root issue: The API function at `/api` is returning a 500 Internal Server Error. This is why the frames aren't working properly. Let's fix this systematically.

## Debugging and Fixing Steps

### 1. Simplified API Handler

The `api/index.js` file has been completely rewritten to be crash-proof:
- Removed all potential error-causing code
- Added try/catch blocks around everything
- Simplified to return a static response

This ultra-minimal version should not crash under any circumstances.

### 2. Testing with test-frame.html

A minimal test frame was created at `public/test-frame.html`:
- Only includes essential meta tags
- Uses a placeholder.co image that's guaranteed to work
- Has a single button for testing API communication

### 3. Vercel Function Debugging

After deploying these changes to Vercel:

1. Check if you can access `https://warplet-traders.vercel.app/api` directly in your browser
   - If it returns HTML instead of a 500 error, the basic function is working
   
2. Check Vercel Function logs:
   - Find the specific error that was causing the 500 response
   - Common issues include:
     - Missing environment variables (NEYNAR_API_KEY, etc.)
     - References to Node.js modules not included in the deployment
     - Memory limits exceeded

3. Test the frame at `https://warplet-traders.vercel.app/test-frame.html`
   - If the button works, the API communication is fixed

### 4. Missing Environment Variables

If the API is failing due to missing environment variables:

1. Log into your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add any required variables:
   - NEYNAR_API_KEY
   - DUNE_API_KEY
   - Any other required secrets

### 5. Vercel Function Size Limits

Vercel's Hobby plan has limits on function size:
- Make sure dependencies are properly bundled
- Avoid very large packages
- Split complex logic into smaller functions

## Next Steps

Once the minimal API is working:
1. Gradually add back features one at a time
2. Test after each addition to ensure it still works
3. Check Vercel logs if any issues reappear

The root issue was almost certainly in the API function, not in the frame HTML itself. By fixing the function, the frame buttons should start working correctly.