import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useSession } from "next-auth/react";

export const useDevices = (page: number, limit: number) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["devices", page, limit],
    queryFn: async () => {
      const res = await api.get(`/devices/admin/list?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      return res.data;
    },
    enabled: !!session?.accessToken,
  });
};
