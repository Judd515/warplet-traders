/**
 * Simple Frame Handler for Warpcast
 * This is a simplified version without complex logic to ensure basic reliability
 */

module.exports = (req, res) => {
  // Set content type
  res.setHeader('Content-Type', 'text/html');
  
  try {
    // Extract info from request
    const buttonIndex = req.body?.untrustedData?.buttonIndex || 1;
    const userFid = req.body?.untrustedData?.fid || 0;
    
    console.log(`Request received: Button ${buttonIndex}, FID ${userFid}`);
    
    // Choose the appropriate response based on the button pressed
    if (buttonIndex === 1) {
      // 24h data button
      return res.status(200).send(generate24hFrame());
    } else if (buttonIndex === 2) {
      // 7d data button
      return res.status(200).send(generate7dFrame());
    } else if (buttonIndex === 3) {
      // Share button - redirect to composer
      const shareText = encodeURIComponent(
        `Top Warplet Earners (7d)\n\n1. @thcradio (BTC): $3,580 / $42.5K volume\n2. @wakaflocka (USDC): $2,940 / $38.7K volume\n3. @chrislarsc.eth (ETH): $2,450 / $31.2K volume\n4. @hellno.eth (DEGEN): $1,840 / $24.6K volume\n5. @karima (ARB): $1,250 / $18.9K volume\n\nhttps://warplet-traders.vercel.app/clean-frame.html`
      );
      
      return res.redirect(302, `https://warpcast.com/~/compose?text=${shareText}`);
    } else if (buttonIndex === 4) {
      // Check my follows button
      if (userFid > 0) {
        return res.status(200).send(generateUserLoadingFrame(userFid));
      } else {
        return res.status(200).send(generateCheckMeFrame());
      }
    }
    
    // Default response
    return res.status(200).send(generate7dFrame());
  } catch (error) {
    console.error('Error in frame handler:', error);
    // Return a simple error frame
    return res.status(200).send(generateErrorFrame());
  }
};

// Generate 24h data frame
function generate24hFrame() {
  const imageUrl = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSIxNTAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IndoaXRlIj5UT1AgV0FSUExFVCBFQVJORVJTICgyNGgpPC90ZXh0Pjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5NEEzQjgiPldhbGxldDwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTRBM0I4Ij5Ub3AgVG9rZW48L3RleHQ+PHRleHQgeD0iNjUwIiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0QTNCOCIgdGV4dC1hbmNob3I9ImVuZCI+RWFybmluZ3M8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkB0aGNyYWRpbzwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+QlRDPC90ZXh0Pjx0ZXh0IHg9IjY1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM0QURFODAiIHRleHQtYW5jaG9yPSJlbmQiPiQzLDU4MDwvdGV4dD48dGV4dCB4PSIxNTAiIHk9IjI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+QHdha2FmbG9ja2E8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIyNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPlVTREM8L3RleHQ+PHRleHQgeD0iNjUwIiB5PSIyNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzRBREU4MCIgdGV4dC1hbmNob3I9ImVuZCI+JDIsOTQwPC90ZXh0Pjx0ZXh0IHg9IjE1MCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5AY2hyaXNsYXJzYy5ldGg8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkVUSDwvdGV4dD48dGV4dCB4PSI2NTAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNEFERTgwIiB0ZXh0LWFuY2hvcj0iZW5kIj4kMiw0NTA8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIzMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkBoZWxsbm8uZXRoPC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMzIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5ERUdFTjwvdGV4dD48dGV4dCB4PSI2NTAiIHk9IjMyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNEFERTgwIiB0ZXh0LWFuY2hvcj0iZW5kIj4kMSw4NDA8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkBrYXJpbWE8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkFSQjwvdGV4dD48dGV4dCB4PSI2NTAiIHk9IjM2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNEFERTgwIiB0ZXh0LWFuY2hvcj0iZW5kIj4kMSwyNTA8L3RleHQ+PC9zdmc+`;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/simple-frame">
</head>
<body>
  <h1>Top Warplet Earners (24h)</h1>
</body>
</html>`;
}

