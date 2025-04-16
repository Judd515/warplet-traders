/**
 * Frame Action Handler for Warpcast
 * Handles button clicks and generates dynamic responses
 */

// Import required libraries
const axios = require('axios');

// Required headers for Warpcast frame responses
const headers = {
  'Content-Type': 'text/html',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Access-Control-Allow-Origin': '*'
};

module.exports = async function handler(req, res) {
  // Check if this is a POST request from a frame button
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Frame action request received:', {
      method: req.method,
      body: JSON.stringify(req.body).substring(0, 1000) // Log first 1000 chars of the request body
    });

    // Get the button index and user's FID from the request body
    const buttonIndex = req.body?.untrustedData?.buttonIndex;
    const userFid = req.body?.untrustedData?.fid;
    const action = req.query?.action; // Get action from query parameter
    
    console.log(`Processing frame action: Button ${buttonIndex}, UserFID: ${userFid}, Action: ${action}`);
    
    // Default to 7d view and no FID-specific data
    let timeframe = '7d';
    let showComposer = false;
    let useUserFid = false;
    
    // Process based on button clicked and action specified
    if (action === 'check_me' && userFid) {
      // User wants to check their own follows
      useUserFid = true;
      console.log(`Will check follows for FID ${userFid}`);
      
      // Generate loading state response while we fetch data
      const loadingHtml = generateLoadingFrameHtml(userFid);
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(loadingHtml);

      // Process user data asynchronously and return - this will finish in the background
      // This is needed because Warpcast requires a quick response for frames
      processUserData(userFid)
        .then(result => {
          console.log(`Processed user data for FID ${userFid}`);
        })
        .catch(error => {
          console.error(`Error processing user data for FID ${userFid}:`, error);
        });
      
      return;
    } else if (buttonIndex === 1) {
      // First button (24h Data)
      timeframe = '24h';
    } else if (buttonIndex === 2) {
      // Second button (7d Data)
      timeframe = '7d';
    } else if (buttonIndex === 3 || buttonIndex === 2 && !action) {
      // Share button - redirect to Warpcast composer
      showComposer = true;
      
      // Compose message with current data - these are sample values
      // In a real implementation, this would pull dynamic data
      const composerText = encodeURIComponent(
        `Top Warplet Earners (7d)

1. @thcradio (BTC): $3,580 / $42.5K volume
2. @wakaflocka (USDC): $2,940 / $38.7K volume
3. @chrislarsc.eth (ETH): $2,450 / $31.2K volume
4. @hellno.eth (DEGEN): $1,840 / $24.6K volume
5. @karima (ARB): $1,250 / $18.9K volume

https://warplet-traders.vercel.app/clean-frame.html`
      );
      
      // Redirect to Warpcast composer
      return res.redirect(302, `https://warpcast.com/~/compose?text=${composerText}`);
    }
    
    // The default case - return the standard frame with fixed data for demo purposes
    const frameSvg = generateSvgForTimeframe(timeframe);
    const imageBase64 = encodeURIComponent(frameSvg);
    
    // Generate standard HTML response
    const htmlResponse = generateStandardFrameHtml(timeframe);
    
    // Return the HTML response
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(htmlResponse);
    
  } catch (error) {
    console.error('Error processing frame action:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Import the frame service to handle data processing
const frameService = require('./frame-service');

// Process user data asynchronously (this happens after response is sent)
async function processUserData(fid) {
  console.log(`Processing data for FID ${fid} in the background...`);
  
  try {
    // Use the frame service to process the user's data
    const userData = await frameService.processUserData(fid);
    
    if (userData.success) {
      console.log(`Successfully processed data for FID ${fid}`);
      console.log(`Found ${userData.topTraders.length} top traders among ${userData.totalFollowing} followed accounts`);
      
      // Generate a frame response for this user to be returned on the next frame interaction
      const userFrameHtml = frameService.generateUserFrameHtml(userData);
      
      // Here you could store this result in a database or cache to be returned
      // when the user interacts with the loading frame again
      
      return userData;
    } else {
      console.error(`Failed to process data for FID ${fid}: ${userData.error}`);
      return { success: false, error: userData.error, fid };
    }
  } catch (error) {
    console.error(`Error processing data for FID ${fid}:`, error);
    return { success: false, error: error.message, fid };
  }
}

// Generate loading frame HTML
function generateLoadingFrameHtml(fid) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSI0MDAiIHk9IjE4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjM2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TG9hZGluZyB5b3VyIGRhdGEuLi48L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIyNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0QTNCOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QW5hbHl6aW5nIHRvcCB0cmFkZXJzIGFtb25nIHlvdXIgZm9sbG93czwvdGV4dD48L3N2Zz4=">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="Check Standard Data">
  <meta property="fc:frame:button:1:action" content="post">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/frame-action">
</head>
<body>
  <h1>Analyzing data for FID ${fid}</h1>
</body>
</html>`;
}

// Generate standard frame HTML
function generateStandardFrameHtml(timeframe) {
  const imageUrl = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgODAwIDQwMCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMxRTI0M0IiLz48dGV4dCB4PSIxNTAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IndoaXRlIj5UT1AgV0FSUExFVCBFQVJORVJTPC90ZXh0Pjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5NEEzQjgiPldhbGxldDwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTRBM0I4Ij5Ub3AgVG9rZW48L3RleHQ+PHRleHQgeD0iNjUwIiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0QTNCOCIgdGV4dC1hbmNob3I9ImVuZCI+N2QgRWFybmluZ3M8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkB0aGNyYWRpbzwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+QlRDPC90ZXh0Pjx0ZXh0IHg9IjY1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM0QURFODAiIHRleHQtYW5jaG9yPSJlbmQiPiQzLDU4MDwvdGV4dD48dGV4dCB4PSIxNTAiIHk9IjI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+QHdha2FmbG9ja2E8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIyNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPlVTREM8L3RleHQ+PHRleHQgeD0iNjUwIiB5PSIyNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzRBREU4MCIgdGV4dC1hbmNob3I9ImVuZCI+JDIsOTQwPC90ZXh0Pjx0ZXh0IHg9IjE1MCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5AY2hyaXNsYXJzYy5ldGg8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkVUSDwvdGV4dD48dGV4dCB4PSI2NTAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNEFERTgwIiB0ZXh0LWFuY2hvcj0iZW5kIj4kMiw0NTA8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIzMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkBoZWxsbm8uZXRoPC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMzIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5ERUdFTjwvdGV4dD48dGV4dCB4PSI2NTAiIHk9IjMyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNEFERTgwIiB0ZXh0LWFuY2hvcj0iZW5kIj4kMSw4NDA8L3RleHQ+PHRleHQgeD0iMTUwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkBrYXJpbWE8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiPkFSQjwvdGV4dD48dGV4dCB4PSI2NTAiIHk9IjM2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNEFERTgwIiB0ZXh0LWFuY2hvcj0iZW5kIj4kMSwyNTA8L3RleHQ+PC9zdmc+`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:1:action" content="post">
  <meta property="fc:frame:button:2" content="Share Results">
  <meta property="fc:frame:button:2:action" content="post_redirect">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/frame-action">
</head>
<body>
  <h1>Top Warplet Earners (${timeframe})</h1>
</body>
</html>`;
}

// Generate SVG content based on timeframe (not currently used)
function generateSvgForTimeframe(timeframe) {
  if (timeframe === '7d') {
    // 7d data view
    return 'data:image/svg+xml;base64,...'; // This would be your 7d SVG
  } else {
    // Default 24h data view
    return 'data:image/svg+xml;base64,...'; // This would be your 24h SVG
  }
}