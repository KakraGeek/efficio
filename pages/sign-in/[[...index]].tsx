import { SignIn } from '@clerk/nextjs';
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

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

export default function SignInPage() {
  // Split features for left and right columns
  const leftFeatures = features.slice(0, 3);
  const rightFeatures = features.slice(3);
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-6xl flex flex-row items-center justify-center gap-4 p-4">
        {/* Left feature cards */}
        <div className="hidden lg:flex flex-col gap-4 flex-1 max-w-xs">
          {leftFeatures.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-100 min-h-[140px]"
            >
              {f.icon}
              <h3 className="font-semibold text-base text-gray-800 mb-1 text-center">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm text-center">{f.desc}</p>
            </div>
          ))}
        </div>
        {/* Clerk SignIn form */}
        <div className="w-full max-w-md flex justify-center z-10">
          <SignIn afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard" />
        </div>
        {/* Right feature cards */}
        <div className="hidden lg:flex flex-col gap-4 flex-1 max-w-xs">
          {rightFeatures.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-100 min-h-[140px]"
            >
              {f.icon}
              <h3 className="font-semibold text-base text-gray-800 mb-1 text-center">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm text-center">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
