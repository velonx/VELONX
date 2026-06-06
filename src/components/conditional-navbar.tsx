"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import FloatingNavDemo from "@/components/floating-navbar-demo";

export function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Show floating navbar on the landing page
  if (pathname === "/") {
    return <FloatingNavDemo />;
  }
  
  return <Navbar />;
}

