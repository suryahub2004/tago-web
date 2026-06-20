"use client";

import { useState } from "react";
import { useAdminTickets, useAdminTicketDetail, useReplyTicketAdmin, useUpdateTicketStatus } from "@/hooks/useSupport";
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
import { Loader2, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

export default function SupportPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: ticketsRes, isLoading } = useAdminTickets(1, 50, statusFilter);
  const { data: ticketDetail, isLoading: isLoadingDetail } = useAdminTicketDetail(selectedTicketId || undefined);
  
  const replyMutation = useReplyTicketAdmin();
  const statusMutation = useUpdateTicketStatus();

  const handleReply = () => {
    if (!replyText.trim() || !selectedTicketId) return;
    replyMutation.mutate({ ticketId: selectedTicketId, message: replyText }, {
      onSuccess: () => setReplyText("")
    });
  };

  const handleStatusChange = (status: string) => {
    if (!selectedTicketId) return;
    statusMutation.mutate({ ticketId: selectedTicketId, status });
  };

  const tickets = ticketsRes?.data || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Support Tickets</h2>
          <p className="text-muted-foreground mt-1">Manage and respond to user inquiries and issues.</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-4 bg-muted/40 p-1">
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="OPEN">Open</TabsTrigger>
            <TabsTrigger value="IN_PROGRESS">Active</TabsTrigger>
            <TabsTrigger value="RESOLVED">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
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
                  <TableHead className="text-muted-foreground font-semibold py-4">Subject</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">User</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Priority</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground font-semibold">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket: any) => (
                  <TableRow 
                    key={ticket.id} 
                    className="border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    <TableCell className="font-medium py-4 text-slate-900 dark:text-zinc-100">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-3 text-muted-foreground" />
                        {ticket.subject}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {ticket.user?.name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        ticket.priority === 'urgent' ? 'border-red-500 text-red-500' :
                        ticket.priority === 'high' ? 'border-orange-500 text-orange-500' : ''
                      }>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        ticket.status === 'OPEN' ? 'bg-blue-500/10 text-blue-500 border-transparent' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-500 border-transparent' :
                        ticket.status === 'RESOLVED' ? 'bg-green-500/10 text-green-500 border-transparent' :
                        'bg-muted text-muted-foreground border-transparent'
                      }>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
                {tickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No tickets found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Sheet open={!!selectedTicketId} onOpenChange={(open) => !open && setSelectedTicketId(null)}>
        <SheetContent className="bg-card border-l-border sm:max-w-xl w-full flex flex-col p-0">
          {isLoadingDetail || !ticketDetail ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-border">
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold">{ticketDetail.subject}</SheetTitle>
                  <SheetDescription>
                    Ticket from {ticketDetail.user.name} • {ticketDetail.user.email}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex gap-2 mt-4">
                  <Badge variant="outline">{ticketDetail.category}</Badge>
                  <Badge variant="outline" className={
                    ticketDetail.priority === 'urgent' ? 'border-red-500 text-red-500' : ''
                  }>
                    {ticketDetail.priority}
                  </Badge>
                  <div className="flex-1" />
                  {ticketDetail.status !== 'RESOLVED' && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange('RESOLVED')} disabled={statusMutation.isPending}>
                      Mark Resolved
                    </Button>
                  )}
                  {ticketDetail.status === 'RESOLVED' && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange('OPEN')} disabled={statusMutation.isPending}>
                      Reopen Ticket
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-muted/20">
                {ticketDetail.messages.map((msg: any, idx: number) => (
                  <div key={idx} className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {msg.sender === 'admin' ? 'Support Agent' : ticketDetail.user.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                      msg.sender === 'admin' 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-muted border border-border/50 text-foreground rounded-tl-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border bg-card">
                <div className="flex flex-col gap-2 relative">
                  <textarea 
                    placeholder="Type your reply to the user..." 
                    className="min-h-[100px] resize-none pr-12 w-full flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={replyMutation.isPending || ticketDetail.status === 'CLOSED'}
                  />
                  <Button 
                    size="icon" 
                    className="absolute bottom-2 right-2 rounded-full w-8 h-8"
                    disabled={!replyText.trim() || replyMutation.isPending || ticketDetail.status === 'CLOSED'}
                    onClick={handleReply}
                  >
                    {replyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
