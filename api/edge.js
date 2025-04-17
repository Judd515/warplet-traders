// Edge API with minimal dependencies
export const config = {
  runtime: 'edge'
};

export default function handler(req) {
  // Plain text response that can't fail
  return new Response('Edge API is working', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}