// Generate 7d data frame
function generate7dFrame() {
  const imageUrl = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSIxNTAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IndoaXRlIj5UT1AgV0FSUExFVCBFQVJORVJTICg3ZCk8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0QTNCOCI+V2FsbGV0PC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5NEEzQjgiPlRvcCBUb2tlbjwvdGV4dD48dGV4dCB4PSI2NTAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTRBM0I4IiB0ZXh0LWFuY2hvcj0iZW5kIj5FYXJuaW5nczwvdGV4dD48dGV4dCB4PSIxNTAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+QHRoY3JhZGlvPC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5CVEM8L3RleHQ+PHRleHQgeD0iNjUwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzRBREU4MCIgdGV4dC1hbmNob3I9ImVuZCI+JDcsODIwPC90ZXh0Pjx0ZXh0IHg9IjE1MCIgeT0iMjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5Ad2FrYWZsb2NrYTwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+VVNEQZC90ZXh0Pjx0ZXh0IHg9IjY1MCIgeT0iMjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM0QURFODAiIHRleHQtYW5jaG9yPSJlbmQiPiQ2LDU0MDwvdGV4dD48dGV4dCB4PSIxNTAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+QGNocmlzbGFyc2MuZXRoPC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5FVEg8L3RleHQ+PHRleHQgeD0iNjUwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzRBREU4MCIgdGV4dC1hbmNob3I9ImVuZCI+JDUsMTAwPC90ZXh0Pjx0ZXh0IHg9IjE1MCIgeT0iMzIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5AaGVsbG5vLmV0aDwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjMyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+REVHRUWvdGV4dD48dGV4dCB4PSI2NTAiIHk9IjMyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNEFERTgwIiB0ZXh0LWFuY2hvcj0iZW5kIj4kMyw4NTA8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkBrYXJpbWE8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkFSQjwvdGV4dD48dGV4dCB4PSI2NTAiIHk9IjM2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNEFERTgwIiB0ZXh0LWFuY2hvcj0iZW5kIj4kMiw2NTA8L3RleHQ+PC9zdmc+`;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/simple-frame">
</head>
<body>
  <h1>Top Warplet Earners (7d)</h1>
</body>
</html>`;
}

// Generate Check My Follows frame
function generateCheckMeFrame() {
  const imageUrl = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSI0MDAiIHk9IjE4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjM2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2hlY2sgdG9wIHRyYWRlcnMgYW1vbmcgeW91ciBmb2xsb3dzPC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5NEEzQjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNsaWNrIHRoZSBidXR0b24gaW4gV2FycGNhc3QgdG8gc2VlIHlvdXIgcGVyc29uYWxpemVkIHJlc3VsdHM8L3RleHQ+PC9zdmc+`;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/simple-frame">
</head>
<body>
  <h1>Check Your Follows</h1>
</body>
</html>`;
}

// Generate User Loading frame (when we have a FID)
function generateUserLoadingFrame(fid) {
  const imageUrl = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSI0MDAiIHk9IjE2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QW5hbHl6aW5nIHlvdXIgZm9sbG93czwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTRBM0I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GaW5kaW5nIHRvcCB0cmFkZXJzIGFtb25nIHlvdXIgZm9sbG93ZWQgYWNjb3VudHM8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0QTNCOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VXNlciAjJHtmaWR9PC90ZXh0PjwvdkllXT4=`;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="View Standard Data">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/simple-frame">
</head>
<body>
  <h1>Analyzing your follows (FID: ${fid})</h1>
  <p>We're finding top traders among the accounts you follow.</p>
</body>
</html>`;
}

// Generate Error frame
function generateErrorFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSI0MDAiIHk9IjE4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjM2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+T29wcyEgU29tZXRoaW5nIHdlbnQgd3Jvbmc8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIyNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0QTNCOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UGxlYXNlIHRyeSBhZ2FpbjwvdGV4dD48L3N2Zz4=">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="Try Again">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/simple-frame">
</head>
<body>
  <h1>Error</h1>
  <p>Something went wrong. Please try again.</p>
</body>
</html>`;
}