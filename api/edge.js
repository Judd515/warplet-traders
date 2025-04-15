// Ultra-minimal Edge Function for Vercel
// Edge functions use a different API pattern than standard serverless functions

export default function handler(request, event) {
  // HTML with Farcaster Frame metadata
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Top Warplet Traders</title>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="https://warplet-traders.vercel.app/og.png?v=20250412-1&t=${Date.now()}" />
    <meta property="fc:frame:button:1" content="24 Hours" />
    <meta property="fc:frame:button:2" content="7 Days" />
    <meta property="fc:frame:button:3" content="Share Results" />
    <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/edge" />
    <style>
      body { font-family: sans-serif; color: #333; }
      ul { list-style-type: none; padding: 0; }
      li { margin: 10px 0; padding: 5px; }
      .green { color: green; }
      .red { color: red; }
    </style>
  </head>
  <body>
    <h1>Top Warplet Traders</h1>
    <p>Timeframe: 24 Hours</p>
    <ul>
      <li>1. thcradio (BTC): <span class="green">+76%</span></li>
      <li>2. hellno.eth (DEGEN): <span class="green">+49%</span></li>
      <li>3. wakaflocka (USDC): <span class="red">-39%</span></li>
      <li>4. karima (ARB): <span class="red">-55%</span></li>
      <li>5. chrislarsc.eth (ETH): <span class="red">-63%</span></li>
    </ul>
  </body>
</html>`;

  // Return HTML response
  return new Response(html, {
    headers: {
      'content-type': 'text/html',
      'cache-control': 'public, max-age=0, must-revalidate'
    }
  });
}