# Feature: Business Process Blueprints

## 1. Purpose

The "Business Process Blueprints" feature allows users to define standardized, non-executable templates for common workflows. These blueprints act as starting points or recipes for creating actual, runnable "Tasks".

This decouples the definition of a process from its execution. A blueprint is a static definition, while a "Task" (see `4_async_thread_management.md`) is a live, running instance.

**Enhanced Feature**: Process blueprints now support **many-to-many relationships with organizations**, enabling cross-organizational process sharing with granular access control (read-only, read-write, admin permissions).

## 2. Frontend Requirements

### 2.1. TypeScript Interface (Enhanced for Multi-Organization Support)

```typescript
// src/types/process.ts
export interface ProcessBlueprint {
  id: string;
  name: string;
  description: string;
  // Enhanced: Many-to-many relationship with organizations
  organizations: ProcessBlueprintOrganization[];
  // This could be a JSON object, YAML, or just text describing the steps.
  // It's a template, not an executable graph.
  definition: string | object;
  status: "active" | "draft";
  category: string;
  complexity: "simple" | "moderate" | "complex";
  estimatedDuration?: string;
  tags: string[];
  usageCount: number; // How many tasks have used this blueprint
  taskSuccessRate: number; // Success rate of tasks using this blueprint
  lastUsed?: Date;
  // Computed properties
  isShared: boolean; // organizations.length > 1
  totalOrganizations: number;
  currentUserAccess?: "read_only" | "read_write" | "admin";
  createdAt: string;
  updatedAt: string;
}

// New interface for organization access
export interface ProcessBlueprintOrganization {
  organizationId: string;
  organizationName?: string;
  accessLevel: "read_only" | "read_write" | "admin";
  grantedAt: string;
}

// Enhanced creation request for multiple organizations
export interface CreateProcessBlueprintRequest {
  name: string;
  description: string;
  definition: string | object;
  // Replace single organizationId with array of organization access
  organizations: {
    organizationId: string;
    accessLevel: "read_only" | "read_write" | "admin";
  }[];
  category?: string;
  complexity?: "simple" | "moderate" | "complex";
  tags?: string[];
}

// Enhanced update request
export interface UpdateProcessBlueprintRequest {
  name?: string;
  description?: string;
  definition?: string | object;
  // Optional organization updates
  organizations?: {
    organizationId: string;
    accessLevel: "read_only" | "read_write" | "admin";
  }[];
  category?: string;
  complexity?: "simple" | "moderate" | "complex";
  tags?: string[];
}

// New interface for managing organization access
export interface ManageProcessOrganizationAccessRequest {
  processId: string;
  organizationId: string;
  accessLevel: "read_only" | "read_write" | "admin";
  action: "grant" | "revoke" | "update";
}
```

### 2.2. User Interface (UI) - Enhanced for Multi-Organization Support

#### Blueprint Editor (Enhanced)

- **Organization Access Tab**: New tab for managing which organizations have access and at what level
- **Access Level Selection**: Dropdown for read-only, read-write, and admin permissions
- **Organization Selector**: Multi-select interface for choosing organizations
- **Access Validation**: Ensure at least one organization retains admin access
- **Sharing Workflow**: Guided process for sharing blueprints with other organizations

#### Blueprint Library (Enhanced)

- **Sharing Indicators**: Visual badges showing shared vs single-organization processes
- **Access Level Badges**: Display current user's permission level (read-only/read-write/admin)
- **Organization Filter**: Filter processes by organization access
- **Cross-Org Usage**: Analytics showing how shared processes perform across organizations
- **Permission-Based Actions**: Edit/delete buttons only visible based on access level

#### Blueprint Card (Enhanced)

- **Organization List**: Display organizations with access and their permission levels
- **Sharing Status**: Icon indicating if process is shared across multiple organizations
- **Access Level Badge**: Current user's access level prominently displayed
- **Manage Access**: Button for users with appropriate permissions to manage sharing

#### Access Management Dialog (New)

- **Current Access Matrix**: Grid showing all organizations and their access levels
- **Add Organization**: Interface to grant access to additional organizations
- **Bulk Operations**: Apply same access level to multiple organizations
- **Access History**: Audit trail of permission changes
- **Remove Access**: Revoke organization access (with validation)

### 2.3. Enhanced Features

#### Cross-Organizational Collaboration

- **Shared Process Library**: View processes available across multiple organizations
- **Collaboration Analytics**: Insights into how shared processes perform
- **Access Request Workflow**: Process for requesting access to processes from other organizations
- **Usage Comparison**: Compare process performance across different organizational contexts

#### Advanced Sharing Controls

- **Granular Permissions**: Three-tier access control (read-only, read-write, admin)
- **Access Level Definitions**:
  - **Read-Only**: Can view and use process, cannot modify
  - **Read-Write**: Can view, use, and modify process content
  - **Admin**: Full control including access management and deletion
