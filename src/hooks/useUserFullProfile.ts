import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useSession } from "next-auth/react";

export const useUserFullProfile = (userId?: string) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["admin", "users", userId, "full-profile"],
    queryFn: async () => {
      const res = await api.get(`/users/admin/${userId}/full-profile`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      return res.data;
    },
    enabled: !!session?.accessToken && !!userId,
  });
};
