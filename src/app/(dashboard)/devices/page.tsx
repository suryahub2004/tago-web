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
import { Loader2, MoreHorizontal, Watch, Battery, ArrowUpCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { FleetHealthCards } from "@/components/devices/FleetHealthCards";

export default function DevicesPage() {
  const [updating, setUpdating] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: devices, isLoading } = useQuery({
    queryKey: ["admin", "devices"],
    queryFn: async () => {
      const res = await axios.get("/devices/admin/list");
      return res.data?.data || res.data;
    },
  });

  // Unpair mutation — calls DELETE /devices/:id/unpair
  const unpairMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      await axios.delete(`/devices/${deviceId}/unpair`);
    },
    onSuccess: () => {
      toast.success("Device unpaired successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "devices"] });
    },
    onError: () => toast.error("Failed to unpair device"),
  });

  // Firmware update — calls PATCH /devices/:id/firmware
  const firmwareMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      await axios.patch(`/devices/${deviceId}/firmware`, { triggerUpdate: true });
    },
    onSuccess: () => {
      toast.success("Firmware update queued for device");
      queryClient.invalidateQueries({ queryKey: ["admin", "devices"] });
    },
    onError: () => toast.error("Failed to queue firmware update"),
  });

  const handleFirmwareUpdate = (deviceId: string) => {
    setUpdating(deviceId);
    firmwareMutation.mutate(deviceId, {
      onSettled: () => setUpdating(null),
    });
  };

  const handleUnpair = (device: any) => {
    if (window.confirm(`Unpair device "${device.deviceName || device.deviceSerial}"? This cannot be undone.`)) {
      unpairMutation.mutate(device.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Device Fleet</h2>
          <p className="text-muted-foreground mt-1">Monitor connected rings and bands, battery status, and firmware versions.</p>
        </div>
      </div>

      <FleetHealthCards />

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
                  <TableHead className="text-muted-foreground font-semibold py-4">Device ID / Type</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Paired User</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Battery</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Firmware</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Last Sync</TableHead>
                  <TableHead className="text-right text-muted-foreground font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices?.map((device: any) => (
                  <TableRow key={device.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center mr-3 text-primary">
                          <Watch className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-slate-900 dark:text-zinc-100 font-semibold">{device.deviceName || "Unnamed Device"}</div>
                          <div className="text-xs text-muted-foreground font-normal">
                            {device.deviceSerial || device.id.slice(0, 8)} • {device.deviceType?.replace('_', ' ') || 'Unknown Type'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {device.user ? device.user.name : "Unpaired"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Battery className={`h-4 w-4 ${(device.batteryLevel ?? 0) > 20 ? 'text-green-500' : 'text-destructive'}`} />
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${(device.batteryLevel ?? 0) > 20 ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-destructive'}`}
                            style={{ width: `${device.batteryLevel || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{device.batteryLevel || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-muted/40 text-muted-foreground border-border font-mono">
                          v{device.firmwareVersion || '1.0.0'}
                        </Badge>
                        {device.firmwareVersion === '2.1.5' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-500" aria-label="Update available" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {device.lastSyncAt ? new Date(device.lastSyncAt).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-zinc-900" />}>
                          <span className="sr-only">Open menu</span>
                          {updating === device.id
                            ? <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            : <MoreHorizontal className="h-4 w-4" />}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          <DropdownMenuLabel>Device Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            disabled={firmwareMutation.isPending}
                            onClick={() => handleFirmwareUpdate(device.id)}
                          >
                            <ArrowUpCircle className="h-4 w-4 mr-2 text-primary" />
                            Push Firmware Update
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            disabled={unpairMutation.isPending}
                            onClick={() => handleUnpair(device)}
                          >
                            Force Unpair
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {(!devices || devices.length === 0) && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No devices paired yet.
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
