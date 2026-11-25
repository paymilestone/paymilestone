import { apiClient } from "@/lib/api/client";
import type { Notification, NotificationsListParams } from "@/lib/api/types";

type NotificationsResponse =
  | Notification[]
  | { results?: Notification[]; count?: number; next?: string | null; previous?: string | null };

export async function listNotifications(params?: NotificationsListParams): Promise<Notification[]> {
  const { data } = await apiClient.get<NotificationsResponse>("/api/v1/notifications/", { params });
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as { results?: Notification[] }).results)) {
    return (data as { results: Notification[] }).results;
  }
  return [];
}

export async function markAllNotificationsRead(): Promise<{ updated?: number } | Record<string, unknown>> {
  const { data } = await apiClient.post<{ updated?: number } | Record<string, unknown>>("/api/v1/notifications/read-all/");
  return data;
}

export async function markNotificationRead(notificationId: string): Promise<Notification | Record<string, unknown>> {
  const { data } = await apiClient.post<Notification | Record<string, unknown>>(`/api/v1/notifications/${notificationId}/read/`);
  return data;
}
