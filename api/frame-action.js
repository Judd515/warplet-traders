/**
 * Frame Action Handler for Warpcast
 * Handles button clicks and generates dynamic responses
 */

// Required headers for Warpcast frame responses
const headers = {
  'Content-Type': 'text/html',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Access-Control-Allow-Origin': '*'
};

export default function handler(req, res) {
  // Check if this is a POST request from a frame button
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the button index from the request body
    const buttonIndex = req.body?.untrustedData?.buttonIndex;
    
    // Default to 24h view
    let timeframe = '24h';
    let showComposer = false;
    
    // Process based on button clicked
    if (buttonIndex === 1) {
      // 24h Data button
      timeframe = '24h';
    } else if (buttonIndex === 2) {
      // 7d Data button
      timeframe = '7d';
    } else if (buttonIndex === 3) {
      // Share button - redirect to Warpcast composer
      showComposer = true;
      
      // Compose message with current data
      const composerText = encodeURIComponent(
        `Top Warplet Traders 📊\n\n` +
        `1. @thcradio (BTC): +76%\n` +
        `2. @hellno.eth (DEGEN): +49%\n` +
        `3. @wakaflocka (USDC): -39%\n` +
        `4. @karima (ARB): -55%\n` +
        `5. @chrislarsc.eth (ETH): -63%\n\n` +
        `https://warplet-traders.vercel.app/integrated-frame.html`
      );
      
      // Redirect to Warpcast composer
      return res.redirect(302, `https://warpcast.com/~/compose?text=${composerText}`);
    }
    
    // Generate SVG based on timeframe
    const frameSvg = generateSvgForTimeframe(timeframe);
    
    // Build frame response - using a different image URL for each timeframe
    const imageUrl = timeframe === '7d' ? 
      'https://i.imgur.com/bVG9xbJ.png' : 
      'https://i.imgur.com/0yrdcff.png';
      
    const htmlResponse = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:1:action" content="post">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:2:action" content="post">
  <meta property="fc:frame:button:3" content="Share Results">
  <meta property="fc:frame:button:3:action" content="post_redirect">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/frame-action">
</head>
<body>
  <h1>Frame Response (${timeframe})</h1>
</body>
</html>`;

    // Return the HTML response
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(htmlResponse);
    
  } catch (error) {
    console.error('Error processing frame action:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Generate SVG content based on timeframe
function generateSvgForTimeframe(timeframe) {
  if (timeframe === '7d') {
    // 7d data view
    return `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSIxNTAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IndoaXRlIj5UT1AgV0FSUExFVCBUUkFERVJTPC90ZXh0Pjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5NEEzQjgiPldhbGxldDwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTRBM0I4Ij5Ub3AgVG9rZW48L3RleHQ+PHRleHQgeD0iNjUwIiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0QTNCOCIgdGV4dC1hbmNob3I9ImVuZCI+N2QgUG5MPC90ZXh0Pjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5AdGhjcmFkaW88L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkJUQzwvdGV4dD48dGV4dCB4PSI2NTAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNEFERTgwIiB0ZXh0LWFuY2hvcj0iZW5kIj4rMTI0JTwvdGV4dD48dGV4dCB4PSIxNTAiIHk9IjI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+QHdha2FmbG9ja2E8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIyNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPlVTREM8L3RleHQ+PHRleHQgeD0iNjUwIiB5PSIyNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzRBREU4MCIgdGV4dC1hbmNob3I9ImVuZCI+KzgyJTwvdGV4dD48dGV4dCB4PSIxNTAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+QGNocmlzbGFyc2MuZXRoPC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5FVEg8L3RleHQ+PHRleHQgeD0iNjUwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzRBREU4MCIgdGV4dC1hbmNob3I9ImVuZCI+KzQ3JTwvdGV4dD48dGV4dCB4PSIxNTAiIHk9IjMyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+QGhlbGxuby5ldGg8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIzMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkRFR0VOPC90ZXh0Pjx0ZXh0IHg9IjY1MCIgeT0iMzIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNFRjQ0NDQiIHRleHQtYW5jaG9yPSJlbmQiPi0xMiU8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkBrYXJpbWE8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkFSQjwvdGV4dD48dGV4dCB4PSI2NTAiIHk9IjM2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjRUY0NDQ0IiB0ZXh0LWFuY2hvcj0iZW5kIj4tODMlPC90ZXh0Pjwvc3ZnPg==`;
  } else {
    // Default 24h data view
    return `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSIxNTAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IndoaXRlIj5UT1AgV0FSUExFVCBUUkFERVJTPC90ZXh0Pjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5NEEzQjgiPldhbGxldDwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTRBM0I4Ij5Ub3AgVG9rZW48L3RleHQ+PHRleHQgeD0iNjUwIiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0QTNCOCIgdGV4dC1hbmNob3I9ImVuZCI+MjRoIFBuTDwvdGV4dD48dGV4dCB4PSIxNTAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+QHRoY3JhZGlvPC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5CVEM8L3RleHQ+PHRleHQgeD0iNjUwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzRBREU4MCIgdGV4dC1hbmNob3I9ImVuZCI+Kzc2JTwvdGV4dD48dGV4dCB4PSIxNTAiIHk9IjI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+QGhlbGxuby5ldGg8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIyNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkRFR0VOPC90ZXh0Pjx0ZXh0IHg9IjY1MCIgeT0iMjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM0QURFODAiIHRleHQtYW5jaG9yPSJlbmQiPis0OSU8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkB3YWthZmxvY2thPC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5VU0RDPC90ZXh0Pjx0ZXh0IHg9IjY1MCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNFRjQ0NDQiIHRleHQtYW5jaG9yPSJlbmQiPi0zOSU8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIzMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkBrYXJpbWE8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIzMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkFSQjwvdGV4dD48dGV4dCB4PSI2NTAiIHk9IjMyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjRUY0NDQ0IiB0ZXh0LWFuY2hvcj0iZW5kIj4tNTUlPC90ZXh0Pjx0ZXh0IHg9IjE1MCIgeT0iMzYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5AY2hyaXNsYXJzYy5ldGg8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkVUSDwvdGV4dD48dGV4dCB4PSI2NTAiIHk9IjM2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjRUY0NDQ0IiB0ZXh0LWFuY2hvcj0iZW5kIj4tNjMlPC90ZXh0Pjwvc3ZnPg==`;
  }
}