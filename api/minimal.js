/**
 * Ultra-simple Warpcast Frame handler
 * Uses the absolute minimum code required for a working frame
 */

module.exports = (req, res) => {
  try {
    console.log('Minimal frame handler called');
    
    // Show what was received in the request for debugging
    if (req.body) {
      console.log('Request body received:', JSON.stringify(req.body, null, 2));
    }
    
    // Create a response with a single button 
    const html = `
<!DOCTYPE html>
<html>
<head>
<meta property="fc:frame" content="vNext">
<meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSI0MDAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5UT1AgV0FSUExFVCBUUkFERVJTPC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ZT1UgQ0xJQ0tFRCBUSEUgQlVUVE9OITwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNEFERTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4yNGggRGF0YSBWaWV3PC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMzIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5NEEzQjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJ1dHRvbiBjbGljayBzdWNjZXNzZnVsITwvdGV4dD48L3N2Zz4=">
<meta property="fc:frame:button:1" content="Try Again">
<meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/minimal">
</head>
<body>Frame Response</body>
</html>`;
    
    // Send the response
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Error in minimal handler:', error);
    
    // Return error frame with simple HTML structure
    const errorHtml = `
<!DOCTYPE html>
<html>
<head>
<meta property="fc:frame" content="vNext">
<meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSI0MDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjM2IiBmaWxsPSIjRUY0NDQ0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5FUlJPUjwvdGV4dD48L3N2Zz4=">
<meta property="fc:frame:button:1" content="Try Again">
<meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/minimal">
</head>
<body>Error Frame</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(errorHtml);
  }
};