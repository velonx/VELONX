"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AppShell } from "./AppShell";
import { isAppShellRoute } from "./nav-items";

export function AppShellSwitcher({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const useNewShell = !!session?.user && isAppShellRoute(pathname);

  if (useNewShell) {
    return <AppShell>{children}</AppShell>;
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
