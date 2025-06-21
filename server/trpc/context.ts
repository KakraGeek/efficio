import { getAuth } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';

export function createContext({ req, res }: { req: NextApiRequest; res: NextApiResponse }) {
  const auth = getAuth(req);
  return {
    userId: auth.userId,
    sessionId: auth.sessionId,
    getToken: auth.getToken,
  };
}

export type Context = ReturnType<typeof createContext>; 