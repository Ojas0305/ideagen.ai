# Feature: AI Workers Management

## 1. Purpose

The "Workers" feature allows users to define and configure AI agents/assistants that can be assigned to execute tasks. A Worker represents the configuration, capabilities, and personality of an AI agent, while a "Task" (see `4_async_thread_management.md`) is a live conversation thread that uses a specific Worker.

This separation allows for reusable AI agent configurations that can be applied to multiple tasks.

## 2. Frontend Requirements

### 2.1. TypeScript Interface

```typescript
// src/types/worker.ts
export interface Worker {
  id: string;
  name: string;
  description: string;
  organizationId: string;

  // Configuration for the AI agent
  systemPrompt: string;
  model: string; // e.g., "gpt-4", "claude-3-sonnet"
  temperature: number;
  maxTokens: number;

  // Available tools/integrations
  enabledIntegrations: string[]; // Array of integration IDs

  createdAt: string;
  updatedAt: string;
}
```

### 2.2. User Interface (UI)

- **Worker Library:** A view to list all workers for an organization, showing their name, description, and capabilities.
- **Worker Editor:** A comprehensive form to create and edit workers:
  - Basic information (name, description)
  - System prompt configuration (large text area with markdown support)
  - Model selection and parameters (temperature, max tokens)
  - Integration selection (checkboxes for available integrations)
- **Worker Templates:** Pre-built worker configurations for common use cases (e.g., "Customer Support Agent", "Data Analyst", "Content Writer").
- **Worker Testing:** A simple chat interface to test a worker configuration before saving.

## 3. Backend Requirements

### 3.1. API Endpoints

Standard CRUD endpoints for managing workers.

- `POST /api/workers`: Create a new worker.
  - Body: `{ name: string; description: string; systemPrompt: string; model: string; temperature: number; maxTokens: number; enabledIntegrations: string[]; organizationId: string; }`
- `GET /api/workers`: Get all workers for an organization.
  - Query Params: `?organizationId=<org_id>`
- `GET /api/workers/:id`: Get a single worker.
- `PATCH /api/workers/:id`: Update a worker configuration.
- `DELETE /api/workers/:id`: Delete a worker.
- `POST /api/workers/:id/test`: Test a worker configuration with a sample message.
  - Body: `{ message: string; }`

### 3.2. Integration with LangGraph

When creating a Task (see `4_async_thread_management.md`), the Worker configuration is used to:

1. **Create LangGraph Assistant:** The backend makes a call to LangGraph's assistant creation endpoint with:

   - The worker's system prompt
   - The worker's model configuration
   - The list of available tools (based on enabled integrations)

2. **Tool Configuration:** For each enabled integration, the backend securely fetches the necessary credentials and configures the corresponding tools in LangGraph.

### 3.3. Database Schema

**`workers` table:**

- `id` (Primary Key, e.g., UUID)
- `name` (String, not null)
- `description` (Text)
- `organization_id` (Foreign Key to `organizations.id`)
- `system_prompt` (Text, not null)
- `model` (String, not null)
- `temperature` (Float, default 0.7)
- `max_tokens` (Integer, default 1000)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**`worker_integrations` table:** (Junction table)

- `worker_id` (Foreign Key to `workers.id`)
- `integration_id` (Foreign Key to `integrations.id`)

## 4. Relationship to Tasks

When a user creates a new Task, they select a Worker to power that conversation. The Task creation process:

1. Takes the Worker configuration
2. Creates a LangGraph assistant with the Worker's settings
3. Creates a conversation thread
4. Stores the references in the Tasks table

This allows multiple Tasks to use the same Worker configuration, and Workers can be updated independently of running Tasks.
