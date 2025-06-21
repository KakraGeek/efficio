import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';

export default function ProtectedPage() {
  const { user } = useUser();

  return (
    <div style={{ padding: 32 }}>
      <SignedIn>
        <h1>Protected Page</h1>
        <p>Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!</p>
        <UserButton />
        <p>This page is only visible to signed-in users.</p>
      </SignedIn>
      <SignedOut>
        <h1>Access Denied</h1>
        <p>You must be signed in to view this page.</p>
        <SignInButton />
      </SignedOut>
    </div>
  );
}