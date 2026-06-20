import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

export const useAdminTickets = (page = 1, limit = 25, status?: string) => {
  return useQuery({
    queryKey: ["admin", "support", page, limit, status],
    queryFn: async () => {
      const res = await api.get("/support/admin/list", {
        params: { page, limit, status: status !== "ALL" ? status : undefined },
      });
      return res.data;
    },
  });
};

export const useAdminTicketDetail = (ticketId?: string) => {
  return useQuery({
    queryKey: ["admin", "support", ticketId],
    queryFn: async () => {
      if (!ticketId) return null;
      const res = await api.get(`/support/admin/${ticketId}`);
      return res.data;
    },
    enabled: !!ticketId,
  });
};

export const useReplyTicketAdmin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const res = await api.post(`/support/admin/${ticketId}/reply`, { message });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "support"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "support", variables.ticketId] });
      toast.success("Reply sent successfully");
    },
    onError: () => {
      toast.error("Failed to send reply");
    },
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const res = await api.patch(`/support/admin/${ticketId}/status`, { status });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "support"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "support", variables.ticketId] });
      toast.success("Status updated");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });
};
