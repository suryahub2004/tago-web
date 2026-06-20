"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, DownloadCloud, Plus, Watch } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function FirmwarePage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ deviceType: 'SMART_RING', version: '', s3Key: '', releaseNotes: '' });

  const { data: firmwareVersions, isLoading } = useQuery({
    queryKey: ["admin", "firmware"],
    queryFn: async () => {
      const res = await axios.get("/admin/firmware");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post("/admin/firmware", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Firmware version created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "firmware"] });
      setOpen(false);
    },
    onError: () => toast.error("Failed to create firmware version"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, isLatest }: { id: string, isLatest: boolean }) => {
      const res = await axios.patch(`/admin/firmware/${id}`, { isLatest });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Firmware version updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "firmware"] });
    },
    onError: () => toast.error("Failed to update firmware version"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Firmware Management</h2>
          <p className="text-muted-foreground mt-1">Manage OTA updates and firmware versions across the fleet.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button className="h-11 rounded-xl px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> Upload New Version
            </Button>
          } />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Firmware</DialogTitle>
              <DialogDescription>Add a new OTA update to the fleet.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Device Type</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.deviceType}
                  onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                >
                  <option value="SMART_RING">Smart Ring</option>
                  <option value="WHOOP_BAND">Whoop Band</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Version</label>
                <Input required value={formData.version} onChange={e => setFormData({ ...formData, version: e.target.value })} placeholder="e.g. 2.1.5" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">S3 Key / URL</label>
                <Input required value={formData.s3Key} onChange={e => setFormData({ ...formData, s3Key: e.target.value })} placeholder="s3://firmware/update.bin" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Release Notes</label>
                <Input required value={formData.releaseNotes} onChange={e => setFormData({ ...formData, releaseNotes: e.target.value })} placeholder="Fixes battery drain..." />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
                  <TableHead className="text-muted-foreground font-semibold py-4">Version</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Device Type</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Release Notes</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Released</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {firmwareVersions?.map((fv: any) => (
                  <TableRow key={fv.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium py-4 text-slate-900 dark:text-zinc-100">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center mr-3 text-primary">
                          <DownloadCloud className="h-5 w-5" />
                        </div>
                        {fv.version}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center">
                        <Watch className="h-4 w-4 mr-2" />
                        {fv.deviceType}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate" title={fv.releaseNotes}>
                      {fv.releaseNotes}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(fv.releasedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={fv.isLatest ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" : "bg-muted text-muted-foreground border-transparent"}>
                        {fv.isLatest ? "Active" : "Archived"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!fv.isLatest && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateMutation.mutate({ id: fv.id, isLatest: true })}
                          disabled={updateMutation.isPending}
                        >
                          Mark as Active
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!firmwareVersions || firmwareVersions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No firmware versions found.
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
