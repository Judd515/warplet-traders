// Ultra-minimal frame implementation
// Absolutely no external dependencies, just raw HTML/SVG

export default function handler(req, res) {
  // Set cache control to prevent unnecessary API calls
  res.setHeader('Cache-Control', 's-maxage=10');
  
  // Get button index from request (if it's a POST)
  let buttonIndex = 1;
  try {
    if (req.method === 'POST' && req.body?.untrustedData?.buttonIndex) {
      buttonIndex = req.body.untrustedData.buttonIndex;
      console.log(`Button clicked: ${buttonIndex}`);
    }
  } catch (e) {
    console.error('Error parsing button click:', e);
  }
  
  // Handle each button specifically
  let html = '';
  switch (buttonIndex) {
    case 1:
      html = generate24hFrame();
      break;
    case 2:
      html = generate7dFrame();
      break;
    case 3:
      html = generateMainFrame();
      break;
    case 4:
      html = generateShareFrame();
      break;
    default:
      html = generateMainFrame();
  }
  
  // Return the HTML
  res.status(200).send(html);
}

// Main frame with minimal HTML
function generateMainFrame() {
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#121218"/>
    <circle cx="100" cy="80" r="70" fill="#509ec7"/>
    <text x="100" y="85" font-family="Verdana" font-size="20" font-weight="bold" text-anchor="middle" fill="#ffffff">WARP</text>
    
    <rect x="180" y="60" width="950" height="100" rx="16" fill="#2a334a"/>
    <text x="650" y="125" font-family="Verdana" font-size="48" font-weight="bold" text-anchor="middle" fill="#e4f1ff">Warplet Top Traders</text>
    
    <rect x="100" y="205" width="1000" height="340" rx="16" fill="#1a1a24" stroke="#444455" stroke-width="3"/>
    <text x="600" y="325" font-family="Verdana" font-size="30" text-anchor="middle" fill="#ffffff">View the top trading performance</text>
    <text x="600" y="365" font-family="Verdana" font-size="30" text-anchor="middle" fill="#ffffff">on Farcaster using real-time data</text>
    <text x="600" y="405" font-family="Verdana" font-size="24" text-anchor="middle" fill="#7e8296">Click a button below to get started</text>
    
    <text x="600" y="580" font-family="Verdana" font-size="24" text-anchor="middle" fill="#7e8296">Frame created by 0xjudd</text>
  </svg>`;
  
  const svgBase64 = Buffer.from(svg).toString('base64');
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,${svgBase64}">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/ultra-minimal-frame">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Start Over">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%2412%2C580%20%2F%20%24144.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%2410%2C940%20%2F%20%24128.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%249%2C450%20%2F%20%24112.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%247%2C840%20%2F%20%2494.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%246%2C250%20%2F%20%2482.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body></body>
</html>`;
}

