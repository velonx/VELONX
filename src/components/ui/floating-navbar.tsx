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
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const FloatingNav = ({
  navItems,
  className,
  rightContent,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
  rightContent?: React.ReactNode;
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
          "flex max-w-fit fixed top-6 inset-x-0 mx-auto",
          "border border-border rounded-full",
          "bg-card/95 backdrop-blur-xl shadow-lg",
          "z-[5000] pr-3 pl-6 py-2.5",
          "items-center justify-center space-x-1",
          className
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center mr-2 pr-3 border-r border-border"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#219EBC] via-[#4FC3F7] to-[#E9C46A] font-outfit font-bold text-lg tracking-tight">
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

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Theme Toggle & Right Content */}
        <div className="hidden md:flex items-center pl-2 ml-1 border-l border-border space-x-2">
          <ThemeToggle />
          {rightContent && rightContent}
        </div>

        {/* Mobile Menu - shown on mobile when hamburger is clicked */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 mx-4 p-4 bg-card border border-border rounded-2xl shadow-xl md:hidden"
          >
            <div className="flex flex-col space-y-2">
              {navItems.map((navItem: any, idx: number) => (
                <Link
                  key={`mobile-link=${idx}`}
                  href={navItem.link}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {navItem.icon}
                  <span className="text-sm font-medium">{navItem.name}</span>
                </Link>
              ))}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border mt-2 pt-4">
                <ThemeToggle />
                {rightContent && <div className="ml-auto">{rightContent}</div>}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
