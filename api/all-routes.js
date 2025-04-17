/**
 * Combined API handler for all routes
 * This is a workaround for the Vercel Hobby plan's 12 serverless function limit
 */

// Export the handler function for Vercel
export default function handler(req, res) {
  // Parse the request path to determine which handler to use
  const path = req.url.split('?')[0];
  
  if (path.includes('/api/health')) {
    return handleHealth(req, res);
  } else if (path.includes('/api/direct-html')) {
    return handleDirectHtml(req, res);
  } else if (path.includes('/api/edge')) {
    // Edge functions need to be deployed separately
    return res.status(200).send('This should be handled by an edge function');
  } else if (path.includes('/api/minimal')) {
    return handleMinimal(req, res);
  } else if (path.includes('/api/frame')) {
    return handleFrame(req, res);
  } else {
    // Default to the frame handler for the base API route
    return handleFrame(req, res);
  }
};

/**
 * Health check handler
 */
function handleHealth(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  return res.status(200).send('Health check OK');
}

/**
 * Frame action handler
 */
function handleFrame(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html');
    
    // Determine what to show based on the button clicked
    const buttonIndex = req.body?.untrustedData?.buttonIndex || 0;
    
    // Change the image based on which button was clicked
    let imageText = "Main+Frame";
    let mainText = "Warplet Top Traders";
    
    if (buttonIndex === 1) {
      imageText = "24h+Data+View";
      mainText = "24-Hour Top Traders";
    } else if (buttonIndex === 2) {
      imageText = "7d+Data+View";
      mainText = "7-Day Top Traders";
    } else if (buttonIndex === 3) {
      imageText = "Share+View";
      mainText = "Share Results";
    }
    
    // Generate a frame HTML response
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://placehold.co/1200x630/1e293b/FFFFFF?text=${imageText}">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share">
  <meta property="fc:frame:button:4" content="Check My Follows">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api">
</head>
<body>
  <h1>${mainText}</h1>
  <p>Viewing data from the All Routes handler</p>
</body>
</html>
    `;
    
    // Return the HTML frame
    return res.status(200).send(html);
  } catch (error) {
    // Fallback HTML response
    const fallbackHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://placehold.co/1200x630/1e293b/FFFFFF?text=Fallback+Frame">
  <meta property="fc:frame:button:1" content="Retry">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api">
</head>
<body>
  <h1>Fallback Response</h1>
  <p>Error occurred but the frame is still working</p>
</body>
</html>
    `;
    
    // Always return a 200 status even for errors
    return res.status(200).send(fallbackHtml);
  }
}

/**
 * Minimal handler
 */
function handleMinimal(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html');
    
    // Super simple frame HTML with no logic
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://placehold.co/1200x630/1e293b/FFFFFF?text=Minimal+Frame">
  <meta property="fc:frame:button:1" content="Action Button">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/minimal">
</head>
<body>
  <h1>Minimal Frame</h1>
</body>
</html>
    `;
    
    return res.status(200).send(html);
  } catch (error) {
    // Plain text fallback
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send('Minimal API is working despite an error');
  }
}

/**
 * Direct HTML handler
 */
function handleDirectHtml(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html');
    
    // Determine what to show based on the button clicked
    const buttonIndex = req.body?.untrustedData?.buttonIndex || 0;
    
    // Change the image based on which button was clicked
    let imageText = "Direct+HTML+Frame";
    let mainText = "Direct HTML Response";
    
    if (buttonIndex === 1) {
      imageText = "24h+Data+View";
      mainText = "24-Hour Data View";
    } else if (buttonIndex === 2) {
      imageText = "7d+Data+View";
      mainText = "7-Day Data View";
    } else if (buttonIndex === 3) {
      imageText = "Share+View";
      mainText = "Share View";
    }
    
    // Generate a frame HTML response
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://placehold.co/1200x630/1e293b/FFFFFF?text=${imageText}">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/direct-html">
</head>
<body>
  <h1>${mainText}</h1>
  <p>This response was generated by the all-routes handler</p>
</body>
</html>
    `;
    
    // Return the HTML frame
    return res.status(200).send(html);
  } catch (error) {
    // Fallback HTML response
    const fallbackHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://placehold.co/1200x630/1e293b/FFFFFF?text=Fallback+Frame">
  <meta property="fc:frame:button:1" content="Retry">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/direct-html">
</head>
<body>
  <h1>Fallback Response</h1>
  <p>Error in direct HTML handler, but still working</p>
</body>
</html>
    `;
    
    // Always return a 200 status even for errors
    return res.status(200).send(fallbackHtml);
  }
}