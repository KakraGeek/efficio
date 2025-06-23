import { SignIn, useUser } from '@clerk/nextjs';
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const features = [
  {
    icon: <UsersIcon className="h-8 w-8 text-blue-600 mb-2" />,
    title: 'Client Management',
    desc: 'Store client details and measurements for easy access.',
  },
  {
    icon: <ClipboardDocumentListIcon className="h-8 w-8 text-green-600 mb-2" />,
    title: 'Order Management',
    desc: 'Track orders, deadlines, and statuses efficiently.',
  },
  {
    icon: <BanknotesIcon className="h-8 w-8 text-yellow-600 mb-2" />,
    title: 'Payment Management',
    desc: 'Record and monitor all client payments.',
  },
  {
    icon: <ArchiveBoxIcon className="h-8 w-8 text-purple-600 mb-2" />,
    title: 'Inventory Management',
    desc: 'Manage your fabrics and materials inventory.',
  },
  {
    icon: <ChartBarIcon className="h-8 w-8 text-pink-600 mb-2" />,
    title: 'Reports',
    desc: 'View business performance and analytics.',
  },
];

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (isSignedIn) {
    return null;
  }

  // Split features for top row
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Top feature cards row */}
      <div className="hidden lg:flex flex-row gap-4 w-full max-w-5xl justify-center mb-8">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-100 min-h-[140px] w-48"
          >
            {f.icon}
            <h3 className="font-semibold text-base text-gray-800 mb-1 text-center">
              {f.title}
            </h3>
            <p className="text-gray-500 text-sm text-center">{f.desc}</p>
          </div>
        ))}
      </div>
      {/* Centered marketing and embedded sign-in form */}
      <div className="w-full max-w-md flex flex-col items-center justify-center z-10 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-blue-700 mb-4 text-center">
          Welcome to Efficio
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Business management for Ghanaian fashion artisans. Effortlessly manage
          clients, orders, payments, inventory, and view reports—all in one
          place.
        </p>
        <div style={{ marginTop: 24, width: '100%' }}>
          <SignIn
            routing="hash"
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
