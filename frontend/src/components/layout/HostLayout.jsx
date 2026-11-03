import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const HostLayout = () => {
  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Fixed Host Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HostLayout;
