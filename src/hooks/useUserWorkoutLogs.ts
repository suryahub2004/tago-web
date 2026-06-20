import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useSession } from "next-auth/react";

export const useUserWorkoutLogs = (userId?: string) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["admin", "users", userId, "workouts"],
    queryFn: async () => {
      const res = await api.get(`/workout/admin/user/${userId}/logs`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      return res.data;
    },
    enabled: !!session?.accessToken && !!userId,
  });
};
