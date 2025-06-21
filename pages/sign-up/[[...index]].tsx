import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9f9f9',
        width: '100vw',
      }}
    >
      <SignUp afterSignUpUrl="/dashboard" afterSignInUrl="/dashboard" />
    </div>
  );
}