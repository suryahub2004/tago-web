import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useFleetHealth = () => {
  return useQuery({
    queryKey: ["admin", "devices", "fleet-health"],
    queryFn: async () => {
      const res = await api.get("/devices/admin/fleet-health");
      return res.data;
    },
    refetchInterval: 60000, // refresh every minute
  });
};
