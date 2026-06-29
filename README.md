# Internal Requests

Учёт внутренних заявок. Backend на FastAPI, frontend на React.

## Стек

Backend: Python, FastAPI, SQLAlchemy, SQLite  
Frontend: React, TypeScript, Vite

## Структура

```
internal-requests/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
│   ├── tests/
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── hooks/
        └── types/
```

## Заявка

| Поле | Описание |
|------|----------|
| id | идентификатор |
| title | обязательное, от 3 до 120 символов |
| description | опционально, до 1000 символов |
| status | `new`, `in_progress`, `done` |
| priority | `low`, `normal`, `high` |
| created_at | UTC |
| updated_at | UTC |

## API

| Метод | Путь | Что делает |
|-------|------|------------|
| POST | `/api/auth/login` | логин admin |
| POST | `/api/requests` | создать заявку |
| GET | `/api/requests` | список |
| PATCH | `/api/requests/{id}/status` | сменить статус |
| DELETE | `/api/requests/{id}` | удалить (нужен токен admin) |

Параметры для GET `/api/requests`: `status`, `priority`, `search`, `sort_by` (`created_at` / `priority`), `sort_order` (`asc` / `desc`), `page`, `page_size`.

## Правила

- admin / admin, нужен только для удаления
- заявку в `done` нельзя менять и удалять
- из `done` обратно статус не меняется
- ошибки приходят с `detail` и кодом 400/401/404

## Запуск

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Документация: http://localhost:8000/docs

Тесты:

```bash
cd backend
source .venv/bin/activate
pytest
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:5173

Если API не на localhost:8000, задай `VITE_API_URL` (по умолчанию `http://localhost:8000/api`).

## UI

Один экран: форма создания, таблица, поиск, фильтры, сортировка, смена статуса, удаление для admin, загрузка / пустой список / ошибки.
