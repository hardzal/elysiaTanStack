import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/treaty";

export function useCheckout() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await api.api.payments.checkout.post();
      if (error) throw new Error("Failed to create checkout session");
      return data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data?.url) {
        window.location.href = data.url;
      }
    },
  });
}