import { apiClient } from "@/lib/api/client";
import type {
  AgreementApproveRequestRequest,
  AgreementRevision,
  Milestone,
  PaginatedAgreementRevisionList,
  PaginatedMilestoneList,
  PatchedProjectUpdateRequest,
  Project,
  ProjectCreateRequest,
  ProjectsListParams,
} from "@/lib/api/types";

type ProjectsResponse =
  | Project[]
  | { results?: Project[]; count?: number; next?: string | null; previous?: string | null };

export async function listProjects(params?: ProjectsListParams): Promise<Project[]> {
  const { data } = await apiClient.get<ProjectsResponse>("/api/v1/projects/", { params });
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as { results?: Project[] }).results)) {
    return (data as { results: Project[] }).results;
  }
  return [];
}

export async function createProject(payload: ProjectCreateRequest): Promise<Project> {
  const { data } = await apiClient.post<Project>("/api/v1/projects/", payload);
  return data;
}

export async function getProjectByInviteToken(inviteToken: string): Promise<Project> {
  const { data } = await apiClient.get<Project>(`/api/v1/projects/invite/${inviteToken}/`);
  return data;
}

export async function getProject(projectId: string): Promise<Project> {
  const { data } = await apiClient.get<Project>(`/api/v1/projects/${projectId}/`);
  return data;
}

export async function updateProject(projectId: string, payload: PatchedProjectUpdateRequest): Promise<Project> {
  const { data } = await apiClient.patch<Project>(`/api/v1/projects/${projectId}/`, payload);
  return data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/api/v1/projects/${projectId}/`);
}

export async function approveProject(projectId: string, payload: AgreementApproveRequestRequest): Promise<Project> {
  const { data } = await apiClient.post<Project>(`/api/v1/projects/${projectId}/approve/`, payload);
  return data;
}

export async function cancelProject(projectId: string): Promise<Project> {
  const { data } = await apiClient.post<Project>(`/api/v1/projects/${projectId}/cancel/`);
  return data;
}

export async function sendProjectForApproval(projectId: string): Promise<Project> {
  const { data } = await apiClient.post<Project>(`/api/v1/projects/${projectId}/send-for-approval/`);
  return data;
}

export async function listProjectMilestones(projectId: string): Promise<PaginatedMilestoneList | Milestone[]> {
  const { data } = await apiClient.get<PaginatedMilestoneList | Milestone[]>(`/api/v1/projects/${projectId}/milestones/`);
  return data;
}

export async function listProjectRevisions(projectId: string): Promise<PaginatedAgreementRevisionList | AgreementRevision[]> {
  const { data } = await apiClient.get<PaginatedAgreementRevisionList | AgreementRevision[]>(`/api/v1/projects/${projectId}/revisions/`);
  return data;
}
