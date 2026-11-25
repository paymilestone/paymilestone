"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "@/lib/api/services/dashboard";
import { queryKeys } from "@/lib/api/query-keys";

export function useDashboardSummaryQuery(params?: { wallet?: string }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(params?.wallet),
    queryFn: () => getDashboardSummary(params),
    ...options,
  });
}
