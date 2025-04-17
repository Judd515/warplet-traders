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
  
  // For GET requests, show the typical main screen (buttons will be configured correctly)
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
      
      console.log('Button clicked:', buttonIndex);
      
      // Get the current frame type to help with context-sensitive buttons
      const currentFrame = req.body?.untrustedData?.frameType || 'vNext';
      
      // Extract additional data from the request if needed
      const fid = req.body?.untrustedData?.fid || null; // User's FID if available
      
      // Determine which frame to return based on button index and current context
      let frameType = 'main';
      
      // Direct share implementation - for consistent handling across all frames
      const shareUrl = "https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%243%2C580%20%2F%20%2442.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%242%2C940%20%2F%20%2438.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%242%2C450%20%2F%20%2431.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%241%2C840%20%2F%20%2424.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%241%2C250%20%2F%20%2418.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app";
      
      // Direct share link with one click (always button4 except in select cases)
      if (buttonIndex === 4 && currentFrame !== 'share' && currentFrame !== 'check-me-24h' && currentFrame !== 'check-me') {
        return res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=${shareUrl}">
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMWUyOTNiIi8+CiAgPHRleHQgeD0iNjAwIiB5PSIzMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+T3BlbmluZyBTaGFyZSBDb21wb3Nlci4uLjwvdGV4dD4KPC9zdmc+">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/one-file-frame">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <script>window.location.href = "${shareUrl}";</script>
</head>
<body>
  <p>Opening share composer...</p>
  <p><a href="${shareUrl}">Click here if not redirected</a></p>
</body>
</html>
        `);
      }
      
      // All frames will follow the same button pattern, even the "Check Me" frames
      // All buttons are handled the same way regardless of which frame is currently shown
      if (buttonIndex === 1) {
        // Button 1: View 24h Data
        frameType = 'day';
      } else if (buttonIndex === 2) {
        // Button 2: View 7d Data
        frameType = 'week';
      } else if (buttonIndex === 3) {
        // Button 3: Check Me - load user's FID data
        // If already on "Check Me" view, this will refresh it
        frameType = 'check-me';
      } else if (buttonIndex === 4) {
        // Button 4: Share (already handled by the direct link action)
        // Only handle the special case for the share view's "Back to Main" button
        if (currentFrame === 'share') {
          frameType = 'main';
        } else {
          // For all other cases, open the share link directly (handled by button action)
          return res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=${shareUrl}">
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMWUyOTNiIi8+CiAgPHRleHQgeD0iNjAwIiB5PSIzMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+T3BlbmluZyBTaGFyZSBDb21wb3Nlci4uLjwvdGV4dD4KPC9zdmc+">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/one-file-frame">
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
      }
      
      // Return the appropriate frame HTML
      return res.status(200).send(getFrameHtml(frameType));
    } catch (error) {
      console.error('Error handling frame action:', error);
      return res.status(200).send(getFrameHtml('error'));
    }
  }
  
  // Default response - start with user's FID data
  return res.status(200).send(getFrameHtml('check-me'));
}

/**
 * Generate frame HTML for a specific type
 */
function getFrameHtml(frameType) {
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
  
  // Sample trader data (would be replaced with real API calls)
  const topTraders24h = [
    { name: '@thcradio', token: 'BTC', earnings: '2,380', volume: '29.4K' },
    { name: '@wakaflocka', token: 'USDC', earnings: '1,940', volume: '22.7K' },
    { name: '@chrislarsc.eth', token: 'ETH', earnings: '1,450', volume: '18.2K' },
    { name: '@hellno.eth', token: 'DEGEN', earnings: '1,240', volume: '15.6K' },
    { name: '@karima', token: 'ARB', earnings: '950', volume: '11.9K' }
  ];
  
  const topTraders7d = [
    { name: '@thcradio', token: 'BTC', earnings: '3,580', volume: '42.5K' },
    { name: '@wakaflocka', token: 'USDC', earnings: '2,940', volume: '38.7K' },
    { name: '@chrislarsc.eth', token: 'ETH', earnings: '2,450', volume: '31.2K' },
    { name: '@hellno.eth', token: 'DEGEN', earnings: '1,840', volume: '24.6K' },
    { name: '@karima', token: 'ARB', earnings: '1,250', volume: '18.9K' }
  ];
  
  // Share URL that will be used directly
  const shareUrl = "https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%243%2C580%20%2F%20%2442.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%242%2C940%20%2F%20%2438.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%242%2C450%20%2F%20%2431.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%241%2C840%20%2F%20%2424.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%241%2C250%20%2F%20%2418.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app";
  
  /**
   * Generate a special redirect frame that immediately redirects to the share URL
   */
  function getRedirectFrame() {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${shareUrl}">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMWUyOTNiIi8+CiAgPHRleHQgeD0iNjAwIiB5PSIzMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+UmVkaXJlY3RpbmcgdG8gc2hhcmUuLi48L3RleHQ+Cjwvc3ZnPg==">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/one-file-frame">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
  <script>
    window.location.href = "${shareUrl}";
  </script>
</head>
<body>
  <p>Redirecting to share URL...</p>
  <p><a href="${shareUrl}">Click here if not redirected automatically</a></p>
</body>
</html>
  `;
  }
  
  // Mock data for Check Me functionality (to be replaced with actual user data)
  const userTopTraders24h = [
    { name: '@user_follow1', token: 'ETH', earnings: '1,850', volume: '23.5K' },
    { name: '@user_follow2', token: 'BTC', earnings: '1,620', volume: '19.8K' },
    { name: '@user_follow3', token: 'USDC', earnings: '1,340', volume: '17.2K' },
    { name: '@user_follow4', token: 'DEGEN', earnings: '980', volume: '12.4K' },
    { name: '@user_follow5', token: 'ARB', earnings: '720', volume: '9.1K' }
  ];
  
  const userTopTraders7d = [
    { name: '@user_follow1', token: 'ETH', earnings: '2,750', volume: '34.2K' },
    { name: '@user_follow2', token: 'BTC', earnings: '2,340', volume: '30.5K' },
    { name: '@user_follow3', token: 'USDC', earnings: '1,980', volume: '25.6K' },
    { name: '@user_follow4', token: 'DEGEN', earnings: '1,520', volume: '19.7K' },
    { name: '@user_follow5', token: 'ARB', earnings: '1,190', volume: '15.3K' }
  ];
  
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
    imageContent = createTradersSvg('24h Top Traders', topTraders24h);
    button1 = 'Back to Main';
    button2 = 'View 7d Data';
    button3 = 'Check Me';
    button4 = 'Share';
  } else if (frameType === 'week') {
    imageContent = createTradersSvg('7d Top Traders', topTraders7d);
    button1 = 'View 24h Data';
    button2 = 'Back to Main';
    button3 = 'Check Me';
    button4 = 'Share';
  } else if (frameType === 'share') {
    // Create a different SVG for share so it looks different
    imageContent = createSimpleSvg('Share Top Traders');
    button1 = 'View 24h Data';
    button2 = 'View 7d Data';
    button3 = 'Check Me';
    button4 = 'Back to Main';
  } else if (frameType === 'check-me') {
    // Show the "Check Me" view with the user's follows for 7 days
    imageContent = createTradersSvg('Your Top Followed Traders (7d)', userTopTraders7d);
    button1 = 'View 24h Data';
    button2 = 'View 7d Data';
    button3 = 'Check Me';
    button4 = 'Share';
  } else if (frameType === 'check-me-24h') {
    // Show the "Check Me" view with the user's follows for 24 hours
    imageContent = createTradersSvg('Your Top Followed Traders (24h)', userTopTraders24h);
    button1 = 'View 24h Data';
    button2 = 'View 7d Data';
    button3 = 'Check Me';
    button4 = 'Share';
  } else {
    // Error frame
    imageContent = createSimpleSvg('Error Occurred');
    button1 = 'Try Again';
    button2 = 'View 24h Data';
    button3 = 'Check Me';
    button4 = 'Share';
  }
  
  // Generate base64 image string
  const base64Image = `data:image/svg+xml;base64,${encodeBase64(imageContent)}`;
  
  // Post URL that should be included in every frame
  const postUrl = 'https://warplet-traders.vercel.app/api/one-file-frame';
  
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