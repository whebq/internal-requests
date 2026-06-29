import type { RequestPriority, RequestStatus } from "../types/request";

export const STATUS_LABELS: Record<RequestStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Готово",
};

export const PRIORITY_LABELS: Record<RequestPriority, string> = {
  low: "Низкий",
  normal: "Обычный",
  high: "Высокий",
};

export function formatDate(value: string): string {
  return new Date(value).toLocaleString("ru-RU", { timeZone: "UTC" });
}
