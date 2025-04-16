/**
 * Debug handler for Warpcast frames
 * This logs all request details to help diagnose frame communication issues
 */

module.exports = function frameDebugHandler(req, res) {
  console.log('======================== FRAME DEBUG ========================');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log('Headers:');
  Object.entries(req.headers).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  
  console.log('Body:');
  try {
    console.log(JSON.stringify(req.body, null, 2));
    
    // Extract specific frame data if available
    if (req.body && req.body.untrustedData) {
      console.log('Frame Data:');
      console.log(`  Button Index: ${req.body.untrustedData.buttonIndex}`);
      if (req.body.untrustedData.fid) {
        console.log(`  FID: ${req.body.untrustedData.fid}`);
      }
    }
  } catch (error) {
    console.log('Error parsing body:', error.message);
  }
  console.log('============================================================');
  
  // Set CORS headers - critical for frame communication
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Generate a debug response
  const debugResponse = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSI0MDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjMwIiBmaWxsPSIjNEFERTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EZWJ1ZyBSZXF1ZXN0IFJlY2VpdmVkITwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjE5MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QnV0dG9uICR7cmVxLmJvZHk/LnVudHJ1c3RlZERhdGE/LmJ1dHRvbkluZGV4IHx8ICdOb25lJ30gd2FzIGNsaWNrZWQ8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIyNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZJRDogJHtyZXEuYm9keT8udW50cnVzdGVkRGF0YT8uZmlkIHx8ICdOb3QgcHJvdmlkZWQnfTwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjI5MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTRBM0I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DaGVjayBzZXJ2ZXIgbG9ncyBmb3IgbW9yZSBkZXRhaWxzPC90ZXh0PjwvdkllXT4=">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Debug Again">
  <meta property="fc:frame:button:4" content="Return to Main">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/frame-debug">
  <title>Frame Debug Tool</title>
</head>
<body>
  <h1>Debug Request Received</h1>
  <p>Check server logs for detailed request information</p>
</body>
</html>
  `;
  
  return res.status(200).send(debugResponse);
};