"use client";

import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, Users, Watch, ShoppingCart, Bell, Users2, Settings, FileText, BarChart2, Brain, MessageSquare } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Devices', href: '/devices', icon: Watch },
  { name: 'Firmware', href: '/firmware', icon: Activity },
  { name: 'Shop Orders', href: '/shop', icon: ShoppingCart },
  { name: 'AI Insights', href: '/ai-insights', icon: Brain },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'Family Groups', href: '/family', icon: Users2 },
  { name: 'Content', href: '/content', icon: FileText },
  { name: 'Reports', href: '/reports', icon: BarChart2 },
  { name: 'Support', href: '/support', icon: MessageSquare },
  { name: 'System Health', href: '/health', icon: Activity },
];


import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  const sidebarContent = (
    <div className="flex flex-col w-64 bg-white dark:bg-black border-r border-slate-200/60 dark:border-zinc-800/80 shadow-sm dark:shadow-none relative overflow-hidden h-full">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-zinc-900 relative z-10">
        <div className="p-1 mr-3 rounded-md overflow-hidden dark:border-zinc-800">
          <img src="/logo.png" alt="Tago Logo" className="h-12 w-full object-contain" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-6 relative z-10 custom-scrollbar">
        <nav className="space-y-1.5 px-4">
          <div className="px-2 pb-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Dashboard</div>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={cn(
                  isActive 
                    ? "bg-gradient-to-r from-indigo-100/70 via-purple-50/50 to-pink-100/70 dark:from-indigo-950/40 dark:to-purple-950/40 text-indigo-700 dark:text-purple-300 border border-purple-200/40 dark:border-purple-800/40 shadow-sm font-semibold" 
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/50 hover:text-slate-900 dark:hover:text-zinc-100 border border-transparent",
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-indigo-600 dark:text-purple-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.2)]" : "text-slate-500 dark:text-zinc-400 group-hover:text-slate-800 dark:group-hover:text-zinc-200",
                    "flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors"
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-100 dark:border-zinc-900 relative z-10 bg-slate-50/50 dark:bg-black/20">
        <Link
          href="/settings"
          onClick={() => {
            if (window.innerWidth < 768) setSidebarOpen(false);
          }}
          className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/50 hover:text-slate-900 dark:hover:text-zinc-100 transition-all duration-200"
        >
          <Settings className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-slate-500 dark:text-zinc-400 group-hover:text-slate-800 dark:group-hover:text-zinc-200" />
          Settings
        </Link>
      </div>
    </div>
  );

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return (
    <>
      <div className={cn("hidden md:block h-full transition-all duration-300", sidebarOpen ? "w-64" : "w-0")}>
        {sidebarOpen && sidebarContent}
      </div>
      <div className="md:hidden">
        <Sheet open={isMobile && sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 [&>button]:hidden">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
