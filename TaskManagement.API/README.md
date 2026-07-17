# TaskManagement.API

REST API for the Extensible Task-Management Platform — Node.js, Express,
TypeScript, and TypeORM over PostgreSQL.

See the [root README](../README.md) for architecture, the full API reference,
and how to run the whole stack with Docker Compose.

## Local development

```bash
cp .env.example .env      # configure DB_* to point at your PostgreSQL
npm install
npm run dev               # tsx watch, http://localhost:3000
```

Requires a running PostgreSQL instance. The schema is created automatically and
demo data is seeded on first run.

## Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start with hot reload (tsx watch)    |
| `npm run build`     | Compile TypeScript to `dist/`        |
| `npm start`         | Run the compiled server              |
| `npm run typecheck` | Type-check without emitting          |

## Adding a task type

1. Create `src/strategies/<Name>Strategy.ts` extending `BaseTaskStrategy` and
   declaring its `statuses`.
2. Register it in `src/strategies/StrategyRegistry.ts`.

Validation, the `/api/tasks/types` metadata, and the client forms update
automatically — no other changes required.
