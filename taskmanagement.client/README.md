# taskmanagement.client

React + TypeScript + Vite client for the Extensible Task-Management Platform.

The UI is **data-driven**: task-type options and the per-status input forms are
built entirely from the `GET /api/tasks/types` metadata, so new task types appear
without any client changes.

See the [root README](../README.md) for the full picture and Docker instructions.

## Local development

```bash
npm install
npm run dev               # http://localhost:5173
```

The client calls `http://localhost:3000/api` by default. Override it by creating
a `.env` file (see `.env.example`):

```
VITE_API_URL=http://localhost:3000/api
```

## Scripts

| Script            | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the Vite dev server          |
| `npm run build`   | Type-check and build for production |
| `npm run preview` | Preview the production build        |
| `npm run lint`    | Run ESLint                          |

## Structure

- `src/services/api.ts` — single Axios-based API layer.
- `src/components/` — `UserSwitcher`, `CreateTaskForm`, `TaskItem`.
- `src/types.ts` — shared types, mirroring the API's metadata schema.
