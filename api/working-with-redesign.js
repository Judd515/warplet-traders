/**
 * Warplet Traders - Real Data Frame Handler
 * 
 * Provides a Farcaster frame implementation with:
 * - Clean tabular design with blue header
 * - Real trader data from Dune Analytics
 * - User-specific data from Neynar API
 * - "Check Me" button to analyze followed accounts
 * - Share and Tip functionality
 */

// This file will be served via the Express backend in development
// and directly by Vercel's serverless functions in production

export default async function handler(req, res) {
  // Set appropriate headers
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // Base URL for the app
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://warplet-traders.vercel.app'
    : `${req.protocol}://${req.headers.host}`;
  
  console.log(`[working-with-redesign] Base URL: ${baseUrl}, Environment: ${process.env.NODE_ENV}`);
  
  try {
    // Default view is global (main)
    let view = 'global';
    let fid = 0;
    
    // Handle button clicks
    if (req.method === 'POST' && req.body?.untrustedData) {
      console.log('Received POST with untrustedData:', JSON.stringify(req.body.untrustedData));
      
      const { buttonIndex, buttonText, fid: userFid } = req.body.untrustedData;
      fid = userFid || 0;
      
      console.log(`Button click: index=${buttonIndex}, text=${buttonText}, fid=${fid}`);
      
      // Button 1 logic - "Check Me" or "Try Again"
      if (buttonIndex === 1) {
        const btnText = buttonText || '';
        
        if (btnText.includes('Try Again')) {
          view = 'global';
        } else {
          view = 'user';
        }
      }
      // Button 2 logic - "Share"
      else if (buttonIndex === 2) {
        // For the Share button, we need to get the appropriate share text based on the current view
        try {
          // Import trader-service functions in a way that works with both ESM and CJS
          const { formatShareText, getGlobalTraderData, getUserTraderData } = await import('../server/api/trader-service.js');
          
          let shareText = '';
          
          if (view === 'user' && fid) {
            // Get user-specific share text
            const { traders, username } = await getUserTraderData(fid);
            shareText = formatShareText(traders, true, username);
          } else {
            // Get global share text
            const { traders } = await getGlobalTraderData('7d');
            shareText = formatShareText(traders);
          }
          
          // Encode the share text for the URL
          const encodedShareText = encodeURIComponent(shareText);
          return res.redirect(302, `https://warpcast.com/~/compose?text=${encodedShareText}`);
        } catch (shareError) {
          console.error('Error generating share text:', shareError);
          // Fall back to a simple share
          const simpleShareText = encodeURIComponent(
            `Check out the top Warplet traders on BASE!\n\nhttps://warplet-traders.vercel.app/api/working-with-redesign`
          );
          return res.redirect(302, `https://warpcast.com/~/compose?text=${simpleShareText}`);
        }
      }
      // Button 3 logic - "Tip"
      else if (buttonIndex === 3) {
        return res.redirect(302, 'https://warpcast.com/0xjudd');
      }
    }
    
    // Generate the appropriate frame based on view
    if (view === 'user') {
      // User-specific view logic
      try {
        // Import trader-service functions dynamically
        const { getUserTraderData } = await import('../server/api/trader-service.js');
        
        // Check if we have a valid FID
        if (!fid) {
          console.error('No FID provided for user-specific view');
          return generateErrorFrame(baseUrl, 'No user ID provided');
        }
        
        console.log(`Generating user-specific frame for FID: ${fid}`);
        
        // Get user-specific trader data
        const { svgImage } = await getUserTraderData(fid);
        
        // Save the SVG image to the public directory
        const fs = await import('fs/promises');
        const path = await import('path');
        
        // Ensure directory exists
        const publicDir = path.join(process.cwd(), 'public', 'images');
        try {
          await fs.mkdir(publicDir, { recursive: true });
        } catch (mkdirErr) {
          console.error('Error creating directory:', mkdirErr);
        }
        
        const svgPath = path.join(publicDir, 'user-dynamic.svg');
        await fs.writeFile(svgPath, svgImage);
        
        // Return the frame with the user-specific image
        return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/user-dynamic.svg?t=${Date.now()}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/working-with-redesign" />
  <meta property="fc:frame:button:1" content="Try Again" />
  <meta property="fc:frame:button:2" content="Share" />
  <meta property="fc:frame:button:3" content="Tip" />
</head>
<body>
  <h1>My Top Traders</h1>
</body>
</html>`);
      } catch (userError) {
        console.error('Error generating user-specific frame:', userError);
        return generateErrorFrame(baseUrl, 'Error loading user data');
      }
    } else {
      // Global view logic
      try {
        // Import trader-service functions dynamically
        const { getGlobalTraderData } = await import('../server/api/trader-service.js');
        
        console.log('Generating global frame');
        
        // Get global trader data (7-day timeframe)
        const { svgImage } = await getGlobalTraderData('7d');
        
        // Save the SVG image to the public directory
        const fs = await import('fs/promises');
        const path = await import('path');
        
        // Ensure directory exists
        const publicDir = path.join(process.cwd(), 'public', 'images');
        try {
          await fs.mkdir(publicDir, { recursive: true });
        } catch (mkdirErr) {
          console.error('Error creating directory:', mkdirErr);
        }
        
        const svgPath = path.join(publicDir, 'global-dynamic.svg');
        await fs.writeFile(svgPath, svgImage);
        
        // Return the frame with the global image
        return res.status(200).send(`<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/global-dynamic.svg?t=${Date.now()}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/working-with-redesign" />
  <meta property="fc:frame:button:1" content="Check Me" />
  <meta property="fc:frame:button:2" content="Share" />
  <meta property="fc:frame:button:3" content="Tip" />
</head>
<body>
  <h1>Warplet Top Traders</h1>
</body>
</html>`);
      } catch (globalError) {
        console.error('Error generating global frame:', globalError);
        return generateErrorFrame(baseUrl, 'Error loading global data');
      }
    }
  } catch (error) {
    console.error('Error in working-with-redesign handler:', error);
    return generateErrorFrame(baseUrl);
  }
}

/**
 * Generate an error frame
 * @param {string} baseUrl - The base URL for the app
 * @param {string} message - Optional error message
 * @returns {string} HTML for the error frame
 */
function generateErrorFrame(baseUrl, message = 'Error loading data') {
  try {
    // Try to use the dynamic error SVG generator
    const { generateErrorSvg } = require('../server/api/svg-generator');
    const fs = require('fs/promises');
    const path = require('path');
    
    // Generate error SVG
    const svgImage = generateErrorSvg(message);
    
    // Save to file
    const publicDir = path.join(process.cwd(), 'public', 'images');
    fs.mkdir(publicDir, { recursive: true }).catch(() => {});
    
    const svgPath = path.join(publicDir, 'error-dynamic.svg');
    fs.writeFile(svgPath, svgImage).catch(err => {
      console.error('Error writing error SVG:', err);
    });
    
    // Use the dynamic error image
    return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/error-dynamic.svg?t=${Date.now()}" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/working-with-redesign" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading data</h1>
</body>
</html>`;
  } catch (errorSvgError) {
    console.error('Error generating error SVG:', errorSvgError);
    
    // Fall back to static error image
    return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/images/error.svg" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/working-with-redesign" />
  <meta property="fc:frame:button:1" content="Try Again" />
</head>
<body>
  <h1>Error loading data</h1>
</body>
</html>`;
  }
}