/**
 * Simple Frame Handler for Warpcast
 * This is a simplified version without complex logic to ensure basic reliability
 */

export default function simpleFrameHandler(req, res) {
  try {
    console.log('Simple frame request received:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body || {}
    });
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Content-Type', 'text/html');
    
    // Handle preflight request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Extract button index from request
    let buttonIndex = 1;
    if (req.body?.untrustedData?.buttonIndex) {
      buttonIndex = parseInt(req.body.untrustedData.buttonIndex, 10);
    }
    
    console.log(`Button index: ${buttonIndex}`);
    
    // Switch based on button index
    let frameHtml;
    switch (buttonIndex) {
      case 1:
        frameHtml = generate24hFrame();
        break;
      case 2:
        frameHtml = generate7dFrame();
        break;
      case 3:
        // Share button - redirect to composer
        const shareText = encodeURIComponent(
          `Top Warplet Earners (7d)\n\n1. @thcradio (BTC): $3,580 / $42.5K volume\n2. @wakaflocka (USDC): $2,940 / $38.7K volume\n3. @chrislarsc.eth (ETH): $2,450 / $31.2K volume\n4. @hellno.eth (DEGEN): $1,840 / $24.6K volume\n5. @karima (ARB): $1,250 / $18.9K volume\n\nhttps://warplet-traders.vercel.app`
        );
        return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
      case 4:
        frameHtml = generateCheckMeFrame();
        break;
      default:
        frameHtml = generate7dFrame();
    }
    
    return res.status(200).send(frameHtml);
  } catch (error) {
    console.error('Error in simple frame handler:', error);
    return res.status(200).send(generateErrorFrame());
  }
};

// Generate 24h data frame
function generate24hFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSI0MDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VG9wIFdhcnBsZXQgRWFybmVycyAoTGFzdCAyNCBob3VycykhPC90ZXh0PjxsaW5lIHgxPSIxMDAiIHkxPSIxNDAiIHgyPSI3MDAiIHkyPSIxNDAiIHN0cm9rZT0iIzNiODJmNiIgc3Ryb2tlLXdpZHRoPSIzIi8+PHRleHQgeD0iMTIwIiB5PSIxODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNSIgZmlsbD0id2hpdGUiPjEuIEB0aGNyYWRpbzwvdGV4dD48dGV4dCB4PSI1MDAiIHk9IjE4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI1IiBmaWxsPSIjNEFERTgwIj4kMSwzNjA8L3RleHQ+PHRleHQgeD0iNjAwIiB5PSIxODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk0QTNCOCI+QlRDPC90ZXh0Pjx0ZXh0IHg9IjEyMCIgeT0iMjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjUiIGZpbGw9IndoaXRlIj4yLiBAd2FrYWZsb2NrYTwvdGV4dD48dGV4dCB4PSI1MDAiIHk9IjIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI1IiBmaWxsPSIjNEFERTgwIj4kOTgwPC90ZXh0Pjx0ZXh0IHg9IjYwMCIgeT0iMjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5NEEzQjgiPlVTREM8L3RleHQ+PHRleHQgeD0iMTIwIiB5PSIyNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNSIgZmlsbD0id2hpdGUiPjMuIEBjaHJpc2xhcnNjLmV0aDwvdGV4dD48dGV4dCB4PSI1MDAiIHk9IjI2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI1IiBmaWxsPSIjNEFERTgwIj4kODUwPC90ZXh0Pjx0ZXh0IHg9IjYwMCIgeT0iMjYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5NEEzQjgiPkVUSDwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjMwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI1IiBmaWxsPSJ3aGl0ZSI+NC4gQGhlbGxuby5ldGg8L3RleHQ+PHRleHQgeD0iNTAwIiB5PSIzMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNSIgZmlsbD0iIzRBREU4MCI+JDYzMDwvdGV4dD48dGV4dCB4PSI2MDAiIHk9IjMwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTRBM0I4Ij5ERUdFTjwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjM0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI1IiBmaWxsPSJ3aGl0ZSI+NS4gQGthcmltYTwvdGV4dD48dGV4dCB4PSI1MDAiIHk9IjM0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI1IiBmaWxsPSIjNEFERTgwIj4kNDIwPC90ZXh0Pjx0ZXh0IHg9IjYwMCIgeT0iMzQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5NEEzQjgiPkFSQjwvdGV4dD48L3N2Zz4=">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="/api/simple-frame">
  <title>24h Top Warplet Traders</title>
</head>
<body>
  <h1>Top Warplet Earners (24h)</h1>
