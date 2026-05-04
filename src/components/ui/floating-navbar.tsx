"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export const FloatingNav = ({
  navItems,
  className,
  rightContent,
  mobileRightContent,
  mobileAvatar,
  mobileNavHeader,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
  rightContent?: React.ReactNode;
  mobileRightContent?: React.ReactNode;
  mobileAvatar?: React.ReactNode;
  mobileNavHeader?: React.ReactNode;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const currentScrollPos = window.scrollY;
      const direction = currentScrollPos - prevScrollPos;

      // Clear any existing timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      // Scrolling up - show navbar
      if (direction < 0) {
        setVisible(true);
      }
      // Scrolling down - hide navbar after a delay
      else if (direction > 0) {
        // Add a delay before hiding to prevent flickering
        hideTimeoutRef.current = setTimeout(() => {
          setVisible(false);
        }, 150);
      }

      setPrevScrollPos(currentScrollPos);
    }
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex fixed top-2 md:top-6 inset-x-0",
          "mx-2 md:mx-auto md:max-w-fit",
          "border border-border rounded-full",
          "bg-card/95 backdrop-blur-xl shadow-lg",
          "z-[5000] pr-2 pl-3 md:pr-3 md:pl-6 py-2",
          "items-center justify-between md:justify-center md:space-x-1",
          "max-w-[calc(100vw-16px)] md:max-w-fit",
          className
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center mr-1 pr-2 md:pr-3 md:mr-2 md:border-r border-border shrink-0"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#219EBC] via-[#4FC3F7] to-[#E9C46A] font-outfit font-bold text-sm md:text-lg tracking-tight">
            Velonx
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((navItem: any, idx: number) => (
            <Link
              key={`link=${idx}`}
              href={navItem.link}
              className={cn(
                "relative flex items-center space-x-1.5",
                "text-muted-foreground hover:text-foreground",
                "px-3 py-2 rounded-full",
                "transition-all duration-200",
                "hover:bg-muted",
                "text-sm font-medium"
              )}
            >
              <span className="text-sm">{navItem.name}</span>
            </Link>
          ))}
        </div>

        {/* Theme Toggle & Right Content - Desktop */}
        <div className="hidden md:flex items-center pl-2 ml-1 border-l border-border space-x-2">
          <ThemeToggle />
          {rightContent && rightContent}
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center gap-2 pl-2 ml-1 border-l border-border shrink-0">
          <ThemeToggle />
          {mobileAvatar && mobileAvatar}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-muted rounded-full w-8 h-8"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card border-l border-border w-[300px] p-0">
              <VisuallyHidden>
                <SheetTitle>Navigation Menu</SheetTitle>
              </VisuallyHidden>
              <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-6">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="mb-8">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#219EBC] via-[#4FC3F7] to-[#E9C46A] font-outfit font-bold text-3xl tracking-tight">
                    Velonx
                  </span>
                </Link>
                <nav className="flex flex-col gap-2">
                  {mobileNavHeader && mobileNavHeader}
                  {navItems.map((navItem: any, idx: number) => (
                    <Link
                      key={`mobile-link=${idx}`}
                      href={navItem.link}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-6 py-3 text-lg font-black text-muted-foreground hover:text-accent hover:bg-muted rounded-2xl transition-all uppercase tracking-wide"
                    >
                      {navItem.name}
                    </Link>
                  ))}
                </nav>
                {mobileRightContent && (
                  <div className="mt-auto p-4">
                    {mobileRightContent}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
