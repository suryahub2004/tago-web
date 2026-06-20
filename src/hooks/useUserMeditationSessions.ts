import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useSession } from "next-auth/react";

export const useUserMeditationSessions = (userId?: string) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["admin", "users", userId, "meditations"],
    queryFn: async () => {
      const res = await api.get(`/meditation/admin/user/${userId}/sessions`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      return res.data;
    },
    enabled: !!session?.accessToken && !!userId,
  });
};
