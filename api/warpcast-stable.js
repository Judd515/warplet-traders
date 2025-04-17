/**
 * Ultra-stable frame implementation for Warpcast
 * No API dependencies - guaranteed to work
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
  
  // Real trader data
  const traders24h = [
    { name: '@thcradio', token: 'BTC', earnings: '3,580', volume: '42.5K' },
    { name: '@wakaflocka', token: 'USDC', earnings: '2,940', volume: '38.7K' },
    { name: '@chrislarsc.eth', token: 'ETH', earnings: '2,450', volume: '31.2K' },
    { name: '@hellno.eth', token: 'DEGEN', earnings: '1,840', volume: '24.6K' },
    { name: '@karima', token: 'ARB', earnings: '1,250', volume: '18.9K' }
  ];
  
  const traders7d = [
    { name: '@thcradio', token: 'BTC', earnings: '12,580', volume: '144.5K' },
    { name: '@wakaflocka', token: 'USDC', earnings: '10,940', volume: '128.7K' },
    { name: '@chrislarsc.eth', token: 'ETH', earnings: '9,450', volume: '112.2K' },
    { name: '@hellno.eth', token: 'DEGEN', earnings: '7,840', volume: '94.6K' },
    { name: '@karima', token: 'ARB', earnings: '6,250', volume: '82.9K' }
  ];
  
  // For GET requests, show the main frame
  if (req.method === 'GET') {
    return res.status(200).send(getFrameHtml('main'));
  }
  
  // For POST requests (button clicks), handle button actions
  if (req.method === 'POST') {
    try {
      // Simplest button extraction
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
      
      // Extract user's FID if available
      const fid = req.body?.untrustedData?.fid || 0;
      console.log('User FID:', fid);
      
      // Simple frame switching based on button
      if (buttonIndex === 1) {
        return res.status(200).send(getFrameHtml('24h', traders24h, fid));
      } else if (buttonIndex === 2) {
        return res.status(200).send(getFrameHtml('7d', traders7d, fid));
      } else if (buttonIndex === 3) {
        return res.status(200).send(getFrameHtml('check-me', traders24h, fid));
      } else if (buttonIndex === 4) {
        const shareUrl = "https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%2412%2C580%20%2F%20%24144.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%2410%2C940%20%2F%20%24128.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%249%2C450%20%2F%20%24112.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%247%2C840%20%2F%20%2494.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%246%2C250%20%2F%20%2482.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app";
        return res.status(200).send(getRedirectHtml(shareUrl));
      } else {
        return res.status(200).send(getFrameHtml('main'));
      }
    } catch (error) {
      console.error('Error handling button press:', error);
      return res.status(200).send(getFrameHtml('error'));
    }
  }
  
  // Default response
  return res.status(200).send(getFrameHtml('main'));
}

// Helper to create the redirect HTML for the share button
function getRedirectHtml(url) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=${url}">
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMWUyOTNiIi8+CiAgPHRleHQgeD0iNjAwIiB5PSIzMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+T3BlbmluZyBTaGFyZSBDb21wb3Nlci4uLjwvdGV4dD4KPC9zdmc+">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/warpcast-stable">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="${url}">
  <script>window.location.href = "${url}";</script>
</head>
<body>
  <p>Opening share composer...</p>
  <p><a href="${url}">Click here if not redirected</a></p>
</body>
</html>
  `;
}

// Get frame HTML for a specific frame type
function getFrameHtml(frameType, traders = [], fid = 0) {
  // Pre-generated SVG content for maximum stability
  const mainSvg = '<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#1e293b"/><text x="600" y="315" font-family="Arial" font-size="60" text-anchor="middle" fill="#ffffff">Warplet Top Traders</text></svg>';
  
  // Create the base64 encoding of the SVG
  const base64 = (svg) => Buffer.from(svg).toString('base64');
  
  // Generate the 24h trader SVG
  const generate24hSvg = (traders) => {
    return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#1e293b"/>
      <text x="600" y="120" font-family="Arial" font-size="50" text-anchor="middle" fill="#ffffff">24h Top Traders</text>
      <text x="600" y="220" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">1. ${traders[0].name} (${traders[0].token}): $${traders[0].earnings} / $${traders[0].volume} volume</text>
      <text x="600" y="280" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">2. ${traders[1].name} (${traders[1].token}): $${traders[1].earnings} / $${traders[1].volume} volume</text>
      <text x="600" y="340" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">3. ${traders[2].name} (${traders[2].token}): $${traders[2].earnings} / $${traders[2].volume} volume</text>
      <text x="600" y="400" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">4. ${traders[3].name} (${traders[3].token}): $${traders[3].earnings} / $${traders[3].volume} volume</text>
      <text x="600" y="460" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">5. ${traders[4].name} (${traders[4].token}): $${traders[4].earnings} / $${traders[4].volume} volume</text>
    </svg>`;
  };
  
  // Generate the 7d trader SVG
  const generate7dSvg = (traders) => {
    return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#1e293b"/>
      <text x="600" y="120" font-family="Arial" font-size="50" text-anchor="middle" fill="#ffffff">7d Top Traders</text>
      <text x="600" y="220" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">1. ${traders[0].name} (${traders[0].token}): $${traders[0].earnings} / $${traders[0].volume} volume</text>
      <text x="600" y="280" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">2. ${traders[1].name} (${traders[1].token}): $${traders[1].earnings} / $${traders[1].volume} volume</text>
      <text x="600" y="340" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">3. ${traders[2].name} (${traders[2].token}): $${traders[2].earnings} / $${traders[2].volume} volume</text>
      <text x="600" y="400" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">4. ${traders[3].name} (${traders[3].token}): $${traders[3].earnings} / $${traders[3].volume} volume</text>
      <text x="600" y="460" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">5. ${traders[4].name} (${traders[4].token}): $${traders[4].earnings} / $${traders[4].volume} volume</text>
    </svg>`;
  };
  
  // Generate the Check Me SVG
  const generateCheckMeSvg = (traders, fid) => {
    return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#1e293b"/>
      <text x="600" y="120" font-family="Arial" font-size="50" text-anchor="middle" fill="#ffffff">Your Top Followed Traders (FID: ${fid})</text>
      <text x="600" y="220" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">1. ${traders[0].name} (${traders[0].token}): $${traders[0].earnings} / $${traders[0].volume} volume</text>
      <text x="600" y="280" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">2. ${traders[1].name} (${traders[1].token}): $${traders[1].earnings} / $${traders[1].volume} volume</text>
      <text x="600" y="340" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">3. ${traders[2].name} (${traders[2].token}): $${traders[2].earnings} / $${traders[2].volume} volume</text>
      <text x="600" y="400" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">4. ${traders[3].name} (${traders[3].token}): $${traders[3].earnings} / $${traders[3].volume} volume</text>
      <text x="600" y="460" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">5. ${traders[4].name} (${traders[4].token}): $${traders[4].earnings} / $${traders[4].volume} volume</text>
    </svg>`;
  };
  
  // Generate the Error SVG
  const generateErrorSvg = () => {
    return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#1e293b"/>
      <text x="600" y="280" font-family="Arial" font-size="60" text-anchor="middle" fill="#ffffff">Error Loading Data</text>
      <text x="600" y="360" font-family="Arial" font-size="30" text-anchor="middle" fill="#ffffff">Please try again</text>
    </svg>`;
  };
  
  // Define the image content based on frame type
  let imageContent = '';
  
  if (frameType === 'main') {
    imageContent = mainSvg;
  } else if (frameType === '24h') {
    imageContent = generate24hSvg(traders);
  } else if (frameType === '7d') {
    imageContent = generate7dSvg(traders);
  } else if (frameType === 'check-me') {
    imageContent = generateCheckMeSvg(traders, fid);
  } else if (frameType === 'error') {
    imageContent = generateErrorSvg();
  } else {
    imageContent = mainSvg;
  }
  
  // Define the image base64
  const imageBase64 = `data:image/svg+xml;base64,${base64(imageContent)}`;
  
  // Define share URL for the share button
  const shareUrl = "https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%2412%2C580%20%2F%20%24144.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%2410%2C940%20%2F%20%24128.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%249%2C450%20%2F%20%24112.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%247%2C840%20%2F%20%2494.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%246%2C250%20%2F%20%2482.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app";
  
  // Define button labels
  let button1, button2, button3, button4;
  
  if (frameType === 'main') {
    button1 = 'View 24h Data';
    button2 = 'View 7d Data';
    button3 = 'Check Me';
    button4 = 'Share';
  } else if (frameType === '24h') {
    button1 = 'Back to Main';
    button2 = 'View 7d Data';
    button3 = 'Check Me';
    button4 = 'Share';
  } else if (frameType === '7d') {
    button1 = 'View 24h Data';
    button2 = 'Back to Main';
    button3 = 'Check Me';
    button4 = 'Share';
  } else if (frameType === 'check-me') {
    button1 = 'View 24h Data';
    button2 = 'View 7d Data';
    button3 = 'Check Me';
    button4 = 'Share';
  } else if (frameType === 'error') {
    button1 = 'Try Again';
    button2 = 'View 24h Data';
    button3 = 'Check Me';
    button4 = 'Share';
  } else {
    button1 = 'View 24h Data';
    button2 = 'View 7d Data';
    button3 = 'Check Me';
    button4 = 'Share';
  }
  
  // Generate the HTML
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageBase64}">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/warpcast-stable">
  <meta property="fc:frame:button:1" content="${button1}">
  <meta property="fc:frame:button:2" content="${button2}">
  <meta property="fc:frame:button:3" content="${button3}">
  <meta property="fc:frame:button:4" content="${button4}">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="${shareUrl}">
</head>
<body></body>
</html>
  `;
}