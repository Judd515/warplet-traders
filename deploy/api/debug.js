/**
 * Debug endpoint for Warpcast Frame testing
 * This helps diagnose issues with frame parameters
 */

module.exports = (req, res) => {
  // Set CORS headers to allow requests from anywhere
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // If this is an OPTIONS request (preflight), return OK
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Create a debug object with everything we receive
    const debugInfo = {
      method: req.method,
      url: req.url,
      queryParams: req.query || {},
      headers: req.headers || {},
      body: req.body || {},
      path: req.path || req.url.split('?')[0],
      timestamp: new Date().toISOString()
    };
    
    console.log('Debug request received:', JSON.stringify(debugInfo, null, 2));
    
    // Return success with the debug information
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta property="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSI0MDAiIHk9IjE2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjMyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RGVidWcgSW5mb3JtYXRpb24gUmVjZWl2ZWQ8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIyMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0QTNCOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TWV0aG9kOiAke3JlcS5tZXRob2R9PC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5NEEzQjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJ1dHRvbjogJHtyZXEuYm9keT8udW50cnVzdGVkRGF0YT8uYnV0dG9uSW5kZXggfHwgJ05vbmUnfTwvdGV4dD48L3N2Zz4=">
        <meta property="fc:frame:button:1" content="Test Again">
        <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/debug">
      </head>
      <body>
        <h1>Debug Information</h1>
        <pre>${JSON.stringify(debugInfo, null, 2)}</pre>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return res.status(500).send('Error in debug endpoint');
  }
};