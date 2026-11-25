import { apiClient } from "@/lib/api/client";
import type {
  DeliverableReviewRequestRequest,
  DeliverableSubmission,
  DeliverableSubmitRequestRequest,
  Milestone,
  MilestoneFundRequestRequest,
  MilestoneTxRequestRequest,
  PaginatedDeliverableSubmissionList,
} from "@/lib/api/types";

export async function getMilestone(milestoneId: string): Promise<Milestone> {
  const { data } = await apiClient.get<Milestone>(`/api/v1/milestones/${milestoneId}/`);
  return data;
}

export async function fundMilestone(milestoneId: string, payload: MilestoneFundRequestRequest): Promise<Milestone> {
  const { data } = await apiClient.post<Milestone>(`/api/v1/milestones/${milestoneId}/fund/`, payload);
  return data;
}

export async function refundMilestone(milestoneId: string, payload: MilestoneTxRequestRequest): Promise<Milestone> {
  const { data } = await apiClient.post<Milestone>(`/api/v1/milestones/${milestoneId}/refund/`, payload);
  return data;
}

export async function releaseMilestone(milestoneId: string, payload: MilestoneTxRequestRequest): Promise<Milestone> {
  const { data } = await apiClient.post<Milestone>(`/api/v1/milestones/${milestoneId}/release/`, payload);
  return data;
}

export async function reviewMilestoneDeliverable(
  milestoneId: string,
  payload: DeliverableReviewRequestRequest,
): Promise<DeliverableSubmission | Milestone> {
  const { data } = await apiClient.post<DeliverableSubmission | Milestone>(`/api/v1/milestones/${milestoneId}/review/`, payload);
  return data;
}

export async function startMilestone(milestoneId: string): Promise<Milestone> {
  const { data } = await apiClient.post<Milestone>(`/api/v1/milestones/${milestoneId}/start/`);
  return data;
}

export async function listMilestoneSubmissions(milestoneId: string): Promise<PaginatedDeliverableSubmissionList | DeliverableSubmission[]> {
  const { data } = await apiClient.get<PaginatedDeliverableSubmissionList | DeliverableSubmission[]>(
    `/api/v1/milestones/${milestoneId}/submissions/`,
  );
  return data;
}

export async function submitMilestoneDeliverable(
  milestoneId: string,
  payload: DeliverableSubmitRequestRequest,
): Promise<DeliverableSubmission> {
  const { data } = await apiClient.post<DeliverableSubmission>(`/api/v1/milestones/${milestoneId}/submit/`, payload);
  return data;
}
