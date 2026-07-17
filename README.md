# Extensible Task-Management Platform

A robust, multi-strategy task management application designed for high extensibility. The system utilizes a state machine pattern to manage task lifecycles, ensuring strict sequential transitions while maintaining flexibility for diverse business processes (e.g., Procurement vs. Development).

---

## 🏛️ System Architecture

The application follows a **Decoupled Service-Oriented Architecture**:

*   **Client Layer:** A React-based SPA that consumes the API via a centralized `api.ts` service layer.
*   **API Layer (Express):** A modular backend featuring:
    *   **Controllers:** Handle HTTP request/response lifecycles.
    *   **Service Layer:** Contains business logic and orchestrates strategy execution.
    *   **Strategy Layer:** A plug-and-play pattern used to validate unique state transitions for different task types.
*   **Persistence Layer (SQLite):** A lightweight, file-based relational database that persists tasks, users, and task metadata.

---

## 📐 Design Decisions & Extensibility

### 1. State Machine Strategy Pattern
Rather than hardcoding conditional logic for every task type, we utilize the **Strategy Pattern**. Each `TaskType` (Procurement, Development, etc.) has its own strategy class. When a status update is requested, the system dynamically selects the strategy, delegating validation and metadata processing to the appropriate module.

### 2. Sequential Integer State Tracking
Statuses are represented as ascending integers.
- **Benefits:** Enables efficient database indexing, simplifies "Is the task finished?" checks via simple comparison operators (`status >= maxStatus`), and prevents invalid state jumps.

### 3. Dynamic JSON Payloads (`customData`)
To avoid "Database Schema Drift," we use a `customData` JSON column.
- **Why:** Every task type requires unique metadata (e.g., Procurement needs `priceQuotes`, while Development might need `branchName`). JSON storage allows us to store arbitrary metadata without constantly migrating/altering the SQL schema.

---

## 🚀 Getting Started

### 1. Backend Setup
1. Navigate to: `cd TaskManagement.API`
2. Install: `npm install`
3. Run: `npm run dev`
   *The API runs on `http://localhost:3000`. Database seeding is handled automatically on first launch.*

### 2. Frontend Setup
1. Navigate to: `cd taskmanagement.client`
2. Install: `npm install`
3. Run: `npm run dev`
   *Open the URL provided in your terminal (usually `http://localhost:5173`).*

---

## 🛡️ Database Note
We use **SQLite** because it is zero-configuration and file-based, making the application portable and perfect for testing state machine logic without the overhead of heavy database servers.

---

## 📈 Future Roadmap
- [ ] Implement Role-Based Access Control (RBAC).
- [ ] Add real-time task notifications via WebSockets.
- [ ] Expand strategy library to include "Approval" and "QA" task types.