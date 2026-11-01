"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { Loader2, Package, Truck, Search, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ShopOrdersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleUpdate = (id: string, newStatus: string, currentTracking?: string) => {
    let trackingNumber = currentTracking;
    const tn = window.prompt("Update tracking number:", currentTracking || "");
    if (tn !== null) {
      trackingNumber = tn;
      updateStatus.mutate({ id, status: newStatus, trackingNumber });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200";
      case "CONFIRMED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "SHIPPED": return "bg-purple-100 text-purple-700 border-purple-200";
      case "DELIVERED": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const filteredOrders = orders?.filter((o: any) => 
    o.id.includes(searchTerm) || 
    (o.trackingNumber && o.trackingNumber.includes(searchTerm))
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Order Management</h2>
          <p className="text-muted-foreground mt-1 text-sm">View and manage all customer orders.</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Order ID or Tracking Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Package className="h-12 w-12 mb-4 opacity-50" />
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {filteredOrders.map((order: any) => (
              <div key={order.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Order ID</span>
                    <span className="font-mono text-sm font-bold truncate max-w-[150px] block">{order.id.split("-")[0]}...</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="space-y-4 mb-6 flex-1">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tracking Number</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
                        {order.trackingNumber || "Not assigned"}
                      </span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-xs font-bold"
                        onClick={() => handleUpdate(order.id, order.status, order.trackingNumber)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Items</span>
                    <div className="space-y-2">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-sm bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                            {item.productId.includes("ring") ? "Tago Ring PRO" : item.productId.includes("band") ? "Tago Band AIR" : "Product"}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Update Status</span>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={order.status}
                      onChange={(e) => handleUpdate(order.id, e.target.value, order.trackingNumber)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
