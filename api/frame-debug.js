// Debug endpoint for frame interactions
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Allow preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Log detailed request information
  const requestInfo = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query,
  };
  
  console.log('Frame Debug Request Info:', JSON.stringify(requestInfo, null, 2));
  
  // Always return a success response with the data we received
  return res.status(200).json({
    message: 'Debug request received',
    requestInfo,
    timestamp: new Date().toISOString(),
  });
}