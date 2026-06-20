"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { KanbanBoard } from "@/components/shop/KanbanBoard";

export default function ShopOrdersPage() {
  const queryClient = useQueryClient();
  const updateStatus = useMutation({
    mutationFn: async ({ id, status, trackingNumber }: { id: string, status: string, trackingNumber?: string }) => {
      return axios.patch(`/shop/admin/orders/${id}/status`, { status, trackingNumber });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const res = await axios.get("/shop/admin/orders");
      return res.data?.data || res.data;
    },
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    let trackingNumber: string | undefined;
    if (newStatus === "SHIPPED") {
      const tn = window.prompt("Enter tracking number (optional):");
      if (tn) trackingNumber = tn;
    }
    updateStatus.mutate({ id, status: newStatus, trackingNumber });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Order Fulfillment</h2>
          <p className="text-muted-foreground mt-1">Drag and drop orders to update their fulfillment status.</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <KanbanBoard orders={orders || []} onStatusChange={handleStatusChange} />
        )}
      </div>
    </div>
  );
}
