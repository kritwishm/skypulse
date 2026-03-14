"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPriceHistory } from "@/lib/api";

export function usePriceHistory(flightId: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["priceHistory", flightId],
    queryFn: () => fetchPriceHistory(flightId!),
    enabled: flightId !== null,
  });

  return { history: data ?? [], isLoading, error };
}
