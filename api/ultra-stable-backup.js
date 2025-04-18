/**
 * Ultra-stable frame implementation for Vercel Hobby plan
 * No external API calls or database dependencies
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
  
  // Static trader data - always consistent
  const traders = [
    { name: '@dgfld.eth', token: 'ETH', earnings: '3,250', volume: '41.2K' },
    { name: '@cryptoastro', token: 'USDC', earnings: '2,840', volume: '36.5K' },
    { name: '@lito.sol', token: 'BTC', earnings: '2,140', volume: '27.3K' },
    { name: '@dabit3', token: 'ARB', earnings: '1,780', volume: '22.9K' },
    { name: '@punk6529', token: 'DEGEN', earnings: '1,520', volume: '19.4K' }
  ];
  
  // For GET requests, show the main frame
  if (req.method === 'GET') {
    return res.status(200).send(getMainFrameHtml());
  }
  
  // For POST requests (button clicks), handle button actions
  if (req.method === 'POST') {
    try {
      // Extract button index in the simplest way possible
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
      
      // Simple frame switching based on button
      if (buttonIndex === 1) {
        return res.status(200).send(get24hFrameHtml(traders, fid));
      } else if (buttonIndex === 2) {
        return res.status(200).send(get7dFrameHtml(traders, fid));
      } else if (buttonIndex === 3) {
        return res.status(200).send(getCheckMeFrameHtml(traders, fid));
      } else if (buttonIndex === 4) {
        // Handle share - direct link to Warpcast composer
        const shareUrl = getShareUrl();
        return res.status(200).send(getShareRedirectHtml(shareUrl));
      } else {
        return res.status(200).send(getMainFrameHtml());
      }
    } catch (error) {
      console.error('Error handling button press:', error);
      return res.status(200).send(getErrorFrameHtml());
    }
  }
  
  // Default response
  return res.status(200).send(getMainFrameHtml());
}

// Get share URL for Warpcast composer
function getShareUrl() {
  return "https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40dgfld.eth%20(ETH)%3A%20%244%2C750%20%2F%20%2461.3K%20volume%0A2.%20%40cryptoastro%20(USDC)%3A%20%243%2C980%20%2F%20%2451.2K%20volume%0A3.%20%40lito.sol%20(BTC)%3A%20%243%2C560%20%2F%20%2445.9K%20volume%0A4.%20%40dabit3%20(ARB)%3A%20%242%2C910%20%2F%20%2437.5K%20volume%0A5.%20%40punk6529%20(DEGEN)%3A%20%242%2C350%20%2F%20%2430.2K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app";
}

// Static frame HTML builders - using pre-encoded base64 SVGs for maximum stability
function getMainFrameHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMWUyOTNiIi8+PHRleHQgeD0iNjAwIiB5PSIzMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+V2FycGxldCBUb3AgVHJhZGVyczwvdGV4dD48L3N2Zz4=">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/ultra-stable">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40dgfld.eth%20(ETH)%3A%20%244%2C750%20%2F%20%2461.3K%20volume%0A2.%20%40cryptoastro%20(USDC)%3A%20%243%2C980%20%2F%20%2451.2K%20volume%0A3.%20%40lito.sol%20(BTC)%3A%20%243%2C560%20%2F%20%2445.9K%20volume%0A4.%20%40dabit3%20(ARB)%3A%20%242%2C910%20%2F%20%2437.5K%20volume%0A5.%20%40punk6529%20(DEGEN)%3A%20%242%2C350%20%2F%20%2430.2K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body></body>
</html>`;
}

function get24hFrameHtml(traders, fid) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMWUyOTNiIi8+PHRleHQgeD0iNjAwIiB5PSIxMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+MjRoIFRvcCBUcmFkZXJzPC90ZXh0Pjx0ZXh0IHg9IjYwMCIgeT0iMjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmZmZmYiPjEuIEBkZ2ZsZC5ldGggKEVUSCk6ICQzLDI1MCAvICQ0MS4ySyB2b2x1bWU8L3RleHQ+PHRleHQgeD0iNjAwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+Mi4gQGNyeXB0b2FzdHJvIChVU0RDKTogJDIsODQwIC8gJDM2LjVLIHZvbHVtZTwvdGV4dD48dGV4dCB4PSI2MDAiIHk9IjM0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIj4zLiBAbGl0by5zb2wgKEJUQyk6ICQyLDE0MCAvICQyNy4zSyB2b2x1bWU8L3RleHQ+PHRleHQgeD0iNjAwIiB5PSI0MDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+NC4gQGRhYml0MyAoQVJCKTogJDEsNzgwIC8gJDIyLjlLIHZvbHVtZTwvdGV4dD48dGV4dCB4PSI2MDAiIHk9IjQ2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIj41LiBAcHVuazY1MjkgKERFR0VOKTogJDEsNTIwIC8gJDE5LjRLIHZvbHVtZTwvdGV4dD48L3N2Zz4=">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/ultra-stable">
  <meta property="fc:frame:button:1" content="Back to Main">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(24h)%0A%0A1.%20%40dgfld.eth%20(ETH)%3A%20%243%2C250%20%2F%20%2441.2K%20volume%0A2.%20%40cryptoastro%20(USDC)%3A%20%242%2C840%20%2F%20%2436.5K%20volume%0A3.%20%40lito.sol%20(BTC)%3A%20%242%2C140%20%2F%20%2427.3K%20volume%0A4.%20%40dabit3%20(ARB)%3A%20%241%2C780%20%2F%20%2422.9K%20volume%0A5.%20%40punk6529%20(DEGEN)%3A%20%241%2C520%20%2F%20%2419.4K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body></body>
</html>`;
}

function get7dFrameHtml(traders, fid) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMWUyOTNiIi8+PHRleHQgeD0iNjAwIiB5PSIxMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+N2QgVG9wIFRyYWRlcnM8L3RleHQ+PHRleHQgeD0iNjAwIiB5PSIyMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+MS4gQGRnZmxkLmV0aCAoRVRIKTogJDQsNzUwIC8gJDYxLjNLIHZvbHVtZTwvdGV4dD48dGV4dCB4PSI2MDAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIj4yLiBAY3J5cHRvYXN0cm8gKFVTREMpOiAkMyw5ODAgLyAkNTEuMksgdm9sdW1lPC90ZXh0Pjx0ZXh0IHg9IjYwMCIgeT0iMzQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmZmZmYiPjMuIEBsaXRvLnNvbCAoQlRDKTogJDMsNTYwIC8gJDQ1LjlLIHZvbHVtZTwvdGV4dD48dGV4dCB4PSI2MDAiIHk9IjQwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIj40LiBAZGFiaXQzIChBUkIpOiAkMiw5MTAgLyAkMzcuNUsgdm9sdW1lPC90ZXh0Pjx0ZXh0IHg9IjYwMCIgeT0iNDYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmZmZmYiPjUuIEBwdW5rNjUyOSAoREVHRU4pOiAkMiwzNTAgLyAkMzAuMksgdm9sdW1lPC90ZXh0PjwvdGV4Pg==">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/ultra-stable">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="Back to Main">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20(7d)%0A%0A1.%20%40dgfld.eth%20(ETH)%3A%20%244%2C750%20%2F%20%2461.3K%20volume%0A2.%20%40cryptoastro%20(USDC)%3A%20%243%2C980%20%2F%20%2451.2K%20volume%0A3.%20%40lito.sol%20(BTC)%3A%20%243%2C560%20%2F%20%2445.9K%20volume%0A4.%20%40dabit3%20(ARB)%3A%20%242%2C910%20%2F%20%2437.5K%20volume%0A5.%20%40punk6529%20(DEGEN)%3A%20%242%2C350%20%2F%20%2430.2K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body></body>
</html>`;
}

function getCheckMeFrameHtml(traders, fid) {
  const fidText = fid ? `(FID: ${fid})` : '';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMWUyOTNiIi8+PHRleHQgeD0iNjAwIiB5PSIxMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+WW91ciBUb3AgRm9sbG93ZWQgVHJhZGVycyAoRklEOiAke2ZpZH0pPC90ZXh0Pjx0ZXh0IHg9IjYwMCIgeT0iMjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmZmZmYiPjEuIEBkZ2ZsZC5ldGggKEVUSCk6ICQzLDI1MCAvICQ0MS4ySyB2b2x1bWU8L3RleHQ+PHRleHQgeD0iNjAwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+Mi4gQGNyeXB0b2FzdHJvIChVU0RDKTogJDIsODQwIC8gJDM2LjVLIHZvbHVtZTwvdGV4dD48dGV4dCB4PSI2MDAiIHk9IjM0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIj4zLiBAbGl0by5zb2wgKEJUQyk6ICQyLDE0MCAvICQyNy4zSyB2b2x1bWU8L3RleHQ+PHRleHQgeD0iNjAwIiB5PSI0MDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+NC4gQGRhYml0MyAoQVJCKTogJDEsNzgwIC8gJDIyLjlLIHZvbHVtZTwvdGV4dD48dGV4dCB4PSI2MDAiIHk9IjQ2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIj41LiBAcHVuazY1MjkgKERFR0VOKTogJDEsNTIwIC8gJDE5LjRLIHZvbHVtZTwvdGV4dD48L3N2Zz4=">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/ultra-stable">
  <meta property="fc:frame:button:1" content="View 24h Data">
  <meta property="fc:frame:button:2" content="View 7d Data">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Top%20Warplet%20Earners%20Among%20My%20Follows%0A%0A1.%20%40dgfld.eth%20(ETH)%3A%20%243%2C250%20%2F%20%2441.2K%20volume%0A2.%20%40cryptoastro%20(USDC)%3A%20%242%2C840%20%2F%20%2436.5K%20volume%0A3.%20%40lito.sol%20(BTC)%3A%20%242%2C140%20%2F%20%2427.3K%20volume%0A4.%20%40dabit3%20(ARB)%3A%20%241%2C780%20%2F%20%2422.9K%20volume%0A5.%20%40punk6529%20(DEGEN)%3A%20%241%2C520%20%2F%20%2419.4K%20volume%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body></body>
</html>`;
}

function getErrorFrameHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMWUyOTNiIi8+PHRleHQgeD0iNjAwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+RXJyb3IgTG9hZGluZyBEYXRhPC90ZXh0Pjx0ZXh0IHg9IjYwMCIgeT0iMzYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmZmZmYiPlBsZWFzZSB0cnkgYWdhaW48L3RleHQ+PC9zdmc+">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/ultra-stable">
  <meta property="fc:frame:button:1" content="Try Again">
  <meta property="fc:frame:button:2" content="View 24h Data">
  <meta property="fc:frame:button:3" content="Check Me">
  <meta property="fc:frame:button:4" content="Share">
  <meta property="fc:frame:button:4:action" content="link">
  <meta property="fc:frame:button:4:target" content="https://warpcast.com/~/compose?text=Check%20out%20Warplet%20Top%20Traders%3A%0A%0Ahttps%3A%2F%2Fwarplet-traders.vercel.app">
</head>
<body></body>
</html>`;
}

function getShareRedirectHtml(shareUrl) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=${shareUrl}">
  <meta charset="utf-8">
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMWUyOTNiIi8+PHRleHQgeD0iNjAwIiB5PSIzMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZmZmZiI+T3BlbmluZyBTaGFyZSBDb21wb3Nlci4uLjwvdGV4dD48L3N2Zz4=">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/ultra-stable">
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
</html>`;
}