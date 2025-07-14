# Feature: Async Thread Management (Tasks) via LangGraph

## 1. Purpose

This feature manages the execution of "Tasks". A Task is an active, asynchronous conversation thread powered by a Large Language Model (LLM). This is the core interactive component of the Oven AI platform.

## 2. Core Architectural Decision: LangGraph Integration

We will use **LangGraph** to handle the entire backend for task execution, state management, and conversation history. Specifically, we will interact with a deployed LangGraph instance via its **HTTP Assistants API**.

Our application's backend will act as a **proxy** to the LangGraph API. It will not implement any of the agent/tool execution logic itself. This drastically simplifies our backend.

The frontend will use a library like **`assistant-ui`** to render the chat interface, which is compatible with the streaming responses from our backend proxy.

### Benefits of this Architecture

- **Reduced Complexity:** We offload the hardest parts of building an agentic system (state management, tool calls, async execution) to LangGraph.
- **Scalability:** LangGraph is designed for scalable, stateful agent execution.
- **Flexibility:** We can update the agent logic in LangGraph without redeploying our main application.

## 3. Frontend Requirements

### 3.1. TypeScript Interface

The `Task` model in our application becomes very simple. It's primarily a pointer to the corresponding objects in LangGraph, plus some business-level metadata.

```typescript
// src/types/task.ts
export type TaskStatus = "running" | "stopped" | "error" | "interrupted";

export interface Task {
  id: string; // Our internal ID
  name: string;
  organizationId: string;
  status: TaskStatus;

  // Pointers to LangGraph objects
  assistant_id: string;
  thread_id: string;

  createdAt: string;
  updatedAt: string;
}
```

### 3.2. User Interface (UI)

- **Task List:** A view to list all tasks for an organization, showing their name and status.
- **Chat Interface:** This is the main view.
  - Integrate a component like `assistant-ui`.
  - The UI will communicate with our backend proxy API to send messages and receive streamed responses.
  - The UI needs to handle user input, including interruptions (`interrupt` state).

## 4. Backend Requirements

### 4.1. API Endpoints (Proxy)

The backend exposes endpoints that largely mirror the LangGraph Assistants API, but are scoped to our application's concepts (like `organizationId`).

- `POST /api/tasks`: Create a new task.

  - **Action:** This endpoint will make a call to the LangGraph API to create a new `assistant` and a new `thread`.
  - It will then store the returned `assistant_id` and `thread_id` in our `tasks` table.
  - Body: `{ name: string; organizationId: string; processBlueprintId?: string; }`

- `POST /api/tasks/:id/messages`: Send a message to a task's thread.

  - **Action:** This is a proxy to the LangGraph "run" endpoint for a specific thread (`POST /threads/{thread_id}/runs`).
  - It will handle streaming the response from LangGraph back to the client.

- `GET /api/tasks/:id`: Get metadata for a task (from our DB).

- `GET /api/tasks/:id/messages`: Get the message history for a task.

  - **Action:** This is a proxy to the LangGraph `GET /threads/{thread_id}/messages` endpoint.

- `POST /api/tasks/:id/interrupt`: Interrupt a running task.
  - **Action:** Proxy to the LangGraph interrupt endpoint.

### 4.2. Database Schema

The `tasks` table is very simple, as LangGraph is the source of truth for execution state.

**`tasks` table:**

- `id` (Primary Key, e.g., UUID)
- `name` (String)
- `organization_id` (Foreign Key to `organizations.id`)
- `status` (String: "running", "stopped", "error", "interrupted") - This may be synced from LangGraph or managed at our application level.
- `assistant_id` (String, from LangGraph)
- `thread_id` (String, from LangGraph)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
