/**
 * Ultra-minimal Warpcast Frame Handler
 */

// Image hosted on Imgur to ensure it works
const IMAGE_URL = 'https://i.imgur.com/k9KaLKk.png';

module.exports = (req, res) => {
  // Set content type
  res.setHeader('Content-Type', 'text/html');
  
  // Very simple button handling
  let buttonIndex = 1;
  try {
    if (req.body && req.body.untrustedData && req.body.untrustedData.buttonIndex) {
      buttonIndex = parseInt(req.body.untrustedData.buttonIndex, 10);
    }
  } catch (e) {
    // Ignore errors, use default
  }
  
  // Set page title based on button index
  const title = buttonIndex === 2 ? "7-Day View" : "24-Hour View";
  
  // Fixed data
  const traders = [
    { name: "thcradio", token: "BTC", pnl24h: "+76%", pnl7d: "+34%" },
    { name: "hellno.eth", token: "DEGEN", pnl24h: "+49%", pnl7d: "+22%" },
    { name: "wakaflocka", token: "USDC", pnl24h: "-39%", pnl7d: "-12%" },
    { name: "karima", token: "ARB", pnl24h: "-55%", pnl7d: "-28%" },
    { name: "chrislarsc.eth", token: "ETH", pnl24h: "-63%", pnl7d: "-15%" }
  ];
  
  // Special case for share button (3)
  if (buttonIndex === 3) {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${IMAGE_URL}" />
          <meta property="fc:frame:button:1" content="Back" />
          <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api" />
        </head>
        <body>
          <p>Share this with your followers!</p>
        </body>
      </html>
    `);
  }
  
  // Return simple HTML
  return res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${IMAGE_URL}" />
        <meta property="fc:frame:button:1" content="24 Hours" />
        <meta property="fc:frame:button:2" content="7 Days" />
        <meta property="fc:frame:button:3" content="Share" />
        <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api" />
      </head>
      <body>
        <h1>Top Warplet Traders - ${title}</h1>
      </body>
    </html>
  `);
};