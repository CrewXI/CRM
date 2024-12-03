'use client';

import React from 'react';
import { useAuth } from "../../contexts/auth-context";
import { SidebarNav } from "./sidebar-nav";
import { Button } from "../ui/button";
import { LogOut } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r lg:block">
        <div className="flex h-full flex-col gap-4 p-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">CRM Project</h1>
          </div>
          <SidebarNav />
          <Button 
            variant="ghost" 
            className="mt-auto w-full justify-start"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
