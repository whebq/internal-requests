import type { RequestItem, RequestStatus } from "../types/request";
import { formatDate, PRIORITY_LABELS, STATUS_LABELS } from "../utils/labels";

interface RequestTableProps {
  items: RequestItem[];
  isAdmin: boolean;
  pendingId: number | null;
  onStatusChange: (id: number, status: RequestStatus) => void;
  onDelete: (id: number) => void;
}

const NEXT_STATUSES: Record<RequestStatus, RequestStatus[]> = {
  new: ["in_progress", "done"],
  in_progress: ["done"],
  done: [],
};

export function RequestTable({
  items,
  isAdmin,
  pendingId,
  onStatusChange,
  onDelete,
}: RequestTableProps) {
  return (
    <div className="panel table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Заголовок</th>
            <th>Описание</th>
            <th>Статус</th>
            <th>Приоритет</th>
            <th>Создана</th>
            <th>Обновлена</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isDone = item.status === "done";
            const transitions = NEXT_STATUSES[item.status];

            return (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>{item.description ?? "—"}</td>
                <td>{STATUS_LABELS[item.status]}</td>
                <td>{PRIORITY_LABELS[item.priority]}</td>
                <td>{formatDate(item.created_at)}</td>
                <td>{formatDate(item.updated_at)}</td>
                <td className="actions">
                  {!isDone && (
                    <select
                      value={item.status}
                      disabled={pendingId === item.id}
                      onChange={(event) =>
                        onStatusChange(item.id, event.target.value as RequestStatus)
                      }
                    >
                      <option value={item.status}>{STATUS_LABELS[item.status]}</option>
                      {transitions.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  )}
                  {isDone && <span>—</span>}
                  {isAdmin && !isDone && (
                    <button
                      type="button"
                      disabled={pendingId === item.id}
                      onClick={() => onDelete(item.id)}
                    >
                      Удалить
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
