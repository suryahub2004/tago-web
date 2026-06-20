"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Settings, History, Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ContentPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("info");
  const [isDismissable, setIsDismissable] = useState(true);
  const [actionLabel, setActionLabel] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetSegment, setTargetSegment] = useState("all");

  const { data: messages, isLoading } = useQuery({
    queryKey: ["admin", "broadcasts"],
    queryFn: async () => {
      const res = await axios.get("/admin/broadcast/messages");
      return res.data?.data || res.data;
    },
  });

  const sendPopup = useMutation({
    mutationFn: async (data: any) => {
      return axios.post("/admin/broadcast/popup", data);
    },
    onSuccess: () => {
      toast.success("Broadcast message sent successfully!");
      setTitle("");
      setBody("");
      setActionLabel("");
      setActionUrl("");
      setImageUrl("");
      queryClient.invalidateQueries({ queryKey: ["admin", "broadcasts"] });
    },
    onError: () => {
      toast.error("Failed to send broadcast");
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendPopup.mutate({
      title,
      body,
      type,
      isDismissable,
      actionLabel: actionLabel || undefined,
      actionUrl: actionUrl || undefined,
      imageUrl: imageUrl || undefined,
      targetSegment
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Content & Broadcasts</h2>
          <p className="text-muted-foreground mt-1">Manage app-wide popup messages and system settings.</p>
        </div>
      </div>

      <Tabs defaultValue="broadcasts" className="flex-1 flex flex-col">
        <TabsList className="w-fit mb-4">
          <TabsTrigger value="broadcasts" className="flex items-center"><Megaphone className="w-4 h-4 mr-2"/> Broadcasts</TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center"><Settings className="w-4 h-4 mr-2"/> App Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="broadcasts" className="flex-1 space-y-6">
          <div className="grid gap-6 md:grid-cols-12">
            <Card className="md:col-span-4 border-border bg-card shadow-sm h-fit">
              <CardHeader>
                <CardTitle className="text-lg font-bold">New Broadcast</CardTitle>
                <CardDescription>Send an in-app popup message.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSend} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="App Update Available" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Input value={body} onChange={e => setBody(e.target.value)} placeholder="Please update your app to continue." required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={type} onValueChange={(val) => val && setType(val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="update">Update</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target</Label>
                      <Select value={targetSegment} onValueChange={(val) => val && setTargetSegment(val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="ring_users">Ring Users</SelectItem>
                          <SelectItem value="band_users">Band Users</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Action Label</Label>
                      <Input value={actionLabel} onChange={e => setActionLabel(e.target.value)} placeholder="e.g. Update Now" />
                    </div>
                    <div className="space-y-2">
                      <Label>Action URL</Label>
                      <Input value={actionUrl} onChange={e => setActionUrl(e.target.value)} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Image URL (Optional)</Label>
                    <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="dismissable"
                      checked={isDismissable}
                      onChange={e => setIsDismissable(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="dismissable">User can dismiss this popup</Label>
                  </div>
                  <Button type="submit" className="w-full mt-4" disabled={sendPopup.isPending}>
                    {sendPopup.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send Broadcast
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="md:col-span-8 flex flex-col gap-6">
              <Card className="border-border bg-card shadow-sm flex flex-col">
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-lg font-bold flex items-center">Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-8 bg-muted/20">
                  <div className="w-[320px] bg-background border border-border shadow-xl rounded-2xl overflow-hidden relative">
                    {imageUrl && (
                      <div className="h-40 w-full bg-muted">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          type === 'info' ? 'bg-blue-500/10 text-blue-500' :
                          type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                          type === 'update' ? 'bg-green-500/10 text-green-500' :
                          'bg-purple-500/10 text-purple-500'
                        }`}>
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{type}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{title || 'Preview Title'}</h3>
                      <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                        {body || 'This is how your broadcast message will appear to users in the mobile app.'}
                      </p>
                      {actionLabel && (
                        <Button className="w-full mb-3">{actionLabel}</Button>
                      )}
                      {isDismissable && (
                        <Button variant="ghost" className="w-full text-muted-foreground">Dismiss</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card shadow-sm flex flex-col flex-1 h-[400px]">
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-lg font-bold flex items-center"><History className="mr-2 h-5 w-5" /> Broadcast History</CardTitle>
                </CardHeader>
              <CardContent className="flex-1 overflow-auto p-0">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-muted/40 sticky top-0">
                      <TableRow>
                        <TableHead>Message</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Sent At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages?.data?.map((msg: any) => (
                        <TableRow key={msg.id}>
                          <TableCell>
                            <div className="font-medium text-slate-900 dark:text-white">{msg.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{msg.body}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{msg.type}</Badge>
                          </TableCell>
                          <TableCell className="capitalize">{msg.targetSegment.replace('_', ' ')}</TableCell>
                          <TableCell>{msg.recipientCount || 0}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(msg.sentAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      {!messages?.data?.length && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No broadcast history</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-border bg-card shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle>Global App Settings</CardTitle>
              <CardDescription>Configure minimum supported app versions and flags.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Minimum Required iOS Version</Label>
                  <Input defaultValue="1.0.0" />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Required Android Version</Label>
                  <Input defaultValue="1.0.0" />
                </div>
                <Button className="mt-2">Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
