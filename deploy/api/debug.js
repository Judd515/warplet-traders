/**
 * Debug endpoint for Warpcast Frame testing
 * This helps diagnose issues with frame parameters
 */

module.exports = (req, res) => {
  console.log('DEBUG endpoint called');
  
  // Log request details
  console.log('Headers:', JSON.stringify(req.headers));
  console.log('Body:', JSON.stringify(req.body));
  console.log('Query:', JSON.stringify(req.query));
  console.log('Method:', req.method);
  
  // Set proper response headers
  res.setHeader('Content-Type', 'application/json');
  
  // Extract button index for debugging
  let buttonIndex = null;
  try {
    if (req.body && req.body.untrustedData && req.body.untrustedData.buttonIndex) {
      buttonIndex = parseInt(req.body.untrustedData.buttonIndex, 10);
    } else if (req.body && req.body.buttonIndex) {
      buttonIndex = parseInt(req.body.buttonIndex, 10);
    } else if (req.query && req.query.buttonIndex) {
      buttonIndex = parseInt(req.query.buttonIndex, 10);
    }
  } catch (e) {
    console.error('Error parsing button data:', e);
  }
  
  // Create response with diagnostic info
  const response = {
    message: 'Warpcast Frame Debug Information',
    timestamp: new Date().toISOString(),
    requestDetails: {
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
      buttonIndex: buttonIndex,
    },
    frameMeta: {
      frameVersion: 'vNext',
      imageUrl: 'https://i.imgur.com/k9KaLKk.png',
      postUrl: 'https://warplet-traders.vercel.app/api',
    }
  };
  
  // Send the response
  return res.status(200).json(response);
};