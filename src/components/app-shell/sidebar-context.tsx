"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface SidebarContextValue {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarState() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebarState must be used within a SidebarProvider");
  return ctx;
}
