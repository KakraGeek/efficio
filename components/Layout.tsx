import React from "react";
import NavBar from "./NavBar"; // Sidebar NavBar
import BottomNav from "./BottomNav"; // Bottom navigation for mobile
import { UserButton, SignedIn } from '@clerk/nextjs';

// Layout component wraps all page content and provides consistent structure
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    // Use flex-row to create a sidebar and main content area
    <div className="min-h-screen flex flex-row bg-gray-50">
      {/* Sidebar navigation (hidden on mobile) */}
      <NavBar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top-right user icon */}
        <div className="absolute top-4 right-6 z-50">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
        <main className="flex-1">
          {children}
        </main>
        {/* Footer section */}
        <footer className="bg-white shadow p-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Efficio
        </footer>
      </div>
      {/* Bottom navigation bar for mobile */}
      <BottomNav />
    </div>
  );
};

export default Layout; 