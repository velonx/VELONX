"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";

export function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Don't show the main navbar on the landing page (only show floating navbar there)
  if (pathname === "/") {
    return null;
  }
  
  return <Navbar />;
}
