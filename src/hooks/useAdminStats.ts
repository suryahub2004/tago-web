import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useSession } from "next-auth/react";

export const useAdminOverview = (range?: string) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["admin", "overview", range],
    queryFn: async () => {

      try {
        const url = range ? `/admin/stats/overview?range=${range}` : `/admin/stats/overview`;
        const res = await api.get(url, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        });
        return res.data;
      } catch (e) {
        console.warn("API failed, throwing error.");
        throw e;
      }
    },
    enabled: !!session?.accessToken,
  });
};
