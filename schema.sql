-- PostgreSQL schema for the Task-Management Platform.
--
-- Reference / documentation only: at runtime the schema is created automatically
-- by TypeORM (`synchronize: true`) and demo data is seeded on first start (see
-- TaskManagement.API/src/database/db-initializer.ts). This file mirrors that
-- generated schema and can be used to provision the database manually.
--
-- Identifiers are quoted because TypeORM preserves the entities' camelCase
-- property names as column names.

-- 1. Users
CREATE TABLE IF NOT EXISTS "user" (
    "id"   SERIAL PRIMARY KEY,
    "name" VARCHAR NOT NULL
);

-- 2. Tasks
CREATE TABLE IF NOT EXISTS "task" (
    "id"             SERIAL PRIMARY KEY,
    "title"          VARCHAR NOT NULL,
    "type"           VARCHAR NOT NULL,               -- 'procurement' | 'development' | 'hr' | ...
    "status"         INTEGER NOT NULL DEFAULT 1,     -- ascending 1, 2, 3...
    "isClosed"       BOOLEAN NOT NULL DEFAULT FALSE,
    "customData"     JSONB   NOT NULL DEFAULT '{}',  -- type-specific fields (text/number/date/boolean/select/list)
    "assignedUserId" INTEGER REFERENCES "user" ("id")
);

-- 3. Demo users
INSERT INTO "user" ("name") VALUES
    ('Alice (Backend Developer)'),
    ('Bob (Product Owner)'),
    ('Charlie (Procurement Manager)');

-- 4. Demo tasks
INSERT INTO "task" ("title", "type", "status", "isClosed", "customData", "assignedUserId") VALUES
    ('Order new office laptops', 'procurement', 1, FALSE, '{}', 3),
    ('Build task-management API', 'development', 1, FALSE, '{}', 1);
