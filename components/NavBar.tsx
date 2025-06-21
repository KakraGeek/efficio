import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { HomeIcon, UsersIcon, ClipboardDocumentListIcon, ArchiveBoxIcon, BanknotesIcon, Bars3Icon, XMarkIcon, Cog6ToothIcon, QuestionMarkCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useUser, useClerk } from '@clerk/nextjs';
import { useOnlineStatus } from '../lib/useOnlineStatus';
import { getConflictedClients, getConflictedOrders, getConflictedInventory, getConflictedPayments } from '../lib/indexedDb';

/**
 * NavBar provides navigation links to all main table pages as a vertical sidebar.
 */
const NavBar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { signOut } = useClerk();
  const online = useOnlineStatus();
  // Conflict badge state
  const [conflictCount, setConflictCount] = useState(0);

  // Close sidebar on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  // Close sidebar on click outside (mobile only)
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    async function fetchConflicts() {
      const [c, o, i, p] = await Promise.all([
        getConflictedClients(),
        getConflictedOrders(),
        getConflictedInventory(),
        getConflictedPayments(),
      ]);
      setConflictCount(c.length + o.length + i.length + p.length);
    }
    fetchConflicts();
    // Optionally, poll every 10s
    const interval = setInterval(fetchConflicts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 bg-white rounded-full p-2 shadow border border-gray-200"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <Bars3Icon className="h-6 w-6 text-blue-700" />
      </button>
      {/* Sidebar overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-30 transition-opacity md:hidden" />
      )}
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-screen w-56 bg-white border-r border-gray-200 flex flex-col py-6 px-4 z-40 shadow-sm
          transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:block
        `}
      >
        {/* Close button for mobile */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2">
            <HomeIcon className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-bold text-blue-700">Efficio</span>
            {/* Online/offline indicator dot removed for clarity and simplicity */}
          </div>
          <button
            className="md:hidden p-1 rounded hover:bg-gray-100"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 text-blue-700 font-medium transition" onClick={() => setOpen(false)}>
            <HomeIcon className="h-5 w-5" /> Dashboard
          </Link>
          <Link href="/clients" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 text-blue-700 font-medium transition" onClick={() => setOpen(false)}>
            <UsersIcon className="h-5 w-5" /> Clients
          </Link>
          <Link href="/orders" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 text-blue-700 font-medium transition" onClick={() => setOpen(false)}>
            <ClipboardDocumentListIcon className="h-5 w-5" /> Orders
          </Link>
          <Link href="/inventory" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 text-blue-700 font-medium transition" onClick={() => setOpen(false)}>
            <ArchiveBoxIcon className="h-5 w-5" /> Inventory
          </Link>
          <Link href="/payments" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 text-blue-700 font-medium transition" onClick={() => setOpen(false)}>
            <BanknotesIcon className="h-5 w-5" /> Payments
          </Link>
          <Link href="/reports" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 text-blue-700 font-medium transition" onClick={() => setOpen(false)}>
            <ChartBarIcon className="h-5 w-5" /> Reports
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 text-blue-700 font-medium transition" onClick={() => setOpen(false)}>
            <Cog6ToothIcon className="h-5 w-5" /> Settings
          </Link>
          <Link href="/support" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 text-blue-700 font-medium transition" onClick={() => setOpen(false)}>
            <QuestionMarkCircleIcon className="h-5 w-5" /> Help & Support
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default NavBar; 