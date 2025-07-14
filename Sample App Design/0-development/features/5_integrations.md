# Feature: External Integrations

## 1. Purpose

The "Integrations" feature allows Oven AI to connect to external tools, APIs, and data sources. This empowers the AI workers (LangGraph assistants) to perform actions and access information outside of the platform, such as fetching data from a CRM, sending emails, or interacting with a project management tool.

## 2. Frontend Requirements

### 2.1. TypeScript Interface

```typescript
// src/types/integration.ts
export interface Integration {
  id: string;
  name: string; // e.g., "Google Calendar", "Jira"
  type: "oauth" | "api_key";
  isEnabled: boolean;
  organizationId: string;
}

export interface ApiKeyCredential {
  id: string;
  integrationId: string;
  key: string; // The key itself is never sent to the frontend
  description: string;
}
```

### 2.2. User Interface (UI)

- **Integration Marketplace:** A view that shows a list of available integrations that can be enabled.
- **Configuration:** For each integration, a UI to configure it.
  - For API Key based auth, a form to add a new key with a description. The key itself should be write-only.
  - For OAuth, a button to initiate the OAuth flow. A callback page will be needed to handle the redirect from the external service.
- **Credentials Management:** A secure way to list, add, and revoke credentials (e.g., API keys).

## 3. Backend Requirements

### 3.1. API Endpoints

- `GET /api/integrations`: List available integrations for an organization and their status (enabled/disabled).
- `POST /api/integrations/:id/enable`: Enable an integration for the organization.
- `POST /api/integrations/:id/disable`: Disable an integration.
- `GET /api/integrations/:id/credentials`: List credentials for an integration (without exposing secrets).
- `POST /api/integrations/:id/credentials`: Add a new credential (e.g., API key).
- `DELETE /api/integrations/credentials/:credId`: Revoke a credential.

### 3.2. Backend Logic

- **Secure Credential Storage:** API keys and OAuth tokens **must** be stored encrypted in the database. Use a secure vault service if possible.
- **Tool Registration:** The backend needs a mechanism to associate these integrations with the "tools" that are made available to the LangGraph assistants. When an assistant is created, the backend will pass the list of available tools (and the necessary credentials, fetched securely) to LangGraph.
- **OAuth Flow:** Implement the server-side logic for OAuth2 authorization code flow for relevant integrations.

### 3.3. Database Schema

**`integrations` table:**

- `id` (PK)
- `name` (String, unique)
- `type` (String: 'oauth', 'api_key')

**`organization_integrations` table:** (Junction table)

- `organization_id` (FK)
- `integration_id` (FK)
- `is_enabled` (Boolean)

**`credentials` table:**

- `id` (PK)
- `organization_id` (FK)
- `integration_id` (FK)
- `encrypted_secret` (String, not null)
- `description` (String)
