'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CreditCard, 
  LogOut,
  Menu,
  X,
  Calendar,
  BookOpen,
  Users,
  Utensils,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { usePremium } from '@/lib/premium-context';
import { AnimatedGradientText } from './ui/animated-gradient-text';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    isPremium: false,
  },
  {
    name: 'Courses',
    href: '/courses',
    icon: BookOpen,
    isPremium: false,
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    isPremium: false,
  },
  {
    name: 'Mess Menu',
    href: '/mess',
    icon: Utensils,
    isPremium: false,
  },
  {
    name: 'My Gatepasses',
    href: '/gatepass',
    icon: CreditCard,
    isPremium: true,
    premiumName: '👑 My Gatepasses',
  },
  {
    name: 'All Gatepasses',
    href: '/gatepasses',
    icon: Users,
    isPremium: true,
    premiumName: '👑 All Gatepasses',
  },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isPremium, isLoading: premiumLoading } = usePremium();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 bg-black border-r border-zinc-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white"><AnimatedGradientText>Rishiverse - V2</AnimatedGradientText></h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden text-zinc-400 hover:text-white hover:bg-zinc-900"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const canAccess = !item.isPremium || isPremium;
            
            // Don't show premium items if user doesn't have premium access
            if (item.isPremium && !isPremium) {
              return null;
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onToggle()}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-200",
                  isActive 
                    ? "bg-white text-black" 
                    : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.isPremium && isPremium && (
                  <span className="text-yellow-400">👑</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-zinc-800  p-4">
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-900"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}

export function SidebarTrigger({ onToggle }: { onToggle: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="lg:hidden text-zinc-400 hover:text-white hover:bg-zinc-900"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}