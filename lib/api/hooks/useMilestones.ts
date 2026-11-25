"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fundMilestone,
  getMilestone,
  listMilestoneSubmissions,
  refundMilestone,
  releaseMilestone,
  reviewMilestoneDeliverable,
  startMilestone,
  submitMilestoneDeliverable,
} from "@/lib/api/services/milestones";
import { queryKeys } from "@/lib/api/query-keys";
import type { DeliverableReviewRequestRequest, DeliverableSubmitRequestRequest, MilestoneFundRequestRequest, MilestoneTxRequestRequest } from "@/lib/api/types";

export function useMilestoneQuery(milestoneId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: milestoneId ? queryKeys.milestones.detail(milestoneId) : ["milestones", "detail", "missing"],
    queryFn: () => getMilestone(milestoneId!),
    enabled: !!milestoneId && (options?.enabled ?? true),
  });
}

export function useMilestoneSubmissionsQuery(milestoneId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: milestoneId ? queryKeys.milestones.submissions(milestoneId) : ["milestones", "missing", "submissions"],
    queryFn: () => listMilestoneSubmissions(milestoneId!),
    enabled: !!milestoneId && (options?.enabled ?? true),
  });
}

export function useFundMilestoneMutation(milestoneId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MilestoneFundRequestRequest) => fundMilestone(milestoneId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.milestones.detail(milestoneId) });
    },
  });
}

export function useRefundMilestoneMutation(milestoneId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MilestoneTxRequestRequest) => refundMilestone(milestoneId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.milestones.detail(milestoneId) });
    },
  });
}

export function useReleaseMilestoneMutation(milestoneId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MilestoneTxRequestRequest) => releaseMilestone(milestoneId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.milestones.detail(milestoneId) });
    },
  });
}

export function useReviewMilestoneDeliverableMutation(milestoneId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeliverableReviewRequestRequest) => reviewMilestoneDeliverable(milestoneId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.milestones.detail(milestoneId) });
      qc.invalidateQueries({ queryKey: queryKeys.milestones.submissions(milestoneId) });
    },
  });
}

export function useStartMilestoneMutation(milestoneId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => startMilestone(milestoneId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.milestones.detail(milestoneId) });
    },
  });
}

export function useSubmitMilestoneDeliverableMutation(milestoneId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeliverableSubmitRequestRequest) => submitMilestoneDeliverable(milestoneId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.milestones.detail(milestoneId) });
      qc.invalidateQueries({ queryKey: queryKeys.milestones.submissions(milestoneId) });
    },
  });
}
