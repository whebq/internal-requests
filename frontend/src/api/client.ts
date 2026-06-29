import type {
  RequestCreatePayload,
  RequestItem,
  RequestListResponse,
  RequestStatus,
} from "../types/request";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data.detail === "string") {
      return data.detail;
    }
    return "Ошибка запроса";
  } catch {
    return "Ошибка запроса";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new ApiClientError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  login(username: string, password: string) {
    return request<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  getRequests(params: URLSearchParams) {
    return request<RequestListResponse>(`/requests?${params.toString()}`);
  },

  createRequest(payload: RequestCreatePayload) {
    return request<RequestItem>("/requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateStatus(id: number, status: RequestStatus) {
    return request<RequestItem>(`/requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  deleteRequest(id: number, token: string) {
    return request<void>(`/requests/${id}`, { method: "DELETE" }, token);
  },
};
