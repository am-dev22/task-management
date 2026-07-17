# Extensible Task-Management Platform

A full-stack task-management application where each task follows a type-specific
lifecycle of ascending integer statuses. The core design goal is **extensibility**:
adding a new task type requires a single new strategy file on the server and
**no changes to existing server logic or to the client at all**.

## Tech Stack

| Layer     | Technology                                             |
| --------- | ------------------------------------------------------ |
| Backend   | Node.js, Express, TypeScript, TypeORM                  |
| Database  | PostgreSQL                                             |
| Frontend  | React 19, TypeScript, Vite, Axios                      |
| Tooling   | Docker & Docker Compose                                |

## Architecture

### Type-specific behaviour: the Strategy pattern

General workflow rules (see below) apply to every task and live in
`TaskService`. Type-specific behaviour lives in a **strategy** per task type
(`src/strategies/`). Each strategy declares a purely *declarative* schema of its
statuses and the custom fields required to enter each one:

```ts
export class ProcurementStrategy extends BaseTaskStrategy {
    readonly taskType = "procurement";
    readonly statuses = [
        { status: 1, name: "Created", requiredFields: [] },
        { status: 2, name: "Supplier offers received",
          requiredFields: [{ key: "priceQuotes", label: "price-quote strings",
                             type: "string-list", itemCount: 2 }] },
        { status: 3, name: "Purchase completed",
          requiredFields: [{ key: "receipt", label: "a receipt", type: "text" }] },
    ];
}
```

`BaseTaskStrategy` derives the maximum status, status names, and per-transition
validation from that declaration, so a strategy contains no imperative
validation code. There is **no `switch (type)` anywhere** in the controllers or
service — every branch resolves through `strategyRegistry.get(task.type)`.

### Typed fields

Fields are not limited to strings. Each `FieldSpec` declares a `type`, and both
the server validator and the client input control are driven by it:

| `type`        | Server validation                     | Client control          |
| ------------- | ------------------------------------- | ----------------------- |
| `text`        | non-empty string                      | text input              |
| `number`      | finite number (optional `min`)        | number input            |
| `date`        | ISO `YYYY-MM-DD`, real calendar date  | date picker             |
| `boolean`     | boolean                               | checkbox                |
| `select`      | one of `options`                      | dropdown                |
| `string-list` | array of ≥ `itemCount` strings        | repeated text inputs    |

Because the field vocabulary is typed, adding a task type that needs a real
`number` or `date` (e.g. the built-in **HR** type: `budget` = number,
`department` = select, `startDate` = date, `remote` = boolean) requires **no
changes to shared code** — only its own strategy file.

### One schema, two consumers

The same declaration is exposed to the client at `GET /api/tasks/types`. The
React app builds its "create task" options and its per-status input forms
entirely from this metadata. As a result:

> **Adding a task type** = create one `*Strategy` file and register it in
> `StrategyRegistry`. The server validation, the API metadata, and the client
> forms all update automatically. No other file changes.

### Custom field storage

Type-specific fields are stored in a single PostgreSQL **`jsonb`** column
(`Task.customData`). `jsonb` round-trips strings, numbers, and arrays natively,
avoiding sparse per-type columns while keeping the data queryable.

## Core Workflow Rules

1. A task is assigned to exactly one user at any moment.
2. A task is either open or closed; **closed tasks are immutable**.
3. Status is tracked by ascending integers (1, 2, 3…).
4. Forward moves must be sequential (no skipping).
5. Backward moves are always allowed.
6. A task may be closed only at its final status.
7. Every status change validates type-specific data and records the next
   assigned user.

All rules are enforced server-side in `TaskService`.

## Running the Project

### Option A — Docker Compose (recommended)

Requires Docker Desktop. From this directory:

```bash
docker compose up --build
```

This starts three containers: PostgreSQL, the API, and the client. On first run
the API waits for the database, creates the schema, and seeds demo users and
tasks.

- Client: <http://localhost:5173>
- API: <http://localhost:3000/api>

Stop with `docker compose down` (add `-v` to also drop the database volume).

### Option B — Run locally

Requires Node.js 20+ and a running PostgreSQL instance.

**1. Database** — create a database and note its connection details. A quick
option using Docker:

```bash
docker run -d --name tm-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=taskmanagement -p 5432:5432 postgres:16-alpine
```

**2. API**

```bash
cd TaskManagement.API
cp .env.example .env          # adjust DB_* values if needed
npm install
npm run dev                   # http://localhost:3000
```

The schema is created automatically (TypeORM `synchronize`) and demo data is
seeded on first run.

**3. Client**

```bash
cd taskmanagement.client
npm install
npm run dev                   # http://localhost:5173
```

The client defaults to `http://localhost:3000/api`; override with `VITE_API_URL`
(see `.env.example`).

## API Reference

| Method | Endpoint                     | Description                                   |
| ------ | ---------------------------- | --------------------------------------------- |
| GET    | `/api/health`                | Liveness probe                                |
| GET    | `/api/tasks/types`           | Task-type metadata (statuses + field schema)  |
| GET    | `/api/users`                 | List seeded users                             |
| GET    | `/api/users/:userId/tasks`   | Tasks assigned to a user                      |
| POST   | `/api/tasks`                 | Create a task (`title`, `type`, `assignedUserId`) |
| PUT    | `/api/tasks/:id/status`      | Change status (`targetStatus`, `customData`, `nextAssignedUserId`) |
| PUT    | `/api/tasks/:id/close`       | Close a task at its final status              |

Errors return a JSON `{ "error": "..." }` body with a meaningful status code:
`400` (validation), `404` (not found), `409` (state conflict), `500`
(unexpected).

## Project Structure

```
ProjectS/
├─ docker-compose.yml
├─ TaskManagement.API/          # Express + TypeORM API
│  ├─ Dockerfile
│  └─ src/
│     ├─ controllers/           # thin HTTP layer
│     ├─ services/              # workflow rules
│     ├─ strategies/            # one file per task type + declarative schema
│     ├─ middleware/            # async wrapper + central error handler
│     ├─ entities/              # TypeORM entities (User, Task)
│     ├─ database/              # connection + seeding
│     └─ errors.ts             # typed AppError hierarchy → HTTP status codes
└─ taskmanagement.client/       # React + Vite client
   ├─ Dockerfile
   └─ src/
      ├─ services/api.ts        # single Axios-based API layer
      └─ components/            # UserSwitcher, CreateTaskForm, TaskItem
```

## Scope & Limitations

This is an assignment/demo project. Deliberate simplifications:

- **No authentication** — the active user is chosen from a dropdown (a hardcoded
  user was acceptable per the assignment).
- **Schema via `synchronize`** — TypeORM auto-syncs the schema from the entities
  on startup, which is convenient for a demo. A production system would use
  generated migrations instead.
- **No automated tests** — not part of the required deliverables.
