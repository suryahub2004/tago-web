"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AlertsPage() {
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["admin", "alerts"],
    queryFn: async () => {
      const res = await axios.get("/alerts/admin/list");
      return res.data?.data || res.data;
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.patch(`/alerts/${id}/acknowledge`);
    },
    onSuccess: () => {
      toast.success("Alert acknowledged successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "alerts"] });
    },
    onError: () => {
      toast.error("Failed to acknowledge alert");
    }
  });

  const getSeverityStyles = (severity: string) => {
    switch(severity) {
      case 'CRITICAL': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20';
      default: return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4 mr-1.5" />;
      case 'HIGH': return <AlertCircle className="h-4 w-4 mr-1.5" />;
      default: return <Info className="h-4 w-4 mr-1.5" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Health Alerts</h2>
          <p className="text-muted-foreground mt-1">Real-time anomaly detection and critical fleet alerts.</p>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden border-border bg-card shadow-sm flex flex-col">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <Table>
              <TableHeader className="bg-muted/40 dark:bg-zinc-900/50 sticky top-0">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-semibold py-4">Severity</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">User</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Alert Type</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Message</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Time</TableHead>
                  <TableHead className="text-right text-muted-foreground font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts?.map((alert: any) => (
                  <TableRow key={alert.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                    <TableCell className="py-4">
                      <Badge variant="outline" className={`flex w-fit items-center px-2.5 py-1 ${getSeverityStyles(alert.severity)}`}>
                        {getSeverityIcon(alert.severity)}
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-900 dark:text-zinc-100 font-semibold">{alert.user?.name || "Unknown User"}</TableCell>
                    <TableCell className="text-muted-foreground">{alert.alertType}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">{alert.message}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(alert.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {alert.isAcknowledged ? (
                        <div className="flex items-center justify-end text-green-500 font-medium text-sm">
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                          Ack&apos;d
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 hover:border-transparent transition-all"
                          onClick={() => acknowledgeMutation.mutate(alert.id)}
                          disabled={acknowledgeMutation.isPending}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!alerts || alerts.length === 0) && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No active alerts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
