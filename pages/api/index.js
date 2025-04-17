// Super minimal API that can't possibly fail
export default function handler(req, res) {
  // Plain text response
  res.setHeader('Content-Type', 'text/plain');
  
  // Just return a simple string
  return res.status(200).send('OK - API is working (from pages/api)');
}