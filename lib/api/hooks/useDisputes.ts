"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveDisputeSettlement,
  createDispute,
  getDispute,
  listDisputes,
  proposeDisputeSettlement,
} from "@/lib/api/services/disputes";
import { queryKeys } from "@/lib/api/query-keys";
import type { DisputeCreateRequest, DisputesListParams, SettlementApproveRequest, SettlementProposalRequest } from "@/lib/api/types";

export function useDisputesQuery(params?: DisputesListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.disputes.list(params as Record<string, unknown> | undefined),
    queryFn: () => listDisputes(params),
    ...options,
  });
}

export function useDisputeQuery(disputeId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: disputeId ? queryKeys.disputes.detail(disputeId) : ["disputes", "detail", "missing"],
    queryFn: () => getDispute(disputeId!),
    enabled: !!disputeId && (options?.enabled ?? true),
  });
}

export function useCreateDisputeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DisputeCreateRequest) => createDispute(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.disputes.all() });
    },
  });
}

export function useApproveDisputeSettlementMutation(disputeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SettlementApproveRequest) => approveDisputeSettlement(disputeId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.disputes.detail(disputeId) });
      qc.invalidateQueries({ queryKey: queryKeys.disputes.all() });
    },
  });
}

export function useProposeDisputeSettlementMutation(disputeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SettlementProposalRequest) => proposeDisputeSettlement(disputeId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.disputes.detail(disputeId) });
      qc.invalidateQueries({ queryKey: queryKeys.disputes.all() });
    },
  });
}
