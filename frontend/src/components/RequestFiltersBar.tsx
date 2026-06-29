import type { RequestFilters, RequestPriority, RequestStatus, SortField, SortOrder } from "../types/request";
import { PRIORITY_LABELS, STATUS_LABELS } from "../utils/labels";

interface RequestFiltersBarProps {
  filters: RequestFilters;
  onChange: (patch: Partial<RequestFilters>) => void;
}

export function RequestFiltersBar({ filters, onChange }: RequestFiltersBarProps) {
  return (
    <div className="panel filters">
      <label>
        Поиск
        <input
          value={filters.search ?? ""}
          onChange={(event) => onChange({ search: event.target.value, page: 1 })}
          placeholder="Заголовок или описание"
        />
      </label>
      <label>
        Статус
        <select
          value={filters.status ?? ""}
          onChange={(event) =>
            onChange({
              status: (event.target.value || undefined) as RequestStatus | undefined,
              page: 1,
            })
          }
        >
          <option value="">Все</option>
          {(Object.keys(STATUS_LABELS) as RequestStatus[]).map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Приоритет
        <select
          value={filters.priority ?? ""}
          onChange={(event) =>
            onChange({
              priority: (event.target.value || undefined) as RequestPriority | undefined,
              page: 1,
            })
          }
        >
          <option value="">Все</option>
          {(Object.keys(PRIORITY_LABELS) as RequestPriority[]).map((value) => (
            <option key={value} value={value}>
              {PRIORITY_LABELS[value]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Сортировка
        <select
          value={filters.sort_by}
          onChange={(event) => onChange({ sort_by: event.target.value as SortField, page: 1 })}
        >
          <option value="created_at">Дата создания</option>
          <option value="priority">Приоритет</option>
        </select>
      </label>
      <label>
        Порядок
        <select
          value={filters.sort_order}
          onChange={(event) => onChange({ sort_order: event.target.value as SortOrder, page: 1 })}
        >
          <option value="desc">По убыванию</option>
          <option value="asc">По возрастанию</option>
        </select>
      </label>
    </div>
  );
}
