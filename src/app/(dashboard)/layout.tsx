import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { AdminSocketProvider } from "@/components/realtime/AdminSocketProvider";

import { CommandPalette } from "@/components/CommandPalette";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <AdminSocketProvider>
      <CommandPalette />
      <div className="flex h-screen overflow-hidden bg-muted/40">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar user={session.user} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminSocketProvider>
  );
}
