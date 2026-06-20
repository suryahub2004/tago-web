import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useSession } from "next-auth/react";

export const useUsers = (page: number, limit: number) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["users", page, limit],
    queryFn: async () => {
      const res = await api.get(`/users/admin/list?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      return res.data;
    },
    enabled: !!session?.accessToken,
  });
};
