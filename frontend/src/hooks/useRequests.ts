import { useCallback, useEffect, useState } from "react";
import { api, ApiClientError } from "../api/client";
import type {
  RequestCreatePayload,
  RequestFilters,
  RequestItem,
  RequestListResponse,
  RequestStatus,
} from "../types/request";

const TOKEN_KEY = "admin_token";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  const login = async (username: string, password: string) => {
    const response = await api.login(username, password);
    localStorage.setItem(TOKEN_KEY, response.access_token);
    setToken(response.access_token);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  return { token, isAdmin: Boolean(token), login, logout };
}

export function useRequests(filters: RequestFilters) {
  const [data, setData] = useState<RequestListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("sort_by", filters.sort_by);
      params.set("sort_order", filters.sort_order);
      params.set("page", String(filters.page));
      params.set("page_size", String(filters.page_size));
      if (filters.status) params.set("status", filters.status);
      if (filters.priority) params.set("priority", filters.priority);
      if (filters.search?.trim()) params.set("search", filters.search.trim());

      const response = await api.getRequests(params);
      setData(response);
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Не удалось загрузить заявки";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}

export function useRequestActions(token: string | null, onSuccess: () => void) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const run = async (id: number, action: () => Promise<RequestItem | void>) => {
    setPendingId(id);
    setActionError(null);
    try {
      await action();
      onSuccess();
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Операция не выполнена";
      setActionError(message);
    } finally {
      setPendingId(null);
    }
  };

  const create = (payload: RequestCreatePayload) =>
    run(-1, () => api.createRequest(payload));

  const updateStatus = (id: number, status: RequestStatus) =>
    run(id, () => api.updateStatus(id, status));

  const remove = (id: number) => {
    if (!token) {
      setActionError("Требуется вход администратора");
      return Promise.resolve();
    }
    return run(id, () => api.deleteRequest(id, token));
  };

  return { create, updateStatus, remove, actionError, pendingId, clearActionError: () => setActionError(null) };
}
