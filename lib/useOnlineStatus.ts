import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  // Initialize online state based on browser's navigator.onLine property
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    // Function to update online status from browser events
    function updateOnlineStatus() {
      setOnline(navigator.onLine);
    }

    // Listen for browser online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Heartbeat: Periodically check connectivity to the server
    // This helps detect cases where the browser thinks it's online but can't reach the internet
    const interval = setInterval(async () => {
      console.log('Heartbeat: checking /api/ping');
      try {
        const response = await fetch(window.location.origin + '/api/ping', { cache: 'no-store' });
        setOnline(response.ok);
      } catch {
        setOnline(false);
      }
    }, 10000); // Check every 10 seconds

    // Cleanup event listeners and interval on unmount
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  // Return the current online status
  return online;
} 