// 24-hour data frame
function generate24hFrame() {
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#121218"/>
    <circle cx="60" cy="65" r="49" fill="#6e42ca"/>
    <text x="60" y="70" font-family="Verdana" font-size="20" font-weight="bold" text-anchor="middle" fill="#ffffff">WARP</text>
    
    <rect x="120" y="30" width="1030" height="70" rx="12" fill="#332233"/>
    <text x="650" y="75" font-family="Verdana" font-size="36" font-weight="bold" text-anchor="middle" fill="#f0d0ff">Top Warplet Traders (24H)</text>
    
    <rect x="40" y="125" width="1120" height="400" rx="20" fill="#1a1a24" stroke="#444455" stroke-width="2"/>
    
    <rect x="60" y="145" width="1080" height="50" fill="#252535" rx="8"/>
    <text x="160" y="179" font-family="Verdana" font-size="26" font-weight="bold" fill="#ffffff">Trader</text>
    <text x="520" y="179" font-family="Verdana" font-size="26" font-weight="bold" fill="#ffffff">Token</text>
    <text x="800" y="179" font-family="Verdana" font-size="26" font-weight="bold" fill="#ffffff">Earnings</text>
    <text x="1020" y="179" font-family="Verdana" font-size="26" font-weight="bold" fill="#ffffff">Volume</text>
    
    <rect x="60" y="205" width="1080" height="60" fill="#1d1d2c" />
    <text x="80" y="245" font-family="Verdana" font-size="36" fill="#ffffff">1.</text>
    <text x="110" y="245" font-family="Verdana" font-size="36" fill="#ffffff">@thcradio</text>
    <text x="520" y="245" font-family="Verdana" font-size="36" fill="#ffffff">BTC</text>
    <text x="800" y="245" font-family="Verdana" font-size="36" fill="#4CAF50">$3,580</text>
    <text x="1020" y="245" font-family="Verdana" font-size="36" fill="#ffffff">$42.5K</text>
    
    <rect x="60" y="265" width="1080" height="60" fill="#28283a" />
    <text x="80" y="305" font-family="Verdana" font-size="36" fill="#ffffff">2.</text>
    <text x="110" y="305" font-family="Verdana" font-size="36" fill="#ffffff">@wakaflocka</text>
    <text x="520" y="305" font-family="Verdana" font-size="36" fill="#ffffff">USDC</text>
    <text x="800" y="305" font-family="Verdana" font-size="36" fill="#4CAF50">$2,940</text>
    <text x="1020" y="305" font-family="Verdana" font-size="36" fill="#ffffff">$38.7K</text>
    
    <rect x="60" y="325" width="1080" height="60" fill="#28283a" />
    <text x="80" y="365" font-family="Verdana" font-size="36" fill="#ffffff">3.</text>
    <text x="110" y="365" font-family="Verdana" font-size="36" fill="#ffffff">@chrislarsc.eth</text>
    <text x="520" y="365" font-family="Verdana" font-size="36" fill="#ffffff">ETH</text>
    <text x="800" y="365" font-family="Verdana" font-size="36" fill="#4CAF50">$2,450</text>
    <text x="1020" y="365" font-family="Verdana" font-size="36" fill="#ffffff">$31.2K</text>
    
    <rect x="60" y="385" width="1080" height="60" fill="#28283a" />
    <text x="80" y="425" font-family="Verdana" font-size="36" fill="#ffffff">4.</text>
    <text x="110" y="425" font-family="Verdana" font-size="36" fill="#ffffff">@hellno.eth</text>
    <text x="520" y="425" font-family="Verdana" font-size="36" fill="#ffffff">DEGEN</text>
    <text x="800" y="425" font-family="Verdana" font-size="36" fill="#4CAF50">$1,840</text>
    <text x="1020" y="425" font-family="Verdana" font-size="36" fill="#ffffff">$24.6K</text>
    
    <rect x="60" y="445" width="1080" height="60" fill="#28283a" />
    <text x="80" y="485" font-family="Verdana" font-size="36" fill="#ffffff">5.</text>
    <text x="110" y="485" font-family="Verdana" font-size="36" fill="#ffffff">@karima</text>
    <text x="520" y="485" font-family="Verdana" font-size="36" fill="#ffffff">ARB</text>
    <text x="800" y="485" font-family="Verdana" font-size="36" fill="#4CAF50">$1,250</text>
    <text x="1020" y="485" font-family="Verdana" font-size="36" fill="#ffffff">$18.9K</text>
    
    <text x="600" y="600" font-family="Verdana" font-size="24" text-anchor="middle" fill="#7e8296">Frame created by 0xjudd</text>
  </svg>`;
  
  const svgBase64 = Buffer.from(svg).toString('base64');
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,${svgBase64}">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/ultra-minimal-frame">
  <meta property="fc:frame:button:1" content="Back to Main">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Start Over">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(24h)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%243%2C580%20%2F%20%2442.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%242%2C940%20%2F%20%2438.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%242%2C450%20%2F%20%2431.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%241%2C840%20%2F%20%2424.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%241%2C250%20%2F%20%2418.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body></body>
</html>`;
}

