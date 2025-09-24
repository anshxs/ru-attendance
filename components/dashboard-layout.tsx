'use client';

import React, { useState } from 'react';
import { Sidebar, SidebarTrigger } from './sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Header */}
        <header className="bg-black border-b border-zinc-800 px-4 py-3 flex items-center justify-between lg:justify-end">
          <div className="flex items-center space-x-4">
            <SidebarTrigger onToggle={toggleSidebar} />
            <h1 className="text-xl font-semibold text-white lg:hidden">Dashboard</h1>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-black scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}