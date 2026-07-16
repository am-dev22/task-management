# Extensible Task-Management Platform

A multi-strategy task management application featuring a React (TypeScript) frontend and an extensible API backend utilizing SQLite for persistent storage. The system tracks task statuses sequentially using ascending integers (1, 2, 3...) to drive a flexible state machine.

---

## 🛠️ Tech Stack
- Frontend: React, TypeScript, Axios
- Backend: Node.js (Express)
- Database: SQLite

---

## 🚀 Getting Started

Follow these steps to run the application locally.

### 1. Backend Setup
1. Navigate to the backend directory:
   cd TaskManagement.API
2. Install dependencies:
   npm install
3. Initialize the database and seed demo data:
   # Run your database seeding script (e.g., node seed.js or npm run seed)
   npm run seed
4. Start the server:
   npm run dev
   *The API will run on http://localhost:3000.*

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   cd TaskManagement.Client
2. Install dependencies:
   npm install
3. Start the development server:
   npm run dev
   *Open http://localhost:5173 (or the printed local port) in your browser to view the app.*

---

## 📐 Design Decisions & Extensibility

- Sequential Integer State Tracking: Statuses are tracked cleanly as ascending integers (e.g., Status 1/3, 2/3 for Procurement; Status 1/4, 2/4 for Development). This ensures strict sequence validation, fast database indexing, and straightforward progression arithmetic.
- State Machine Strategy Pattern: Rather than hardcoding transition requirements inside a monolithic block of code, status validation and metadata collection are handled using a modular strategy configuration. Adding new task types with varying progression lengths requires zero modification to existing core controller logic.
- Dynamic JSON Payloads: Flexible metadata required during transitions (such as price quotes or branch names) is captured at the UI layer and stored dynamically inside a structured JSON text column (customData) in the SQLite database, avoiding the need for messy, sparse columns.