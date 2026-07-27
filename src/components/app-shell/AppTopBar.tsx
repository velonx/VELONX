"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, LayoutDashboard, Settings as SettingsIcon, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, VisuallyHidden } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UnreadCountBadge } from "@/components/unread-count-badge";
import { UnreadMessagesBadge } from "@/components/unread-messages-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppSidebarNav } from "./AppSidebarNav";
import { GlobalSearch } from "./GlobalSearch";

export function AppTopBar() {
  const { data: session } = useSession();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const dashboardLink = session?.user?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/student";

  const handleLogout = async () => {
    toast.loading("Logging out...", { id: "logout" });
    await signOut({ callbackUrl: "/" });
    toast.success("Successfully logged out!", { id: "logout" });
  };

  return (
    <header className="h-16 shrink-0 border-b border-border bg-card/80 backdrop-blur-xl flex items-center gap-4 px-4 md:px-6">
      {/* Mobile nav trigger */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:bg-muted rounded-full"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-card border-r border-border w-72 p-0">
          <VisuallyHidden>
            <SheetTitle>Navigation Menu</SheetTitle>
          </VisuallyHidden>
          <div className="flex flex-col h-full overflow-y-auto p-4">
            <Link href="/" onClick={() => setMobileNavOpen(false)} className="mb-6 px-2">
              <span className="font-outfit font-extrabold text-2xl tracking-[-0.04em]">
                <span className="text-black dark:text-[#FFFBDB]">velon</span>
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#FF7A00] to-[#FFA800] dark:from-[#FF8A00] dark:to-[#FF3C00]">x</span>
              </span>
            </Link>
            <AppSidebarNav onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Logo */}
      <Link href="/" className="hidden md:flex items-center shrink-0" aria-label="Velonx home page">
        <span className="font-outfit font-extrabold text-xl tracking-[-0.04em]">
          <span className="text-black dark:text-[#FFFBDB]">velon</span>
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#FF7A00] to-[#FFA800] dark:from-[#FF8A00] dark:to-[#FF3C00]">x</span>
        </span>
      </Link>

      {/* Global search */}
      <div className="flex-1 flex justify-center max-w-2xl mx-auto">
        <GlobalSearch />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href="/messages"
          className="p-2 text-muted-foreground hover:text-accent transition-colors rounded-full hover:bg-muted"
          aria-label="View messages"
        >
          <UnreadMessagesBadge />
        </Link>
        <Link
          href="/notifications"
          className="p-2 text-muted-foreground hover:text-accent transition-colors rounded-full hover:bg-muted"
          aria-label="View notifications"
        >
          <UnreadCountBadge />
        </Link>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-muted transition-all" aria-label="User menu">
              <Avatar className="w-8 h-8 border-2 border-primary">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-linear-to-br from-primary to-accent text-white text-xs font-bold">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:block text-sm font-semibold text-foreground">
                {session?.user?.name?.split(" ")[0]}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 bg-card border border-border shadow-xl rounded-2xl">
            <div className="px-4 py-3 border-b border-border mb-1">
              <p className="text-foreground font-black">{session?.user?.name}</p>
              <p className="text-muted-foreground text-xs truncate">{session?.user?.email}</p>
              <Badge
                className={`mt-2 font-black uppercase text-[10px] tracking-widest ${
                  session?.user?.role === "ADMIN" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-primary"
                }`}
              >
                {session?.user?.role === "ADMIN" ? "Admin Access" : "Student Member"}
              </Badge>
            </div>
            <DropdownMenuItem asChild className="cursor-pointer rounded-xl py-3">
              <Link href={dashboardLink} className="flex items-center gap-3 font-bold">
                <LayoutDashboard className="w-4 h-4" />
                My Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-xl py-3">
              <Link href="/settings" className="flex items-center gap-3 font-bold">
                <SettingsIcon className="w-4 h-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-xl py-3">
              <Link href="/referrals" className="flex items-center gap-3 font-bold">
                <Share2 className="w-4 h-4" />
                Referrals
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer rounded-xl py-3 text-red-500 focus:text-red-500 focus:bg-red-50 font-bold"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
