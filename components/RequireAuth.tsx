import { useUser } from '@clerk/nextjs';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div className="p-8 text-center">Loading authentication...</div>;
  }
  if (!isSignedIn) {
    return <div className="p-8 text-center">Redirecting...</div>;
  }
  return <>{children}</>;
}
