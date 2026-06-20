"use client";

import { useState } from "react";
import { Bell, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch unacknowledged alerts as notifications
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["admin", "notifications-bell"],
    queryFn: async () => {
      const res = await axios.get("/alerts/admin/list?limit=10");
      const items = res.data?.data || res.data || [];
      // Only show unacknowledged alerts in the bell
      return items.filter((a: any) => !a.isAcknowledged);
    },
    refetchInterval: 30000, // poll every 30s for new alerts
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await axios.patch(`/alerts/${alertId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications-bell"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "alerts"] });
    },
  });

  const unreadCount = alerts?.length ?? 0;

  const severityColor = (severity: string) => {
    if (severity === "CRITICAL") return "text-red-500";
    if (severity === "WARNING") return "text-amber-500";
    return "text-blue-500";
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors rounded-full">
          <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border border-background shadow-[0_0_5px_rgba(255,0,0,0.5)]" />
          )}
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-80 bg-card border-border">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Health Alerts</span>
          {unreadCount > 0 && (
            <span className="text-xs font-normal text-muted-foreground">{unreadCount} unacknowledged</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : alerts && alerts.length > 0 ? (
          <div className="max-h-80 overflow-y-auto">
            {alerts.map((alert: any) => (
              <DropdownMenuItem key={alert.id} className="cursor-pointer px-3 py-3 focus:bg-muted/50" asChild>
                <div className="flex items-start justify-between gap-2 w-full">
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold uppercase tracking-wide ${severityColor(alert.severity)}`}>
                      {alert.severity}
                    </p>
                    <p className="text-sm font-medium text-foreground leading-snug mt-0.5 truncate">
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.user?.name} · {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-green-500"
                    title="Acknowledge"
                    onClick={(e) => {
                      e.stopPropagation();
                      acknowledgeMutation.mutate(alert.id);
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500/50" />
            All clear — no active alerts.
          </div>
        )}
        {alerts && alerts.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="cursor-pointer text-xs text-center text-muted-foreground justify-center" asChild>
              <a href="/alerts">View all alerts →</a>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
