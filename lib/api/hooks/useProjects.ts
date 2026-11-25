"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveProject,
  cancelProject,
  createProject,
  deleteProject,
  getProject,
  getProjectByInviteToken,
  listProjectMilestones,
  listProjectRevisions,
  listProjects,
  sendProjectForApproval,
  updateProject,
} from "@/lib/api/services/projects";
import { queryKeys } from "@/lib/api/query-keys";
import type { AgreementApproveRequestRequest, PatchedProjectUpdateRequest, ProjectCreateRequest, ProjectsListParams } from "@/lib/api/types";

export function useProjectsQuery(params?: ProjectsListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.projects.list(params as Record<string, unknown> | undefined),
    queryFn: () => listProjects(params),
    ...options,
  });
}

export function useProjectQuery(projectId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: projectId ? queryKeys.projects.detail(projectId) : ["projects", "detail", "missing"],
    queryFn: () => getProject(projectId!),
    enabled: !!projectId && (options?.enabled ?? true),
  });
}

export function useProjectByInviteTokenQuery(inviteToken?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: inviteToken ? queryKeys.projects.invite(inviteToken) : ["projects", "invite", "missing"],
    queryFn: () => getProjectByInviteToken(inviteToken!),
    enabled: !!inviteToken && (options?.enabled ?? true),
  });
}

export function useProjectMilestonesQuery(projectId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: projectId ? queryKeys.projects.milestones(projectId) : ["projects", "missing", "milestones"],
    queryFn: () => listProjectMilestones(projectId!),
    enabled: !!projectId && (options?.enabled ?? true),
  });
}

export function useProjectRevisionsQuery(projectId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: projectId ? queryKeys.projects.revisions(projectId) : ["projects", "missing", "revisions"],
    queryFn: () => listProjectRevisions(projectId!),
    enabled: !!projectId && (options?.enabled ?? true),
  });
}

export function useCreateProjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectCreateRequest) => createProject(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
}

export function useUpdateProjectMutation(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PatchedProjectUpdateRequest) => updateProject(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
}

export function useDeleteProjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: (_data, projectId) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all() });
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
  });
}

export function useApproveProjectMutation(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AgreementApproveRequestRequest) => approveProject(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
}

export function useCancelProjectMutation(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cancelProject(projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
}

export function useSendProjectForApprovalMutation(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => sendProjectForApproval(projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      qc.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
}
