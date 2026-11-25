"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/api/services/notifications";
import { queryKeys } from "@/lib/api/query-keys";
import type { NotificationsListParams } from "@/lib/api/types";

export function useNotificationsQuery(params?: NotificationsListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params as Record<string, unknown> | undefined),
    queryFn: () => listNotifications(params),
    ...options,
  });
}

export function useMarkNotificationReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
