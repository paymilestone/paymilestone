"use client";

import { useQuery } from "@tanstack/react-query";
import { getHealth } from "@/lib/api/services/system";
import { queryKeys } from "@/lib/api/query-keys";

export function useHealthQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.system.health(),
    queryFn: getHealth,
    ...options,
  });
}
