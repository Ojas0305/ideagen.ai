# Feature: Performance Metrics Dashboard

## 1. Purpose

This feature provides users with a dashboard to monitor key operational performance metrics of the Oven AI platform. The focus is on efficiency and task management, rather than business-level financial metrics. This allows users to understand how effectively their AI workers are operating.

## 2. Frontend Requirements

### 2.1. TypeScript Interface

The frontend will use the following interface for displaying metrics.

```typescript
// src/types/metrics.ts
export interface PerformanceMetrics {
  totalTasks: number;
  completedTasks: number;
  runningTasks: number;
  errorRate: number; // as a percentage
  averageTaskDuration: number; // in seconds
  activeWorkers: number;
  tasksPerWorker: { workerId: string; workerName: string; taskCount: number }[];
}
```

### 2.2. User Interface (UI)

- **Dashboard View:** A dedicated section in the UI to display the performance metrics.
- **Data Visualization:** Use charts and graphs for better visualization.
  - Pie chart for task status (completed, running, errored).
  - Bar chart for `tasksPerWorker`.
  - Cards for key numbers like `totalTasks`, `activeWorkers`, `averageTaskDuration`.

## 3. Backend Requirements

### 3.1. API Endpoints

A single endpoint is needed to fetch the calculated metrics.

- `GET /api/metrics`: Retrieves the performance metrics object.
  - Query Params: `?organizationId=<org_id>&dateRange=<range>` for filtering.

### 3.2. Backend Logic

- The backend will need to query the `tasks` and `workers` tables (and potentially others) to calculate the metrics.
- The logic should be efficient, as this endpoint might be called frequently. Consider caching the results for short periods.
- **Calculations:**
  - `totalTasks`, `completedTasks`, `runningTasks`: From the `tasks` table based on status.
  - `errorRate`: `(errored_tasks / total_tasks) * 100`.
  - `averageTaskDuration`: Average time difference between `created_at` and `completed_at` for completed tasks.
  - `activeWorkers`: Count of workers associated with running tasks.
  - `tasksPerWorker`: Group tasks by worker.
