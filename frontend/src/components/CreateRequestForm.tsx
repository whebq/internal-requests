import { useState, type FormEvent } from "react";
import type { RequestPriority } from "../types/request";
import { PRIORITY_LABELS } from "../utils/labels";

interface CreateRequestFormProps {
  onSubmit: (payload: { title: string; description: string; priority: RequestPriority }) => Promise<void>;
  disabled: boolean;
}

export function CreateRequestForm({ onSubmit, disabled }: CreateRequestFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<RequestPriority>("normal");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3) {
      setLocalError("Заголовок: минимум 3 символа");
      return;
    }
    if (trimmedTitle.length > 120) {
      setLocalError("Заголовок: максимум 120 символов");
      return;
    }
    if (description.length > 1000) {
      setLocalError("Описание: максимум 1000 символов");
      return;
    }

    await onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      priority,
    });

    setTitle("");
    setDescription("");
    setPriority("normal");
  };

  return (
    <form className="panel" onSubmit={(event) => void handleSubmit(event)}>
      <h2>Новая заявка</h2>
      <label>
        Заголовок
        <input value={title} onChange={(event) => setTitle(event.target.value)} disabled={disabled} required />
      </label>
      <label>
        Описание
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={disabled}
          rows={3}
        />
      </label>
      <label>
        Приоритет
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as RequestPriority)}
          disabled={disabled}
        >
          {(Object.keys(PRIORITY_LABELS) as RequestPriority[]).map((value) => (
            <option key={value} value={value}>
              {PRIORITY_LABELS[value]}
            </option>
          ))}
        </select>
      </label>
      {localError && <p className="error">{localError}</p>}
      <button type="submit" disabled={disabled}>
        Создать
      </button>
    </form>
  );
}
