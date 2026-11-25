import { apiClient } from "@/lib/api/client";
import type { Dispute, DisputeCreateRequest, DisputesListParams, SettlementApproveRequest, SettlementProposalRequest } from "@/lib/api/types";

type DisputesResponse =
  | Dispute[]
  | { results?: Dispute[]; count?: number; next?: string | null; previous?: string | null };

export async function listDisputes(params?: DisputesListParams): Promise<Dispute[]> {
  const { data } = await apiClient.get<DisputesResponse>("/api/v1/disputes/", { params });
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as { results?: Dispute[] }).results)) {
    return (data as { results: Dispute[] }).results;
  }
  return [];
}

export async function createDispute(payload: DisputeCreateRequest): Promise<Dispute> {
  const { data } = await apiClient.post<Dispute>("/api/v1/disputes/", payload);
  return data;
}

export async function getDispute(disputeId: string): Promise<Dispute> {
  const { data } = await apiClient.get<Dispute>(`/api/v1/disputes/${disputeId}/`);
  return data;
}

export async function approveDisputeSettlement(disputeId: string, payload: SettlementApproveRequest): Promise<Dispute> {
  const { data } = await apiClient.post<Dispute>(`/api/v1/disputes/${disputeId}/approve-settlement/`, payload);
  return data;
}

export async function proposeDisputeSettlement(disputeId: string, payload: SettlementProposalRequest): Promise<Dispute> {
  const { data } = await apiClient.post<Dispute>(`/api/v1/disputes/${disputeId}/propose-settlement/`, payload);
  return data;
}