- **Bulk Access Management**: Efficiently manage access for multiple organizations
- **Access Validation**: Prevent invalid permission states

#### Enhanced Analytics

- **Cross-Org Performance**: Compare process effectiveness across organizations
- **Sharing Insights**: Analytics on collaboration patterns and process adoption
- **Usage Distribution**: Breakdown of process usage by organization
- **Collaboration Metrics**: Success rates and efficiency of shared processes

## 3. Backend Requirements

### 3.1. API Endpoints (Enhanced for Many-to-Many)

#### Core Process Management

- `POST /api/processes`: Create process with organization access array
  - Body: `{ name, description, definition, organizations: [{ organizationId, accessLevel }] }`
- `GET /api/processes`: Get processes with organization filtering
  - Query Params: `?organizationId=<id>&includeShared=true&accessLevel=admin`
- `GET /api/processes/:id`: Get single process with organization access details
- `PATCH /api/processes/:id`: Update process (respects access levels)
- `DELETE /api/processes/:id`: Delete process (admin access required)

#### Organization Access Management (New)

- `GET /api/processes/:id/organizations`: Get all organizations with access
- `POST /api/processes/:id/organizations`: Grant organization access
  - Body: `{ organizationId, accessLevel }`
- `PUT /api/processes/:id/organizations/:orgId`: Update access level
- `DELETE /api/processes/:id/organizations/:orgId`: Revoke access

#### Enhanced Querying

- `GET /api/processes/by-organization/:orgId`: Get processes for specific organization
- `GET /api/processes/shared`: Get all shared processes
- `GET /api/processes/:id/collaboration`: Get collaboration metrics
- `POST /api/processes/:id/request-access`: Request access from another organization

### 3.2. Database Schema (Enhanced for Many-to-Many)

**Enhanced `process_blueprints` table:**

- Remove `organization_id` column (replaced by junction table)
- Add `category`, `complexity`, `usage_count`, `task_success_rate`
- Add `tags` (JSONB), `last_used` timestamp

**New `process_blueprint_organizations` table (Junction Table):**

- `id` (Primary Key, UUID)
- `process_blueprint_id` (Foreign Key to `process_blueprints.id`)
- `organization_id` (Foreign Key to `organizations.id`)
- `access_level` (ENUM: 'read_only', 'read_write', 'admin')
- `granted_by` (UUID, user who granted access)
- `granted_at` (Timestamp)
- `created_at` (Timestamp)
- Unique constraint on (process_blueprint_id, organization_id)

**New `process_access_history` table (Audit Trail):**

- `id` (Primary Key, UUID)
- `process_blueprint_id` (Foreign Key)
- `organization_id` (Foreign Key)
- `action` (VARCHAR: 'granted', 'revoked', 'updated')
- `access_level` (VARCHAR)
- `previous_access_level` (VARCHAR, nullable)
- `performed_by` (UUID, user who performed action)
- `reason` (TEXT, optional)
- `timestamp` (Timestamp)

**New `process_usage_metrics` table:**

- Track cross-organizational usage
- Performance metrics by organization
- Success rates and adoption patterns

### 3.3. Database Functions (New)

**Helper Functions:**

```sql
-- Get processes accessible to an organization
CREATE FUNCTION get_process_blueprints_for_organization(org_id UUID, include_shared BOOLEAN)
RETURNS TABLE(...);

-- Check if organization has specific access level
CREATE FUNCTION has_process_access(blueprint_id UUID, org_id UUID, required_access VARCHAR)
RETURNS BOOLEAN;

-- Get collaboration metrics
CREATE FUNCTION get_collaboration_metrics(org_id UUID, period_days INTEGER)
RETURNS JSON;
```

**Enhanced Views:**

```sql
-- View combining processes with organization access
CREATE VIEW process_blueprints_with_organizations AS ...;

-- View for shared processes analytics
CREATE VIEW shared_process_analytics AS ...;
```

## 4. Implementation Notes

### 4.1. Migration Strategy

- Create junction table and migrate existing organization relationships
- Existing processes get 'admin' access for their current organization
- Add sample cross-organizational sharing for demonstration

### 4.2. Access Control

- Validate user permissions before allowing access management
- Ensure at least one organization always has admin access
- Implement role-based access control for organization membership

### 4.3. Performance Considerations

- Index junction table for efficient queries
- Cache frequently accessed organization relationships
- Optimize queries for cross-organizational process retrieval

### 4.4. Security

- Audit all access changes
- Validate organization permissions
- Secure handling of cross-organizational data

This enhanced Process Blueprints feature enables powerful collaboration while maintaining security and organization boundaries, supporting the platform's evolution into a truly collaborative AI workforce management system.
