// Edge API with minimal dependencies for Warpcast Frames
export const config = {
  runtime: 'edge'
};

export default function handler(req) {
  try {
    // Create a simple frame HTML response
    const frameHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://placehold.co/1200x630/1e293b/FFFFFF?text=Edge+Response+Working">
  <meta property="fc:frame:button:1" content="24h Data">
  <meta property="fc:frame:button:2" content="7d Data">
  <meta property="fc:frame:button:3" content="Share">
  <meta property="fc:frame:post_url" content="https://warplet-traders.vercel.app/api/edge">
</head>
<body>
  <h1>Edge Function Response</h1>
  <p>This response was generated by a Vercel Edge Function</p>
</body>
</html>`;

    // Return the HTML frame
    return new Response(frameHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    // Fallback response if anything fails
    return new Response('Error generating frame, but API is working', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}