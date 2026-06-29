export type RequestStatus = "new" | "in_progress" | "done";
export type RequestPriority = "low" | "normal" | "high";
export type SortField = "created_at" | "priority";
export type SortOrder = "asc" | "desc";

export interface RequestItem {
  id: number;
  title: string;
  description: string | null;
  status: RequestStatus;
  priority: RequestPriority;
  created_at: string;
  updated_at: string;
}

export interface RequestListResponse {
  items: RequestItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface RequestCreatePayload {
  title: string;
  description?: string | null;
  priority: RequestPriority;
}

export interface RequestFilters {
  status?: RequestStatus;
  priority?: RequestPriority;
  search?: string;
  sort_by: SortField;
  sort_order: SortOrder;
  page: number;
  page_size: number;
}

export interface ApiError {
  detail: string;
}
