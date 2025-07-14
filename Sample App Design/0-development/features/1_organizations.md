# Feature: Dynamic and Hierarchical Organizations

## 1. Purpose

The "Organizations" feature allows users to define and manage their own organizational structure within the Oven AI platform. This structure is dynamic, meaning it is not hardcoded and can be created and modified by the users themselves. It supports a hierarchical model, allowing for the creation of parent organizations and sub-organizations (e.g., departments, teams).

This feature is foundational, as all other entities in the platform (Workers, Processes, Tasks) will be associated with an organization.

## 2. Frontend Requirements

### 2.1. TypeScript Interface

The frontend will use the following TypeScript interface to represent an organization. Note the `parentId` to enable the hierarchy and the `children` array to represent sub-organizations.

```typescript
// src/types/organization.ts
export interface Organization {
  id: string;
  name: string;
  parentId: string | null;
  children: Organization[];
  createdAt: string;
  updatedAt: string;
}
```

### 2.2. User Interface (UI)

- **Create Organization:** A form or modal to create a new top-level organization or a sub-organization under an existing one.
- **View Organizations:** A hierarchical view (e.g., a tree view) to display the organizational structure.
- **Update Organization:** Functionality to edit the name of an organization.
- **Delete Organization:** Functionality to delete an organization. Deleting a parent organization should handle sub-organizations appropriately (e.g., delete them or re-assign them).

## 3. Backend Requirements

### 3.1. API Endpoints

Implement a RESTful API for managing organizations.

- `POST /api/organizations`: Create a new organization.
  - Body: `{ name: string; parentId?: string; }`
- `GET /api/organizations`: Retrieve all organizations, preferably in a hierarchical structure.
- `GET /api/organizations/:id`: Retrieve a single organization, including its children.
- `PATCH /api/organizations/:id`: Update an organization.
  - Body: `{ name?: string; parentId?: string; }`
- `DELETE /api/organizations/:id`: Delete an organization.

### 3.2. Database Schema

A single table is required to store the organizational hierarchy. The `parent_id` column will be a self-referencing foreign key.

**`organizations` table:**

- `id` (Primary Key, e.g., UUID)
- `name` (String, not null)
- `parent_id` (Foreign Key, references `organizations.id`, nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
