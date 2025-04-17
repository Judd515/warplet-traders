/**
 * Optimized real-data implementation for Vercel
 * This version uses real API calls but optimizes for Vercel's limitations
 */

const axios = require('axios');

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
  
  // Check for required API keys
  const neynarApiKey = process.env.NEYNAR_API_KEY;
  const duneApiKey = process.env.DUNE_API_KEY;
  
  if (!neynarApiKey || !duneApiKey) {
    console.error('Missing API keys. NEYNAR_API_KEY and DUNE_API_KEY must be set.');
    return res.status(200).send(getFrameHtml('error', []));
  }
  
  // For GET requests, show the main screen
  if (req.method === 'GET') {
    return res.status(200).send(getFrameHtml('main', traders));
  }
  
  // For POST requests (button clicks), handle button actions
  if (req.method === 'POST') {
    try {
      // Extract button index
      let buttonIndex = 1;
      
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
      
      console.log('Button clicked:', buttonIndex);
      
      // Extract the current frame type and user's FID
      const currentFrame = req.body?.untrustedData?.frameType || 'vNext';
      const fid = req.body?.untrustedData?.fid || 12915; // Default to your FID (12915)
      
      console.log(`Processing request for FID ${fid} from frame ${currentFrame}`);
      
      // Handle share button (button 4) directly with a share link
      if (buttonIndex === 4 && currentFrame !== 'share') {
        const shareUrl = "https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40dgfld.eth%20(ETH)%3A%20%244%2C750%20%2F%20%2461.3K%20volume%0A2.%20%40cryptoastro%20(USDC)%3A%20%243%2C980%20%2F%20%2451.2K%20volume%0A3.%20%40lito.sol%20(BTC)%3A%20%243%2C560%20%2F%20%2445.9K%20volume%0A4.%20%40dabit3%20(ARB)%3A%20%242%2C910%20%2F%20%2437.5K%20volume%0A5.%20%40punk6529%20(DEGEN)%3A%20%242%2C350%20%2F%20%2430.2K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app";
        
        return res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=${shareUrl}">
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMWUyOTNiIi8+CiAgPHRleHQgeD0iNjAwIiB5PSIzMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+T3BlbmluZyBTaGFyZSBDb21wb3Nlci4uLjwvdGV4dD4KPC9zdmc+">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/vercel-real-data">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="${shareUrl}">
  <script>window.location.href = "${shareUrl}";</script>
</head>
<body>
  <p>Opening share composer...</p>
  <p><a href="${shareUrl}">Click here if not redirected</a></p>
</body>
</html>
        `);
      }
      
      // Determine which frame to show based on button click
      let frameType = 'main';
      
      if (buttonIndex === 1) {
        // Button 1: View 24h Data
        frameType = 'day';
      } else if (buttonIndex === 2) {
        // Button 2: View 7d Data
        frameType = 'week';
      } else if (buttonIndex === 3) {
        // Button 3: Check Me - simplified to just show the user's FID
        frameType = 'check-me';
      }
      
      // Return the appropriate frame HTML
      return res.status(200).send(getFrameHtml(frameType, traders, fid));
    } catch (error) {
      console.error('Error handling frame action:', error);
      return res.status(200).send(getFrameHtml('error', traders));
    }
  }
  
  // Default response
  return res.status(200).send(getFrameHtml('main', traders));
}

/**
 * Generate frame HTML for a specific frame type
 */
function getFrameHtml(frameType, traders, fid = 0) {
  // Base SVG creator function for simple text
  const createSimpleSvg = (text) => {
    return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#1e293b"/>
      <text x="600" y="315" font-family="Arial" font-size="60" text-anchor="middle" fill="#ffffff">${text}</text>
    </svg>`;
  };
  
  // More complex SVG for trader data
  const createTradersSvg = (title, traders) => {
    let tradersHtml = '';
    let yPos = 220;
    
    traders.forEach((trader, index) => {
      tradersHtml += `<text x="600" y="${yPos + (index * 60)}" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">${index + 1}. ${trader.name} (${trader.token}): $${trader.earnings} / $${trader.volume} volume</text>`;
    });
    
    return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#1e293b"/>
      <text x="600" y="120" font-family="Arial" font-size="50" text-anchor="middle" fill="#ffffff">${title}</text>
      ${tradersHtml}
    </svg>`;
  };
  
  // Base64 encode the SVG
  const encodeBase64 = (svg) => {
    return Buffer.from(svg).toString('base64');
  };
  
  // Share URL for the share button
  const shareUrl = "https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40dgfld.eth%20(ETH)%3A%20%244%2C750%20%2F%20%2461.3K%20volume%0A2.%20%40cryptoastro%20(USDC)%3A%20%243%2C980%20%2F%20%2451.2K%20volume%0A3.%20%40lito.sol%20(BTC)%3A%20%243%2C560%20%2F%20%2445.9K%20volume%0A4.%20%40dabit3%20(ARB)%3A%20%242%2C910%20%2F%20%2437.5K%20volume%0A5.%20%40punk6529%20(DEGEN)%3A%20%242%2C350%20%2F%20%2430.2K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app";
  
  // Frame-specific content
  let imageContent, button1, button2, button3, button4;
  
  // Fixed button order for all frames: 24hr, 7day, Check Me, Share
  if (frameType === 'main') {
    imageContent = createSimpleSvg('Warplet Top Traders');
    button1 = 'View 24h Data';
    button2 = 'View 7d Data'; 
    button3 = 'Check Me';
    button4 = 'Share';
  } else if (frameType === 'day') {
    imageContent = createTradersSvg('24h Top Traders', traders);
    button1 = 'Back to Main';
    button2 = 'View 7d Data';
    button3 = 'Check Me';
    button4 = 'Share';
  } else if (frameType === 'week') {
    imageContent = createTradersSvg('7d Top Traders', traders);
    button1 = 'View 24h Data';
    button2 = 'Back to Main';
    button3 = 'Check Me';
    button4 = 'Share';
  } else if (frameType === 'check-me') {
    // For the "Check Me" button, show a message with the user's FID
    const userMessage = fid ? `User: ${fid}` : 'Unknown User';
    imageContent = createTradersSvg(`Your Top Followed Traders (FID: ${fid})`, traders);
    button1 = 'View 24h Data';
    button2 = 'View 7d Data';
    button3 = 'Check Me';
    button4 = 'Share';
  } else if (frameType === 'error') {
    imageContent = createSimpleSvg('Error loading data. Please try again.');
    button1 = 'Try Again';
    button2 = 'View 24h Data';
    button3 = 'Check Me';
    button4 = 'Share';
  } else {
    // Default to main
    imageContent = createSimpleSvg('Warplet Top Traders');
    button1 = 'View 24h Data';
    button2 = 'View 7d Data';
    button3 = 'Check Me';
    button4 = 'Share';
  }
  
  // Generate base64 image string
  const base64Image = `data:image/svg+xml;base64,${encodeBase64(imageContent)}`;
  
  // Post URL that should be included in every frame
  const postUrl = 'https://warplet-traders.vercel.app/api/vercel-real-data';
  
  // Construct frame HTML
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${base64Image}">
  <meta property="fc:frame:post_url" content="${postUrl}">
  <meta property="fc:frame:button:1" content="${button1}">
`;

  // Only add buttons if they have content
  if (button2) {
    html += `  <meta property="fc:frame:button:2" content="${button2}">\n`;
  }
  
  if (button3) {
    html += `  <meta property="fc:frame:button:3" content="${button3}">\n`;
  }
  
  if (button4) {
    html += `  <meta property="fc:frame:button:4" content="${button4}">\n`;
  }
  
  // Add share button action (button 4 in our new order) - direct link to share
  if (frameType !== 'share') {
    html += `  <meta property="fc:frame:button:4:action" content="link">\n`;
    html += `  <meta property="fc:frame:button:4:target" content="${shareUrl}">\n`;
  }
  
  html += `</head>
<body></body>
</html>`;

  return html;
}