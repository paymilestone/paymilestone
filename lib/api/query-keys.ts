export const queryKeys = {
  system: {
    health: () => ["system", "health"] as const,
  },
  dashboard: {
    summary: (wallet?: string) => ["dashboard", "summary", wallet ?? "current"] as const,
  },
  projects: {
    all: () => ["projects"] as const,
    list: (params?: Record<string, unknown>) => ["projects", "list", params ?? {}] as const,
    detail: (projectId: string) => ["projects", "detail", projectId] as const,
    invite: (inviteToken: string) => ["projects", "invite", inviteToken] as const,
    revisions: (projectId: string) => ["projects", projectId, "revisions"] as const,
    milestones: (projectId: string) => ["projects", projectId, "milestones"] as const,
  },
  milestones: {
    detail: (milestoneId: string) => ["milestones", "detail", milestoneId] as const,
    submissions: (milestoneId: string) => ["milestones", milestoneId, "submissions"] as const,
  },
  disputes: {
    all: () => ["disputes"] as const,
    list: (params?: Record<string, unknown>) => ["disputes", "list", params ?? {}] as const,
    detail: (disputeId: string) => ["disputes", "detail", disputeId] as const,
  },
  notifications: {
    list: (params?: Record<string, unknown>) => ["notifications", "list", params ?? {}] as const,
  },
  transactions: {
    list: (params?: Record<string, unknown>) => ["transactions", "list", params ?? {}] as const,
  },
} as const;
