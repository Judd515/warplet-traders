# Deployment Instructions for Warplet Traders

## For Local Development

In local development, all URLs in the frame will be relative:

```html
<meta property="fc:frame:post_url" content="/api/simple-frame">
```

This works fine for local testing with `localhost:5000`.

## For Vercel Deployment

When deploying to Vercel, the frames need absolute URLs. The application is set up to handle this automatically:

1. The server detects when it's running in production mode and switches to absolute URLs
2. The main entry point `public/clean-frame.html` has been configured to work in both environments
3. A production-ready version `public/prod-frame.html` is also available with absolute URLs

### Important Deployment Notes

- Use `public/clean-frame.html` as the main entry point
- Make sure environment variables are set up properly in Vercel
- The `all-routes.js` file in `/deploy/api` includes all necessary routes for the Vercel deployment
- The application will automatically use absolute URLs in production

## Debugging URL Issues in Frames

If your frame isn't working in production:

1. Verify that the frame's post_url is an absolute URL in production
2. Check that the API endpoints are accessible from Warpcast
3. Use the debug endpoints to verify request/response flow

## Frame HTML Testing

You can test both versions of the frame HTML:

- Local development: `http://localhost:5000/clean-frame.html`
- Production-style frame: `http://localhost:5000/prod-frame.html`

The production version uses absolute URLs even in local development, which can help identify issues early.