import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/treaty";

export function usePurchaseStatus() {
  return useQuery({

    queryKey: ["purchase-status"],
    queryFn: async () => {
      const { data, error } = await api.api.purchases.status.get();
      if (error) throw new Error("Failed to fetch purchase status");
      return data.purchase;
    },
  });
}