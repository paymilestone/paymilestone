import { apiClient } from "@/lib/api/client";
import type { DashboardSummary } from "@/lib/api/types";

export async function getDashboardSummary(params?: { wallet?: string }): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>("/api/v1/dashboard/", { params });
  return data;
}
