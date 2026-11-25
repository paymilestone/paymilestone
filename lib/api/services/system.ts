import { apiClient } from "@/lib/api/client";
import type { HealthCheckResponse } from "@/lib/api/types";

export async function getHealth(): Promise<HealthCheckResponse> {
  const { data } = await apiClient.get<HealthCheckResponse>("/api/health/");
  return data;
}
