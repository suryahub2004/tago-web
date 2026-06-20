"use client";

import { useState } from "react";
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
import { Loader2, MoreHorizontal, User, Search, Filter, Watch, Bell } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUserReadiness } from "@/hooks/useUserReadiness";
import { useUserApiUsage } from "@/hooks/useUserApiUsage";
import { UserDetailSheet } from "@/components/users/UserDetailSheet";
import { toast } from "sonner";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: readinessData } = useUserReadiness(selectedUser?.id);
  const { data: apiUsage } = useUserApiUsage(selectedUser?.id);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await axios.get("/users/admin/list");
      return res.data?.data || res.data;
    },
  });

  // Suspend / reactivate user mutation
  const suspendMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      await axios.patch(`/users/admin/${userId}/status`, { isActive });
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.isActive ? "User reactivated" : "User suspended");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: () => toast.error("Failed to update user status"),
  });

  const filteredUsers = users?.filter((u: any) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">User Management</h2>
          <p className="text-muted-foreground mt-1">Manage platform users, view health profiles, and pair devices.</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9 bg-card border-border focus-visible:ring-primary h-11 rounded-xl text-foreground placeholder:text-muted-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {/* Filters button — search already handles filtering client-side */}
          <Button
            variant="outline"
            className="h-11 rounded-xl border-border bg-card hover:bg-muted text-foreground"
            onClick={() => {
              if (searchTerm) {
                setSearchTerm("");
                toast.info("Filters cleared");
              } else {
                toast.info("Type in the search box to filter users");
              }
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            {searchTerm ? "Clear Filters" : "Filters"}
          </Button>

          <Dialog>
            <DialogTrigger render={
              <Button className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
                <Bell className="h-4 w-4 mr-2" />
                Bulk Notify
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Bulk Notification</DialogTitle>
                <DialogDescription>Broadcast a message to selected user segments.</DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4 py-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  try {
                    await axios.post('/admin/broadcast', {
                      title: fd.get('title'),
                      body: fd.get('body'),
                      segment: fd.get('segment'),
                    });
                    toast.success("Broadcast sent successfully!");
                  } catch {
                    toast.error("Failed to send broadcast");
                  }
                }}
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Segment</label>
                  <select name="segment" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="all">All Active Users</option>
                    <option value="ring_users">Smart Ring Users</option>
                    <option value="band_users">Whoop Band Users</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input name="title" required placeholder="Important Update" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message Body</label>
                  <Input name="body" required placeholder="Please sync your devices..." />
                </div>
                <Button type="submit" className="w-full">Send Notification</Button>
              </form>
            </DialogContent>
          </Dialog>
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
                  <TableHead className="text-muted-foreground font-semibold py-4">Name</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Email</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Phone</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Role</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user: any) => (
                  <TableRow key={user.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium py-4 text-slate-900 dark:text-zinc-100">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center mr-3 text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        {user.name || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground">{user.phone || "No Phone"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={user.isActive !== false ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20" : "bg-destructive/10 text-destructive dark:bg-destructive/20 border-transparent"}>
                        {user.isActive !== false ? "ACTIVE" : "SUSPENDED"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-zinc-900" />}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setSelectedUser(user)}
                          >
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            disabled={suspendMutation.isPending}
                            onClick={() => {
                              const willSuspend = user.isActive !== false;
                              if (window.confirm(
                                willSuspend
                                  ? `Suspend ${user.name}? They will be logged out immediately.`
                                  : `Reactivate ${user.name}?`
                              )) {
                                suspendMutation.mutate({
                                  userId: user.id,
                                  isActive: !willSuspend,
                                });
                              }
                            }}
                          >
                            {user.isActive !== false ? "Suspend User" : "Reactivate User"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredUsers || filteredUsers.length === 0) && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      {searchTerm ? `No users matching "${searchTerm}"` : "No users found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <UserDetailSheet user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}
