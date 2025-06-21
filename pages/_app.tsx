import '../styles/global.css';
import { ClerkProvider } from '@clerk/nextjs';
import { trpc } from '../utils/trpc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState, useEffect, useRef } from 'react';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { useOnlineStatus } from '../lib/useOnlineStatus';
import { syncPendingClients, syncPendingOrders, syncPendingInventory, syncPendingPayments } from '../lib/syncPending';
import toast from 'react-hot-toast';

function MyApp({ Component, pageProps }: AppProps) {
  // Create a single QueryClient instance per app
  const [queryClient] = useState(() => new QueryClient());

  // Create the tRPC client using httpBatchLink
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    })
  );

  const online = useOnlineStatus();
  const wasOnline = useRef(online);
  useEffect(() => {
    if (wasOnline.current !== online) {
      if (online) {
        toast.success('You are back online!');
      } else {
        toast.error('You are offline. Changes will be saved locally.');
      }
      wasOnline.current = online;
    }
  }, [online]);

  useEffect(() => {
    if (online) {
      // Sync all tables when coming back online
      Promise.all([
        syncPendingClients(),
        syncPendingOrders(),
        syncPendingInventory(),
        syncPendingPayments(),
      ]).then(() => {
        toast.success('All pending changes synced!');
      }).catch(() => {
        toast.error('Some changes could not be synced.');
      });
    }
  }, [online]);

  return (
    <ClerkProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <Layout>
              <Component {...pageProps} />
              <Toaster position="top-right" />
            </Layout>
          </ErrorBoundary>
        </QueryClientProvider>
      </trpc.Provider>
    </ClerkProvider>
  );
}

export default MyApp; 