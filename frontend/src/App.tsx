import { useState } from "react";
import { AdminLogin } from "./components/AdminLogin";
import { CreateRequestForm } from "./components/CreateRequestForm";
import { RequestFiltersBar } from "./components/RequestFiltersBar";
import { RequestTable } from "./components/RequestTable";
import { useAuth, useRequestActions, useRequests } from "./hooks/useRequests";
import type { RequestFilters } from "./types/request";

const defaultFilters: RequestFilters = {
  sort_by: "created_at",
  sort_order: "desc",
  page: 1,
  page_size: 10,
};

function App() {
  const [filters, setFilters] = useState<RequestFilters>(defaultFilters);
  const { token, isAdmin, login, logout } = useAuth();
  const { data, loading, error, reload } = useRequests(filters);
  const { create, updateStatus, remove, actionError, pendingId, clearActionError } = useRequestActions(
    token,
    reload,
  );

  const patchFilters = (patch: Partial<RequestFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  };

  return (
    <div className="app">
      <header>
        <h1>Заявки</h1>
        <AdminLogin isAdmin={isAdmin} onLogin={login} onLogout={logout} />
      </header>

      <CreateRequestForm
        disabled={pendingId === -1}
        onSubmit={async (payload) => {
          clearActionError();
          await create(payload);
        }}
      />

      <RequestFiltersBar filters={filters} onChange={patchFilters} />

      {actionError && <p className="error banner">{actionError}</p>}
      {error && <p className="error banner">{error}</p>}

      {loading && <p className="state">Загрузка...</p>}

      {!loading && !error && data && data.items.length === 0 && (
        <p className="state">Заявок нет</p>
      )}

      {!loading && !error && data && data.items.length > 0 && (
        <>
          <RequestTable
            items={data.items}
            isAdmin={isAdmin}
            pendingId={pendingId}
            onStatusChange={(id, status) => {
              clearActionError();
              void updateStatus(id, status);
            }}
            onDelete={(id) => {
              clearActionError();
              void remove(id);
            }}
          />

          <div className="pagination">
            <button
              type="button"
              disabled={filters.page <= 1}
              onClick={() => patchFilters({ page: filters.page - 1 })}
            >
              Назад
            </button>
            <span>
              Страница {data.page} из {data.pages || 1} ({data.total} всего)
            </span>
            <button
              type="button"
              disabled={data.pages === 0 || filters.page >= data.pages}
              onClick={() => patchFilters({ page: filters.page + 1 })}
            >
              Вперёд
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
