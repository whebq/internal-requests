# Internal Requests

Приложение для учёта внутренних заявок.

## Стек

- Backend: Python, FastAPI, SQLAlchemy, SQLite
- Frontend: React, TypeScript, Vite

## Структура

```
internal-requests/
├── backend/
│   ├── app/
│   │   ├── main.py              # точка входа FastAPI, CORS, роутеры
│   │   ├── config.py            # настройки (БД, admin, JWT)
│   │   ├── database.py          # engine, сессия, Base
│   │   ├── models.py            # модель Request, enum status/priority
│   │   ├── routers/
│   │   │   ├── auth.py          # POST /api/auth/login
│   │   │   └── requests.py      # CRUD-операции с заявками
│   │   ├── schemas/             # Pydantic-схемы запросов/ответов
│   │   └── services/
│   │       ├── auth.py          # проверка admin, JWT
│   │       └── request.py       # бизнес-логика и запросы к БД
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/client.ts        # HTTP-клиент к backend
        ├── hooks/useRequests.ts # загрузка списка, auth, действия
        ├── components/          # форма, фильтры, таблица, вход admin
        └── types/request.ts     # типы данных
```

## Модель данных

| Поле        | Тип / правило                          |
|-------------|----------------------------------------|
| id          | int, PK                                |
| title       | string, 3–120 символов, обязательное   |
| description | string, до 1000 символов, необязательное |
| status      | `new`, `in_progress`, `done`           |
| priority    | `low`, `normal`, `high`                |
| created_at  | datetime UTC                           |
| updated_at  | datetime UTC                           |

## API

| Метод  | Путь                         | Описание                              |
|--------|------------------------------|---------------------------------------|
| POST   | `/api/auth/login`            | вход admin, возвращает JWT            |
| POST   | `/api/requests`              | создание заявки                       |
| GET    | `/api/requests`              | список с фильтрами, поиском, сортировкой, пагинацией |
| PATCH  | `/api/requests/{id}/status`  | смена статуса                         |
| DELETE | `/api/requests/{id}`         | удаление (только admin, Bearer token) |

Query-параметры GET `/api/requests`:

- `status` — фильтр по статусу
- `priority` — фильтр по приоритету
- `search` — поиск по title и description (ILIKE)
- `sort_by` — `created_at` или `priority`
- `sort_order` — `asc` или `desc`
- `page` — номер страницы (с 1)
- `page_size` — размер страницы (1–100)

## Бизнес правила

- Админ: `admin` / `admin`. Нужен только для удаления заявок.
- Заявка в статусе `done` не редактируется и не удаляется.
- Перевод из `done` в другой статус запрещён.
- При нарушении правила API возвращает HTTP 400/401/404 с полем `detail`.

## Запуск

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Swagger: http://localhost:8000/docs

### Тесты

```bash
cd backend
source .venv/bin/activate
pytest
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Приложение: http://localhost:5173

Переменная `VITE_API_URL` (необязательная) — базовый URL API. По умолчанию `http://localhost:8000/api`.

## Frontend

Один экран:

- форма создания заявки;
- поиск, фильтры по status/priority, сортировка;
- таблица заявок со сменой статуса;
- удаление (после входа admin);
- состояния загрузки, пустого списка, ошибок API.

## Ручная проверка

Запустите backend и frontend (см. раздел «Запуск»). Откройте http://localhost:5173.

### 1. Создание заявки

1. В блоке «Новая заявка» заполните заголовок (минимум 3 символа).
2. При необходимости — описание и приоритет.
3. Нажмите «Создать».
4. Заявка появится в таблице со статусом «Новая».

### 2. Список, поиск, фильтры, сортировка

1. Создайте 2–3 заявки с разными статусами и приоритетами (приоритет задаётся при создании).
2. В строке «Поиск» введите часть заголовка — список обновится.
3. Выберите фильтр «Статус» или «Приоритет».
4. Смените «Сортировка» (дата / приоритет) и «Порядок».
5. Если заявок больше 10 — переключайте страницы кнопками «Назад» / «Вперёд».

### 3. Смена статуса

1. В колонке «Действия» выберите новый статус в выпадающем списке.
2. Доступные переходы: `new` → `in_progress` / `done`, `in_progress` → `done`.
3. Для заявки в статусе `done` смена статуса недоступна.

### 4. Вход администратора и удаление

1. В правом верхнем углу — блок «Вход администратора».
2. Логин: `admin`, пароль: `admin`.
3. После входа появится кнопка «Удалить» у заявок не в статусе `done`.
4. Нажмите «Удалить» — заявка исчезнет из списка.
5. Без входа кнопки удаления нет. Заявку в статусе `done` удалить нельзя.

### 5. Проверка ошибок

1. Переведите заявку в `done` — попытка сменить статус или удалить вернёт ошибку в интерфейсе.
2. Выйдите из admin и попробуйте удалить через API (Swagger http://localhost:8000/docs) — ответ 401.

### Проверка через Swagger

1. Откройте http://localhost:8000/docs.
2. `POST /api/requests` — создать заявку (тело: `title`, `description`, `priority`).
3. `GET /api/requests` — список с query-параметрами.
4. `POST /api/auth/login` — получить токен (`admin` / `admin`).
5. `DELETE /api/requests/{id}` — удаление с заголовком `Authorization: Bearer <token>`.
