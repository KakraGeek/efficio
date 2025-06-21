// This is a simple API route for checking server availability
// It will respond with a 200 OK and a small JSON message
// You can use this for online status heartbeat checks
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Respond to GET requests only
  if (req.method === 'GET') {
    // Send a JSON response with a message
    res.status(200).json({ message: 'pong' });
  } else {
    // For any other HTTP method, return 405 Method Not Allowed
    res.setHeader('Allow', ['GET']);
    res.status(405).end('Method Not Allowed');
  }
} 