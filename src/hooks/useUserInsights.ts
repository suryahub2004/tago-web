import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useSession } from "next-auth/react";

export const useUserInsights = (userId?: string) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["admin", "users", userId, "insights"],
    queryFn: async () => {
      const res = await api.get(`/ai-coach/admin/user/${userId}/insights`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      return res.data;
    },
    enabled: !!session?.accessToken && !!userId,
  });
};
