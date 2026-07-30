"use client";

import type { ReactNode } from "react";
import { SidebarProvider } from "./sidebar-context";
import { AppTopBar } from "./AppTopBar";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        <AppTopBar />
        <div className="flex flex-1 min-h-0">
          <AppSidebar />
          <main id="main-content" className="app-shell-scroll flex-1 min-w-0 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
