// Ultra-minimal frame API with no error-prone processing
export default function handler(req, res) {
  // Set CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  
  // Simple caching for 10 seconds
  res.setHeader('Cache-Control', 's-maxage=10');
  
  // Strip down all processing to the absolute minimum
  let buttonIndex = 1;
  
  // Very safely try to extract button index with multiple fallbacks
  if (req.method === 'POST') {
    try {
      // Try JSON body first
      if (req.body && typeof req.body === 'object') {
        buttonIndex = req.body.untrustedData?.buttonIndex || 1;
      } 
      // Try string parsing as fallback
      else if (typeof req.body === 'string') {
        try {
          const parsed = JSON.parse(req.body);
          buttonIndex = parsed.untrustedData?.buttonIndex || 1;
        } catch (e) {
          console.log('Could not parse JSON string body');
        }
      }
    } catch (e) {
      console.log('Error extracting button index, defaulting to 1');
    }
  }
  
  // Use the most basic response switching based on button
  let frame = '';
  
  if (buttonIndex === 1) {
    frame = generate24hFrame();
  } else if (buttonIndex === 2) {
    frame = generate7dFrame();
  } else if (buttonIndex === 3) {
    frame = generateShareFrame();
  } else {
    frame = generateMainFrame();
  }
  
  // Send the response in the simplest way
  return res.status(200).send(frame);
}

// Extremely simple frame HTML generators
function generateMainFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMWUyOTNiIi8+CiAgPHRleHQgeD0iNjAwIiB5PSIzMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+V2FycGxldCBUb3AgVHJhZGVyczwvdGV4dD4KPC9zdmc+">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
</head>
<body></body>
</html>
  `;
}

function generate24hFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMWUyOTNiIi8+CiAgPHRleHQgeD0iNjAwIiB5PSIzMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+MjRoIFRvcCBUcmFkZXJzPC90ZXh0Pgo8L3N2Zz4=">
  <meta property="fc:frame:button:1" content="Back to Main">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Share Results">
</head>
<body></body>
</html>
  `;
}

function generate7dFrame() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMWUyOTNiIi8+CiAgPHRleHQgeD0iNjAwIiB5PSIzMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+N2QgVG9wIFRyYWRlcnM8L3RleHQ+Cjwvc3ZnPg==">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="Back to Main">
  <meta property="fc:frame:button:3" content="Share Results">
</head>
<body></body>
</html>
  `;
}

function generateShareFrame() {
  const shareUrl = "https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%243%2C580%20%2F%20%2442.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%242%2C940%20%2F%20%2438.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%242%2C450%20%2F%20%2431.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%241%2C840%20%2F%20%2424.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%241%2C250%20%2F%20%2418.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMWUyOTNiIi8+CiAgPHRleHQgeD0iNjAwIiB5PSIzMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+U2hhcmUgVG9wIFRyYWRlcnM8L3RleHQ+Cjwvc3ZnPg==">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Open Share URL">
  <meta property="fc:frame:button:3:action" content="link">
  <meta property="fc:frame:button:3:target" content="${shareUrl}">
</head>
<body></body>
</html>
  `;
}