"use client";

import { signOut } from "next-auth/react";
import { Menu, Bell, User as UserIcon, LogOut, Search } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "./NotificationBell";

export default function Topbar({ user }: { user: any }) {
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <header className="h-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-100 dark:border-zinc-900 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-10 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="flex items-center relative z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mr-4 hidden md:flex hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Visual search input matching the mockup */}
      <div className="flex-1 max-w-md mx-8 hidden md:block relative z-10">
        <div 
          className="relative cursor-pointer group"
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500 group-hover:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search users, orders, devices..."
            className="w-full pl-10 pr-10 py-2 text-sm bg-slate-100 dark:bg-zinc-900/50 border border-transparent rounded-full focus:outline-none group-hover:bg-slate-200 dark:group-hover:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-550 transition-all cursor-pointer pointer-events-none"
            readOnly
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-750 text-[10px] font-medium text-slate-450 dark:text-zinc-400 px-1.5 py-0.5 rounded shadow-sm group-hover:border-slate-300 dark:group-hover:border-zinc-600 transition-colors">
            ⌘K
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6 relative z-10">
        <ThemeToggle />
        
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full" />}><Avatar className="h-8 w-8">
                <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} alt={user.name || "User"} />
                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar></DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
                <p className="text-xs font-semibold text-primary mt-1">
                  {user.role}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/auth/login' })}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
