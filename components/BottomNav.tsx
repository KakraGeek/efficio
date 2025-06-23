import Link from 'next/link';
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import React from 'react';

// Bottom navigation bar for mobile devices
const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow flex justify-around items-center h-16 md:hidden z-50">
      <Link
        href="/"
        className="flex flex-col items-center text-gray-700 hover:text-blue-600"
      >
        <HomeIcon className="h-6 w-6" />
        <span className="text-xs">Home</span>
      </Link>
      <Link
        href="/clients"
        className="flex flex-col items-center text-gray-700 hover:text-blue-600"
      >
        <UsersIcon className="h-6 w-6" />
        <span className="text-xs">Clients</span>
      </Link>
      <Link
        href="/orders"
        className="flex flex-col items-center text-gray-700 hover:text-blue-600"
      >
        <ClipboardDocumentListIcon className="h-6 w-6" />
        <span className="text-xs">Orders</span>
      </Link>
      <Link
        href="/inventory"
        className="flex flex-col items-center text-gray-700 hover:text-blue-600"
      >
        <ArchiveBoxIcon className="h-6 w-6" />
        <span className="text-xs">Inventory</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