</body>
</html>
  `;
}

// Generate 7d data frame
function generate7dFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSI0MDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VG9wIFdhcnBsZXQgRWFybmVycyAoTGFzdCA3IGRheXMpITwvdGV4dD48bGluZSB4MT0iMTAwIiB5MT0iMTQwIiB4Mj0iNzAwIiB5Mj0iMTQwIiBzdHJva2U9IiMzYjgyZjYiIHN0cm9rZS13aWR0aD0iMyIvPjx0ZXh0IHg9IjEyMCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjUiIGZpbGw9IndoaXRlIj4xLiBAcGFub3B0aWNvbXMuZXRoPC90ZXh0Pjx0ZXh0IHg9IjUwMCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjUiIGZpbGw9IiM0QURFODAiPiQzLDU4MDwvdGV4dD48dGV4dCB4PSI2MDAiIHk9IjE4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTRBM0I4Ij5FVEM8L3RleHQ+PHRleHQgeD0iMTIwIiB5PSIyMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNSIgZmlsbD0id2hpdGUiPjIuIEB0aGNyYWRpbzwvdGV4dD48dGV4dCB4PSI1MDAiIHk9IjIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI1IiBmaWxsPSIjNEFERTgwIj4kMiw5NDA8L3RleHQ+PHRleHQgeD0iNjAwIiB5PSIyMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk0QTNCOCI+QlRDPC90ZXh0Pjx0ZXh0IHg9IjEyMCIgeT0iMjYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjUiIGZpbGw9IndoaXRlIj4zLiBAY2hyaXNsYXJzYy5ldGg8L3RleHQ+PHRleHQgeD0iNTAwIiB5PSIyNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNSIgZmlsbD0iIzRBREU4MCI+JDIsNDUwPC90ZXh0Pjx0ZXh0IHg9IjYwMCIgeT0iMjYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5NEEzQjgiPkVUSDwvdGV4dD48dGV4dCB4PSIxMjAiIHk9IjMwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI1IiBmaWxsPSJ3aGl0ZSI+NC4gQGhlbGxuby5ldGg8L3RleHQ+PHRleHQgeD0iNTAwIiB5PSIzMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNSIgZmlsbD0iIzRBREU4MCI+JDEsODQwPC90ZXh0Pjx0ZXh0IHg9IjYwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5NEEzQjgiPkRFR0VOPC90ZXh0Pjx0ZXh0IHg9IjEyMCIgeT0iMzQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjUiIGZpbGw9IndoaXRlIj41LiBAa2FyaW1hPC90ZXh0Pjx0ZXh0IHg9IjUwMCIgeT0iMzQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjUiIGZpbGw9IiM0QURFODAiPiQxLDI1MDwvdGV4dD48dGV4dCB4PSI2MDAiIHk9IjM0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTRBM0I4Ij5BUkI8L3RleHQ+PC9zdmc+">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="/api/simple-frame">
  <title>7d Top Warplet Traders</title>
</head>
<body>
  <h1>Top Warplet Earners (7d)</h1>
</body>
</html>
  `;
}

// Generate Check Me frame
function generateCheckMeFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSI0MDAiIHk9IjE2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2hlY2sgTXkgRm9sbG93czwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTRBM0I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BbmFseXppbmcgdGhlIHRvcCB0cmFkZXJzIGFtb25nIHlvdXIgZm9sbG93czwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTRBM0I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5UaGlzIG1heSB0YWtlIGEgbW9tZW50Li4uPC90ZXh0PjwvdkllXT4=">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="/api/simple-frame">
  <title>Check My Follows</title>
</head>
<body>
  <h1>Checking Your Follows</h1>
</body>
</html>
  `;
}

// Generate User Loading frame (when we have a FID)
function generateUserLoadingFrame(fid) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSI0MDAiIHk9IjE2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TG9hZGluZyBZb3VyIERhdGEuLi48L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIyMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0QTNCOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QW5hbHl6aW5nIHRoZSB0b3AgdHJhZGVycyBhbW9uZyB5b3VyIGZvbGxvd3M8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0QTNCOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RklEOiAke2ZpZH08L3RleHQ+PC9zdmc+">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="View Standard Data">
  <meta property="fc:frame:post_url" content="/api/simple-frame">
  <title>Loading Your Data</title>
</head>
<body>
  <h1>Loading Data for FID: ${fid}</h1>
</body>
</html>
  `;
}

// Generate Error frame
function generateErrorFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSI0MDAiIHk9IjE2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQwIiBmaWxsPSIjRUY0NDQ0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5FcnJvciBPY2N1cnJlZDwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTRBM0I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Tb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdC48L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0QTNCOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UGxlYXNlIHRyeSBhZ2Fpbi48L3RleHQ+PC9zdmc+">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="Try Again">
  <meta property="fc:frame:post_url" content="/api/simple-frame">
  <title>Error</title>
</head>
<body>
  <h1>An error occurred</h1>
</body>
</html>
  `;
}