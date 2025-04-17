/**
 * All-in-one standalone frame implementation
 * This file contains all logic needed to serve the frame, 
 * using the most minimal approach possible
 */

export default function handler(req, res) {
  // Set headers for CORS and caching
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=10');
  
  // Handle preflight CORS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // For GET requests, return the entry frame HTML
  if (req.method === 'GET') {
    return res.status(200).send(getFrameHtml('main'));
  }
  
  // For POST requests (button clicks), parse the button index and return appropriate frame
  if (req.method === 'POST') {
    try {
      // Simplest possible button extraction
      let buttonIndex = 1;
      let requestData = '';
      
      // Try to get button index from request body
      if (req.body) {
        if (typeof req.body === 'string') {
          try {
            const parsed = JSON.parse(req.body);
            buttonIndex = parsed.untrustedData?.buttonIndex || 1;
          } catch (e) {
            console.log('Could not parse string body');
          }
        } else if (typeof req.body === 'object') {
          buttonIndex = req.body.untrustedData?.buttonIndex || 1;
        }
      }
      
      // Determine which frame to return based on button index
      let frameType = 'main';
      
      if (buttonIndex === 1) {
        frameType = 'day';
      } else if (buttonIndex === 2) {
        frameType = 'week';
      } else if (buttonIndex === 3) {
        frameType = 'share';
      } else {
        frameType = 'main';
      }
      
      // Return the appropriate frame HTML
      return res.status(200).send(getFrameHtml(frameType));
    } catch (error) {
      console.error('Error handling frame action:', error);
      return res.status(200).send(getFrameHtml('error'));
    }
  }
  
  // Default response
  return res.status(200).send(getFrameHtml('main'));
}

/**
 * Generate frame HTML for a specific type
 */
function getFrameHtml(frameType) {
  // Base SVG creator function
  const createSvg = (text) => {
    return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#1e293b"/>
      <text x="600" y="315" font-family="Arial" font-size="60" text-anchor="middle" fill="#ffffff">${text}</text>
    </svg>`;
  };
  
  // Base64 encode the SVG
  const encodeBase64 = (svg) => {
    return Buffer.from(svg).toString('base64');
  };
  
  // Frame-specific content
  let imageContent, button1, button2, button3, button3Action, button3Target;
  
  if (frameType === 'main') {
    imageContent = createSvg('Warplet Top Traders');
    button1 = 'View 24h Data';
    button2 = 'View 7d Data'; 
    button3 = 'Share Results';
  } else if (frameType === 'day') {
    imageContent = createSvg('24h Top Traders');
    button1 = 'Back to Main';
    button2 = 'View 7d Data';
    button3 = 'Share Results';
  } else if (frameType === 'week') {
    imageContent = createSvg('7d Top Traders');
    button1 = 'View 24h Data';
    button2 = 'Back to Main';
    button3 = 'Share Results';
  } else if (frameType === 'share') {
    imageContent = createSvg('Share Results');
    button1 = 'View 24h Data';
    button2 = 'View 7d Data';
    button3 = 'Open Share URL';
    button3Action = 'link';
    button3Target = 'https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%243%2C580%20%2F%20%2442.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%242%2C940%20%2F%20%2438.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%242%2C450%20%2F%20%2431.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%241%2C840%20%2F%20%2424.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%241%2C250%20%2F%20%2418.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app';
  } else {
    // Error frame
    imageContent = createSvg('Error Occurred');
    button1 = 'Try Again';
    button2 = '';
    button3 = '';
  }
  
  // Generate base64 image string
  const base64Image = `data:image/svg+xml;base64,${encodeBase64(imageContent)}`;
  
  // Construct frame HTML
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${base64Image}">
  <meta property="fc:frame:button:1" content="${button1}">
`;

  // Only add buttons if they have content
  if (button2) {
    html += `  <meta property="fc:frame:button:2" content="${button2}">\n`;
  }
  
  if (button3) {
    html += `  <meta property="fc:frame:button:3" content="${button3}">\n`;
    
    if (button3Action && button3Target) {
      html += `  <meta property="fc:frame:button:3:action" content="${button3Action}">\n`;
      html += `  <meta property="fc:frame:button:3:target" content="${button3Target}">\n`;
    }
  }
  
  html += `</head>
<body></body>
</html>`;

  return html;
}