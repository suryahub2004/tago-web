"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Users2, Shield, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function FamilyPage() {
  const queryClient = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const { data: groups, isLoading } = useQuery({
    queryKey: ["admin", "family"],
    queryFn: async () => {
      const res = await axios.get("/family/admin/list");
      return res.data?.data || res.data;
    },
  });

  // Fetch detail when a group is selected
  const { data: groupDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["admin", "family", selectedGroup?.id],
    queryFn: async () => {
      const res = await axios.get(`/family/admin/${selectedGroup.id}`);
      return res.data;
    },
    enabled: !!selectedGroup?.id,
  });

  const disbandMutation = useMutation({
    mutationFn: async (groupId: string) => {
      // No dedicated disband endpoint — use remove-all-members approach or
      // call a soft-delete if it exists. For now we mark via admin notes.
      // The safest real action we can do without a dedicated endpoint is
      // to warn the admin. If the backend adds DELETE /family/admin/:id, use that.
      await axios.delete(`/family/admin/${groupId}`);
    },
    onSuccess: () => {
      toast.success("Family group disbanded");
      setSelectedGroup(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "family"] });
    },
    onError: () => toast.error("Failed to disband group — endpoint may not be available yet"),
  });

  const handleDisband = (group: any) => {
    if (window.confirm(`Disband "${group.name}"? All members will lose access to shared health data.`)) {
      disbandMutation.mutate(group.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Family Circles</h2>
          <p className="text-muted-foreground mt-1">Manage family groups, linked members, and viewing permissions.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups?.map((group: any) => (
            <Card key={group.id} className="border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                      <Users2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-900 dark:text-zinc-100 font-bold">{group.name || "Family Circle"}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Owner: {group.owner?.name || "Unknown"}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-zinc-900" />}>
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuLabel>Group Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setSelectedGroup(group)}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        disabled={disbandMutation.isPending}
                        onClick={() => handleDisband(group)}
                      >
                        Disband Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Members</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">{group._count?.members ?? group.members?.length ?? 0}</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Members</h5>
                    <div className="space-y-3">
                      {group.members?.slice(0, 3).map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6 border border-border">
                              <AvatarFallback className="text-[10px] bg-muted">{member.member?.name?.charAt(0) || member.user?.name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-slate-900/80 dark:text-white/80">{member.member?.name || member.user?.name || "Member"}</span>
                          </div>
                          {member.role === 'OWNER' && (
                            <Shield className="h-3 w-3 text-primary" />
                          )}
                        </div>
                      ))}
                      {(group._count?.members ?? group.members?.length ?? 0) > 3 && (
                        <div className="text-xs text-muted-foreground mt-2 flex items-center justify-center bg-muted/40 dark:bg-zinc-900/30 py-1 rounded-md">
                          + {(group._count?.members ?? group.members?.length ?? 0) - 3} more members
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!groups || groups.length === 0) && !isLoading && (
            <div className="col-span-full h-32 flex items-center justify-center text-muted-foreground border border-border border-dashed rounded-xl bg-card">
              No family groups have been created yet.
            </div>
          )}
        </div>
      )}

      {/* Group detail sheet */}
      <Sheet open={!!selectedGroup} onOpenChange={(open) => !open && setSelectedGroup(null)}>
        <SheetContent className="bg-card border-l-border sm:max-w-md w-full overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold">{selectedGroup?.name}</SheetTitle>
            <SheetDescription>Owner: {selectedGroup?.owner?.name}</SheetDescription>
          </SheetHeader>
          {isLoadingDetail ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : groupDetail ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">All Members</h4>
                <div className="space-y-3">
                  {groupDetail.members?.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {member.member?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{member.member?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{member.member?.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-[10px]">{member.relationship}</Badge>
                        <span className={`text-[10px] font-medium ${member.inviteAccepted ? 'text-green-500' : 'text-amber-500'}`}>
                          {member.inviteAccepted ? 'Active' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Created {new Date(groupDetail.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
