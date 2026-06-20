import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useSession } from "next-auth/react";

export const useUserReadiness = (userId?: string) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["admin", "users", userId, "readiness"],
    queryFn: async () => {
      if (!userId) return null;
      const res = await api.get(`/users/admin/${userId}/readiness`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      return res.data;
    },
    enabled: !!session?.accessToken && !!userId,
  });
};
