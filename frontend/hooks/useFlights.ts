"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFlight, deleteFlight, fetchFlights, updateFlight } from "@/lib/api";
import type { FlightWatchCreate } from "@/lib/types";

const FLIGHTS_QUERY_KEY = ["flights"] as const;

export function useFlights() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: FLIGHTS_QUERY_KEY,
    queryFn: fetchFlights,
  });

  return {
    flights: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function useCreateFlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FlightWatchCreate) => createFlight(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLIGHTS_QUERY_KEY });
    },
  });
}

export function useUpdateFlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FlightWatchCreate> }) =>
      updateFlight(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLIGHTS_QUERY_KEY });
    },
  });
}

export function useDeleteFlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFlight(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLIGHTS_QUERY_KEY });
    },
  });
}
