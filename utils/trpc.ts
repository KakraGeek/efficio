import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/trpc/router';

// This creates a tRPC React hook set for your API
export const trpc = createTRPCReact<AppRouter>();
