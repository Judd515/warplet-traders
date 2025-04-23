// Import the handler from the main implementation
import handler from '../../api/minimal-real.js';

// Simple wrapper for Express integration
export default function minimalRealHandler(req, res) {
  return handler(req, res);
};