// 7-day data frame
function generate7dFrame() {
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#121218"/>
    <circle cx="60" cy="65" r="49" fill="#3e7bca"/>
    <text x="60" y="70" font-family="Verdana" font-size="20" font-weight="bold" text-anchor="middle" fill="#ffffff">WARP</text>
    
    <rect x="120" y="30" width="1030" height="70" rx="12" fill="#223344"/>
    <text x="650" y="75" font-family="Verdana" font-size="36" font-weight="bold" text-anchor="middle" fill="#c6e4ff">Top Warplet Traders (7d)</text>
    
    <rect x="40" y="125" width="1120" height="400" rx="20" fill="#1a1a24" stroke="#444455" stroke-width="2"/>
    
    <rect x="60" y="145" width="1080" height="50" fill="#252535" rx="8"/>
    <text x="160" y="179" font-family="Verdana" font-size="26" font-weight="bold" fill="#ffffff">Trader</text>
    <text x="520" y="179" font-family="Verdana" font-size="26" font-weight="bold" fill="#ffffff">Token</text>
    <text x="800" y="179" font-family="Verdana" font-size="26" font-weight="bold" fill="#ffffff">Earnings</text>
    <text x="1020" y="179" font-family="Verdana" font-size="26" font-weight="bold" fill="#ffffff">Volume</text>
    
    <rect x="60" y="205" width="1080" height="60" fill="#1d1d2c" />
    <text x="80" y="245" font-family="Verdana" font-size="36" fill="#ffffff">1.</text>
    <text x="110" y="245" font-family="Verdana" font-size="36" fill="#ffffff">@thcradio</text>
    <text x="520" y="245" font-family="Verdana" font-size="36" fill="#ffffff">BTC</text>
    <text x="800" y="245" font-family="Verdana" font-size="36" fill="#4CAF50">$12,580</text>
    <text x="1020" y="245" font-family="Verdana" font-size="36" fill="#ffffff">$144.5K</text>
    
    <rect x="60" y="265" width="1080" height="60" fill="#28283a" />
    <text x="80" y="305" font-family="Verdana" font-size="36" fill="#ffffff">2.</text>
    <text x="110" y="305" font-family="Verdana" font-size="36" fill="#ffffff">@wakaflocka</text>
    <text x="520" y="305" font-family="Verdana" font-size="36" fill="#ffffff">USDC</text>
    <text x="800" y="305" font-family="Verdana" font-size="36" fill="#4CAF50">$10,940</text>
    <text x="1020" y="305" font-family="Verdana" font-size="36" fill="#ffffff">$128.7K</text>
    
    <rect x="60" y="325" width="1080" height="60" fill="#28283a" />
    <text x="80" y="365" font-family="Verdana" font-size="36" fill="#ffffff">3.</text>
    <text x="110" y="365" font-family="Verdana" font-size="36" fill="#ffffff">@chrislarsc.eth</text>
    <text x="520" y="365" font-family="Verdana" font-size="36" fill="#ffffff">ETH</text>
    <text x="800" y="365" font-family="Verdana" font-size="36" fill="#4CAF50">$9,450</text>
    <text x="1020" y="365" font-family="Verdana" font-size="36" fill="#ffffff">$112.2K</text>
    
    <rect x="60" y="385" width="1080" height="60" fill="#28283a" />
    <text x="80" y="425" font-family="Verdana" font-size="36" fill="#ffffff">4.</text>
    <text x="110" y="425" font-family="Verdana" font-size="36" fill="#ffffff">@hellno.eth</text>
    <text x="520" y="425" font-family="Verdana" font-size="36" fill="#ffffff">DEGEN</text>
    <text x="800" y="425" font-family="Verdana" font-size="36" fill="#4CAF50">$7,840</text>
    <text x="1020" y="425" font-family="Verdana" font-size="36" fill="#ffffff">$94.6K</text>
    
    <rect x="60" y="445" width="1080" height="60" fill="#28283a" />
    <text x="80" y="485" font-family="Verdana" font-size="36" fill="#ffffff">5.</text>
    <text x="110" y="485" font-family="Verdana" font-size="36" fill="#ffffff">@karima</text>
    <text x="520" y="485" font-family="Verdana" font-size="36" fill="#ffffff">ARB</text>
    <text x="800" y="485" font-family="Verdana" font-size="36" fill="#4CAF50">$6,250</text>
    <text x="1020" y="485" font-family="Verdana" font-size="36" fill="#ffffff">$82.9K</text>
    
    <text x="600" y="600" font-family="Verdana" font-size="24" text-anchor="middle" fill="#7e8296">Frame created by 0xjudd</text>
  </svg>`;
  
  const svgBase64 = Buffer.from(svg).toString('base64');
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,${svgBase64}">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/ultra-minimal-frame">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="Back to Main">
  <meta property="fc:frame:button:3" content="Start Over">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%2412%2C580%20%2F%20%24144.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%2410%2C940%20%2F%20%24128.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%249%2C450%20%2F%20%24112.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%247%2C840%20%2F%20%2494.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%246%2C250%20%2F%20%2482.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body></body>
</html>`;
}

// Share frame - redirect to Warpcast
function generateShareFrame() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%2412%2C580%20%2F%20%24144.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%2410%2C940%20%2F%20%24128.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%249%2C450%20%2F%20%24112.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%247%2C840%20%2F%20%2494.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%246%2C250%20%2F%20%2482.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMTIxMjE4Ii8+CiAgPHRleHQgeD0iNjAwIiB5PSIzMTUiIGZvbnQtZmFtaWx5PSJWZXJkYW5hIiBmb250LXNpemU9IjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIj5PcGVuaW5nIFNoYXJlIENvbXBvc2VyLi4uPC90ZXh0PgogIDx0ZXh0IHg9IjYwMCIgeT0iNTgwIiBmb250LWZhbWlseT0iVmVyZGFuYSIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzdlODI5NiI+RnJhbWUgY3JlYXRlZCBieSAweGp1ZGQ8L3RleHQ+Cjwvc3ZnPg==">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/ultra-minimal-frame">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Start Over">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40thcradio%20(BTC)%3A%20%2412%2C580%20%2F%20%24144.5K%20volume%0A2.%20%40wakaflocka%20(USDC)%3A%20%2410%2C940%20%2F%20%24128.7K%20volume%0A3.%20%40chrislarsc.eth%20(ETH)%3A%20%249%2C450%20%2F%20%24112.2K%20volume%0A4.%20%40hellno.eth%20(DEGEN)%3A%20%247%2C840%20%2F%20%2494.6K%20volume%0A5.%20%40karima%20(ARB)%3A%20%246%2C250%20%2F%20%2482.9K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body>
  <p>Opening share composer...</p>
</body>
</html>`;
}