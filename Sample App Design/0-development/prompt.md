# Oven AI Platform - Comprehensive Development Guide

**Oven AI** is an enterprise-grade AI workforce management platform that enables organizations to automate business processes through specialized AI workers. The platform serves as a centralized command center for managing AI-powered automation across multiple departments, providing comprehensive oversight, task management, and performance analytics. This document serves as the complete technical specification for building the Oven AI platform.

IMPORTANT: Read the description on the platform, and also have a look at the attached photos to adhere to the UI.

IMPORTANT: Whenever you want to get clarification on the UI, look at the XML files in the `Design` folder pertaining to whichever view you want, and also read the README.

### Platform Architecture

The platform consists of 7 main sections organized in a hierarchical dashboard system:

1. **Overview** - Executive dashboard and strategic command center providing comprehensive visibility into organizational performance, AI workforce management, and operational efficiency across all departments. This serves as the central command center for executive-level business operations, featuring real-time business intelligence through key performance indicators, department health monitoring with exception management, system status and resource management for AI workforce utilization, and an intelligent early warning system with priority-based alerts. The interface embodies a data-driven executive experience that consolidates critical business intelligence into a unified interface, enabling strategic velocity while maintaining operational oversight.

2. **Organizations** - Multi-departmental management and coordination system that provides both high-level oversight and detailed department-specific workflows for enterprise-scale operations. This comprehensive organizational management system operates on a two-tier navigation model with an executive dashboard showing all departments and business units, combined with department deep-dive capabilities for detailed workflow management. The interface enables corporate health monitoring through departmental performance metrics, resource allocation tracking, performance benchmarking, and strategic improvement management. It represents a scalable organizational AI strategy where artificial intelligence is systematically integrated across entire organizations as part of the workforce.

3. **Processes** - Workflow automation and business process management serving as the central command center for business process automation within the platform. This interface provides comprehensive oversight of automated workflows, their performance metrics, and operational health status, enabling users to design, deploy, monitor, and optimize business processes with AI worker integration. The system features a comprehensive process builder with multi-tab interface for process creation, template library access, real-time process visualization, and performance monitoring capabilities. It includes progressive enhancement features like draft functionality, testing capabilities, deployment options, and proactive system health monitoring for continuous optimization.

4. **Workers** - AI workforce configuration and performance monitoring hub that serves as the central management system for AI workforce operations. This interface provides comprehensive oversight of AI worker performance, utilization metrics, task assignments, and operational efficiency, enabling organizations to optimize their artificial intelligence workforce across specialized AI roles. The system includes real-time AI worker communication through chat modals, comprehensive worker configuration interfaces, and dual-panel task management with conversation context. Workers are presented as integrated team members rather than tools, fostering a collaborative mindset with seamless human-AI integration and performance metrics that treat human and AI contributions equally.

5. **Integrations** - Third-party tool marketplace and connection management serving as a centralized hub for discovering, evaluating, and connecting external tools and services to AI workers. This marketplace interface enables organizations to expand their AI workforce capabilities through strategic tool integration, providing access to a vast ecosystem of business applications across Communication, Design & Creative, Analytics & Data, Development, Finance & Business, and Productivity categories. The system features advanced search capabilities, comprehensive tool categories, integration status management (Connected, Available, Installing), and detailed integration cards with quality indicators, capability overviews, and connection management controls.

6. **Tasks** - Real-time task execution monitoring and control center that serves as the central command center for monitoring and managing all AI-driven task execution. This interface provides executives and operations teams with comprehensive visibility into task performance, priority distribution, completion metrics, and operational bottlenecks, enabling data-driven task management and resource optimization across the organization. The system features real-time task monitoring, bulk operation interfaces, comprehensive task information architecture with individual task cards, performance metrics and analytics, and proactive bottlenecks and issues monitoring with systematic problem addressing frameworks.

7. **Knowledge Base** - Centralized data source management for AI workers serving as the central hub for managing AI workers' access to organizational knowledge and data sources. This interface enables administrators to connect, monitor, and manage various data sources including document uploads, cloud storage platforms (Google Drive, Dropbox, OneDrive), databases (MySQL, PostgreSQL), and business APIs (Salesforce, HubSpot), ensuring AI workers have comprehensive access to business-critical information for enhanced decision-making and task execution. The system provides direct file upload capabilities, multi-platform cloud storage connectivity, enterprise data source integration, and real-time synchronization monitoring.

### Implementation Guidelines

**READ THIS FIRST** - This document serves as the complete technical specification for building the Oven AI platform. Follow these guidelines strictly:

1. **Code Fidelity**: Use the exact TypeScript interfaces, API endpoints, and implementation patterns provided in this document. Do not deviate from the specified structure without explicit approval.

2. **Assistant-UI Integration**: This platform is built with assistant-ui for all conversation interfaces. Use the provided adapters and runtime configuration exactly as specified. Do not create custom chat components.

3. **LangGraph Backend**: All AI worker interactions happen through LangGraph threads. Use the proxy patterns and streaming implementations provided in the Assistant-UI Integration section.

4. **Database Schema**: Implement the SQL schemas exactly as provided. Table structures, relationships, and data types must match the specifications.

5. **API Consistency**: Follow the RESTful API patterns defined for each section. Endpoint naming, request/response formats, and error handling must be consistent across the platform.

6. **TypeScript First**: All code must be written in TypeScript with strict type checking. Use the provided interfaces and extend them appropriately for your implementations.

### Development Workflow

1. **Start with Tests**: Write comprehensive tests for each component before implementation
2. **Follow Tech Stack**: Use NextJS, Supabase, Assistant-UI, and Shadcn/ui as specified
3. **Component Architecture**: Build reusable components following the provided interface patterns
4. **State Management**: Use the Context Library + Assistant-UI LocalRuntime pattern
5. **Real-time Features**: Implement WebSocket connections for non-chat real-time updates

### Key Integration Points

- **Assistant-UI**: Handles all conversation interfaces, streaming, and thread management
- **LangGraph**: Powers AI worker execution through thread-based interactions
- **Supabase**: Database and authentication layer
- **Shadcn/ui**: Component library for consistent UI elements

### Critical Success Factors

- **User-Defined Organizations**: All organizations/departments are user-creatable, no hardcoded values
- **Process Blueprints**: Processes are templates, not executable workflows
- **Task-Based Interaction**: All worker communication happens through conversational task threads
- **Real-time Performance**: Live updates for task status, metrics, and system health

---

### Tech Stack

- Use NextJS for frontend and api layers
- Use Supabase for DB management

### Core Value Proposition

- **AI-Native Operations**: Treating AI workers as core business resources with dedicated monitoring and management
- **Real-Time Business Intelligence**: Immediate visibility into operational performance and financial metrics
- **Exception-Driven Management**: Focus on items requiring attention rather than routine status updates
- **Integrated Decision-Making**: Combining financial performance, operational efficiency, and workforce management in a unified interface

---

# ON TO THE IMPLEMENTATION!!!

## 1. Overview Dashboard (Executive Command Center)

### Purpose

Central command center for executive-level business operations providing comprehensive visibility into organizational performance, AI workforce management, and operational efficiency across all departments.

### Frontend Requirements

#### Navigation & Quick Actions

```typescript
interface QuickActions {
  createProcess: () => void;
  addWorker: () => void;
  connectData: () => void;
}
```

#### Performance Metrics

- **Task Completion Rate**: Overall success rate of completed tasks with trend analysis
- **Active Tasks**: Currently running tasks across all organizations with real-time updates
- **Monthly Performance**: Task completion metrics for the current month vs previous periods
- **Worker Efficiency**: Average AI worker utilization and performance scores across the platform
- **Process Success Rate**: Percentage of successful process executions with improvement tracking
- **Average Task Duration**: Time efficiency metrics showing optimization trends

```typescript
interface PerformanceMetrics {
  taskCompletion: {
    rate: number; // percentage of successfully completed tasks
    trend: number; // month-over-month change
    totalCompleted: number;
    totalFailed: number;
  };
  activeTasks: {
    count: number;
    byPriority: {
      high: number;
      medium: number;
      low: number;
    };
    byStatus: {
      running: number;
      queued: number;
      paused: number;
    };
  };
  monthlyPerformance: {
    tasksCompleted: number;
    averageCompletionTime: string; // e.g., "2.3h"
    successRate: number;
    costEfficiency: number;
    trend: number; // percentage change from previous month
  };
  workerEfficiency: {
    averageUtilization: number; // percentage
    activeWorkers: number;
    totalWorkers: number;
    topPerformer: {
      name: string;
      successRate: number;
    };
  };
  processMetrics: {
    successRate: number;
    averageExecutionTime: string;
    automationRate: number;
    errorRate: number;
  };
}
```

#### Department Health Overview

```typescript
interface DepartmentHealth {
  [organizationId: string]: {
    id: string;
    name: string;
    healthScore: number;
    activeTasks: number;
    aiWorkers: number;
    completionRate: number;
    lastActivity: Date;
    warning?: boolean;
    status: "healthy" | "warning" | "critical";
    description?: string;
    color?: string;
  };
}
```

#### System Status & Resource Management

```typescript
interface SystemStatus {
  aiWorkforce: {
    total: number; // 15
    active: number; // 11
    idle: number; // 4
    utilization: number; // 73%
  };
  processes: {
    total: number; // 127
    active: number; // 89
    draft: number; // 38
    successRate: number; // 84%
  };
  tasks: {
    running: number; // 42
    queued: number; // 18
    completedToday: number; // 156
    averageTime: string; // "2.3h"
  };
}
```

#### Alerts & Notification System

```typescript
interface Alert {
  id: string;
  priority: "high" | "medium" | "low";
  organizationId?: string;
  organizationName?: string;
  message: string;
  timestamp: Date;
  actionRequired: boolean;
  alertType: string;
  source: string;
}

interface AlertsState {
  high: Alert[];
  medium: Alert[];
  low: Alert[];
  organizationFilters: {
    id: string;
    name: string;
    enabled: boolean;
  }[];
}
```

#### Recent Activity Feed

```typescript
interface ActivityItem {
  id: string;
  type: "task_completion" | "process_deployment" | "worker_assignment";
  message: string;
  timestamp: Date;
  organizationId?: string;
  organizationName?: string;
  worker?: string;
  outcome?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}
```

### Backend Requirements

#### API Endpoints

```
GET /api/dashboard/overview
- Returns executive dashboard data
- Includes performance metrics, health scores, system status

GET /api/dashboard/performance-metrics
- Task completion rates and trends
- Worker efficiency and utilization metrics
- Monthly performance comparisons

GET /api/dashboard/organizations
- Organization-specific health and performance data
- Real-time metrics and warning indicators

GET /api/dashboard/alerts
- Priority-based alert system
- Cross-organizational monitoring

GET /api/dashboard/activity
- Recent activity feed
- Task completions and system events

GET /api/dashboard/worker-performance
- Individual and aggregate worker performance
- Utilization rates and efficiency scores

GET /api/dashboard/task-analytics
- Task completion analytics
- Success rates and duration trends

POST /api/quick-actions/create-process
POST /api/quick-actions/add-worker
POST /api/quick-actions/connect-data
```

#### Data Models

```sql
-- Performance metrics tracking
CREATE TABLE performance_metrics (
  id SERIAL PRIMARY KEY,
  metric_type VARCHAR(50), -- task_completion, worker_efficiency, process_success, etc.
  value DECIMAL(10,2),
  target_value DECIMAL(10,2),
  trend_percentage DECIMAL(5,2),
  organization_id INTEGER REFERENCES organizations(id),
  period_start DATE,
  period_end DATE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task completion tracking
CREATE TABLE task_completion_metrics (
  id SERIAL PRIMARY KEY,
  date DATE,
  organization_id INTEGER REFERENCES organizations(id),
  tasks_completed INTEGER,
  tasks_failed INTEGER,
  total_tasks INTEGER,
  success_rate DECIMAL(5,2),
  average_completion_time INTEGER, -- in minutes
  cost_efficiency DECIMAL(10,2)
);

-- Worker performance metrics
CREATE TABLE worker_performance_metrics (
  id SERIAL PRIMARY KEY,
  date DATE,
  worker_id INTEGER REFERENCES workers(id),
  organization_id INTEGER REFERENCES organizations(id),
  tasks_completed INTEGER,
  success_rate DECIMAL(5,2),
  utilization_percentage DECIMAL(5,2),
  average_response_time INTEGER, -- in seconds
  efficiency_score INTEGER
);

-- Department health monitoring
CREATE TABLE department_health (
  id SERIAL PRIMARY KEY,
  department_name VARCHAR(50),
  health_score INTEGER,
  active_tasks INTEGER,
  ai_workers INTEGER,
  completion_rate DECIMAL(5,2),
  last_activity TIMESTAMP,
  warning_status BOOLEAN DEFAULT FALSE
);

-- System alerts
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  priority VARCHAR(10),
  organization_id INTEGER REFERENCES organizations(id),
  message TEXT,
  alert_type VARCHAR(50),
  source VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledged BOOLEAN DEFAULT FALSE,
  action_required BOOLEAN DEFAULT FALSE,
  acknowledged_by INTEGER,
  acknowledged_at TIMESTAMP
);
```

---

## 2. Organizations (Dynamic Organization Management)

### Purpose

Comprehensive organizational management system that allows users to create, configure, and manage custom organizations/departments with specialized workflows and performance monitoring.

### Frontend Requirements

#### Organization Creation & Management

```typescript
interface OrganizationCreation {
  createOrganization: {
    name: string;
    description: string;
    type: string; // department, business_unit, team, etc.
    color: string;
    icon: string;
    parentOrganizationId?: string; // for nested organizations
  };
  editOrganization: {
    id: string;
    name: string;
    description: string;
    type: string;
    color: string;
    icon: string;
  };
  deleteOrganization: (id: string) => Promise<boolean>;
  archiveOrganization: (id: string) => Promise<boolean>;
}
```

#### Organizations Overview

```typescript
interface OrganizationOverview {
  organizations: {
    [organizationId: string]: {
      id: string;
      name: string;
      description: string;
      type: string;
      healthScore: number;
      status: "healthy" | "warning" | "critical";
      activeTasks: number;
      aiWorkers: number;
      processes: number;
      completionRate: number;
      automationRate: number;
      topPerformingProcess: string;
      color: string;
      icon: string;
      parentId?: string;
      children?: string[];
      createdAt: Date;
      lastActivity: Date;
    };
  };
  consolidatedMetrics: {
    totalOrganizations: number;
    totalTasks: number;
    totalWorkers: number;
    averageHealthScore: number;
  };
  organizationHierarchy: OrganizationNode[];
}

interface OrganizationNode {
  id: string;
  name: string;
  type: string;
  children: OrganizationNode[];
  healthScore: number;
  activeTasks: number;
}
```

#### Organization-Specific Dashboard

```typescript
interface OrganizationDashboard {
  organization: {
    id: string;
    name: string;
    description: string;
    type: string;
    color: string;
    icon: string;
  };
  performance: {
    workerActivity: number;
    processAutomation: number;
    taskCompletion: number;
    successRate: number;
  };
  processes: Process[];
  activeTasks: Task[];
  aiWorkers: Worker[];
  improvements: {
    priority: "high" | "medium" | "low";
    description: string;
    assignedWorker?: string;
  }[];
  customMetrics?: {
    [metricName: string]: {
      value: number;
      target?: number;
      unit: string;
      trend?: number;
    };
  };
}
```

#### Process Management System

```typescript
interface ProcessBlueprint {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft";
  category: string;
  requiredIntegrations: Integration[];
  usageCount: number; // how many tasks have used this blueprint
  taskSuccessRate: number; // success rate of tasks using this blueprint
  estimatedDuration?: string;
  complexity: "simple" | "moderate" | "complex";
  lastUsed?: Date;
  organizationId?: string;
  isPublic: boolean; // available to all workers in organization
  tags: string[];
}
```

#### Human-AI Collaboration Interface

```typescript
interface CollaborativeTask {
  id: string;
  name: string;
  status: "running" | "stopped" | "error" | "interrupt";
  priority: "high" | "medium" | "low";
  assignedWorker: {
    id: string;
    name: string;
    specialization: string;
  };
  processBlueprint?: {
    id: string;
    name: string;
  };
  conversationSummary: {
    messageCount: number;
    awaitingInput: boolean;
    lastActivity: Date;
  };
  duration: string;
  cost: number;
  requiresHumanReview: boolean;
  organizationId: string;
}
```

### Backend Requirements

#### API Endpoints

```
GET /api/organizations
- List all user-defined organizations
- Support for hierarchy and filtering

GET /api/organizations/{orgId}
- Detailed organization dashboard
- Performance metrics, processes, tasks, workers

POST /api/organizations
- Create new organization/department
- Set name, type, color, icon, hierarchy

PUT /api/organizations/{orgId}
- Update organization details
- Modify hierarchy, settings, custom metrics

DELETE /api/organizations/{orgId}
- Delete organization (with safety checks)
- Archive instead of hard delete

GET /api/organizations/{orgId}/processes
- Organization-specific process blueprints
- Templates and blueprint library

GET /api/organizations/{orgId}/tasks
- Active task threads for organization
- Async execution status and conversations

GET /api/organizations/{orgId}/workers
- AI workers assigned to organization
- Performance and utilization metrics

POST /api/organizations/{orgId}/processes
- Create new process blueprint for organization

POST /api/organizations/{orgId}/tasks
- Create new task thread for organization worker
- Assign process blueprint if specified

PUT /api/organizations/{orgId}/tasks/{taskId}
- Update task thread status or assignment
- Handle conversation and state management

GET /api/organizations/hierarchy
- Get complete organization hierarchy
- Nested structure with relationships

POST /api/organizations/{orgId}/metrics
- Add custom metrics for organization
- Define KPIs specific to organization type
```

#### Data Models

```sql
-- Dynamic organization management
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- user-defined: department, team, division, etc.
  color VARCHAR(7), -- hex color code
  icon VARCHAR(50), -- icon identifier
  parent_id INTEGER REFERENCES organizations(id),
  health_score INTEGER DEFAULT 0,
  active_tasks INTEGER DEFAULT 0,
  ai_workers INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  automation_rate DECIMAL(5,2) DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_by INTEGER, -- user who created this organization
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom metrics per organization
CREATE TABLE organization_metrics (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  metric_name VARCHAR(100),
  metric_value DECIMAL(10,2),
  target_value DECIMAL(10,2),
  unit VARCHAR(20),
  trend_percentage DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Process blueprints (templates for task execution)
CREATE TABLE processes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200),
  organization_id INTEGER REFERENCES organizations(id),
  category VARCHAR(50),
  description TEXT,
  required_integrations JSONB,
  optional_integrations JSONB,
  estimated_duration INTEGER, -- in minutes
  complexity VARCHAR(20), -- simple, moderate, complex
  status VARCHAR(20) DEFAULT 'draft',
  usage_count INTEGER DEFAULT 0,
  task_success_rate DECIMAL(5,2),
  last_used TIMESTAMP,
  tags JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Process blueprint integrations
CREATE TABLE process_integrations (
  id SERIAL PRIMARY KEY,
  process_id INTEGER REFERENCES processes(id),
  integration_id INTEGER REFERENCES integrations(id),
  is_required BOOLEAN DEFAULT TRUE,
  configuration_notes TEXT
);

-- Process blueprint templates
CREATE TABLE process_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200),
  category VARCHAR(50),
  description TEXT,
  complexity VARCHAR(20),
  default_integrations JSONB,
  setup_time_estimate INTEGER -- in minutes
);

-- Process usage tracking (when used in tasks)
CREATE TABLE process_usage (
  id SERIAL PRIMARY KEY,
  process_id INTEGER REFERENCES processes(id),
  task_id INTEGER REFERENCES tasks(id),
  worker_id INTEGER REFERENCES workers(id),
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  task_outcome VARCHAR(20), -- success, failure, interrupted
  duration INTEGER -- actual task duration in minutes
);

-- Human-AI task collaboration
CREATE TABLE collaborative_tasks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200),
  organization_id INTEGER REFERENCES organizations(id),
  process_id INTEGER REFERENCES processes(id),
  assigned_to_type VARCHAR(10), -- 'human' or 'ai'
  assigned_to_id VARCHAR(50),
  status VARCHAR(20),
  priority VARCHAR(10),
  progress INTEGER,
  requires_human_review BOOLEAN DEFAULT FALSE,
  deadline TIMESTAMP
);

-- Organization hierarchy tracking
CREATE TABLE organization_hierarchy (
  id SERIAL PRIMARY KEY,
  ancestor_id INTEGER REFERENCES organizations(id),
  descendant_id INTEGER REFERENCES organizations(id),
  depth INTEGER,
  UNIQUE(ancestor_id, descendant_id)
);
```

---

## 3. Processes (Business Process Blueprints)

### Purpose

Central repository for business process blueprints that serve as guiding templates for AI worker task execution. Processes define standardized workflows with required integrations and descriptions, but are not executed directly - they serve as blueprints that workers can follow when performing tasks. **Now supports many-to-many relationships with organizations**, enabling process sharing across multiple organizations with granular access control.

### Frontend Requirements

#### Process Dashboard

```typescript
interface ProcessDashboard {
  metrics: {
    totalProcesses: number;
    activeProcesses: number; // processes currently being used by tasks
    sharedProcesses: number; // processes accessible across multiple organizations
    draftProcesses: number;
    processUsageRate: number; // how often processes are used in tasks
    averageTasksPerProcess: number;
    blueprintEffectiveness: number; // success rate of tasks using processes
    crossOrgUsage: number; // utilization of shared processes across organizations
  };
  processes: ProcessBlueprint[];
  recentActivity: ProcessActivity[];
  usage: {
    mostUsedProcesses: ProcessBlueprint[];
    unusedProcesses: ProcessBlueprint[];
    processPerformance: {
      processId: string;
      timesUsed: number;
      taskSuccessRate: number;
      organizationBreakdown: {
        organizationId: string;
        organizationName: string;
        usageCount: number;
        successRate: number;
      }[];
    }[];
  };
  organizationAccess: {
    [organizationId: string]: {
      ownedCount: number; // processes where org has admin access
      sharedCount: number; // processes shared with this org
      accessLevels: {
        readOnly: number;
        readWrite: number;
        admin: number;
      };
    };
  };
}

interface ProcessBlueprint {
  id: string;
  name: string;
  description: string;
  organizations: ProcessBlueprintOrganization[]; // Many-to-many relationship
  status: "active" | "draft";
  category: string;
  requiredIntegrations: Integration[];
  usageCount: number; // how many tasks have used this blueprint
  taskSuccessRate: number; // success rate of tasks using this blueprint
  estimatedDuration?: string;
  complexity: "simple" | "moderate" | "complex";
  lastUsed?: Date;
  isShared: boolean; // computed: organizations.length > 1
  tags: string[];
  totalOrganizations: number;
  currentUserAccess?: "read_only" | "read_write" | "admin";
}

interface ProcessBlueprintOrganization {
  organizationId: string;
  organizationName?: string;
  accessLevel: "read_only" | "read_write" | "admin";
  grantedAt: string;
}
```

#### Process Builder Modal (Enhanced for Multi-Organization Support)

```typescript
interface ProcessBuilder {
  currentTab: "details" | "organizations" | "preview" | "templates";
  processDetails: {
    name: string;
    primaryOrganizationId: string; // Initial organization context
    category: string;
    description: string;
    requiredIntegrations: Integration[];
    estimatedDuration?: string;
    complexity: "simple" | "moderate" | "complex";
    tags: string[];
    sharingIntent: boolean; // Mark as intended for sharing
  };
  organizationAccess: {
    currentAccess: OrganizationAccess[];
    availableOrganizations: Organization[];
    selectedOrgId: string;
    selectedAccessLevel: "read_only" | "read_write" | "admin";
    accessValidation: {
      hasAdminAccess: boolean;
      minimumRequirementsMet: boolean;
      warnings: string[];
    };
  };
  preview: {
    blueprintView: ProcessPreview;
    selectedIntegrations: Integration[];
    usageGuidelines: string[];
    organizationContext: {
      [organizationId: string]: {
        availableIntegrations: Integration[];
        workerCompatibility: string[];
      };
    };
  };
  templates: {
    organizationTemplates: ProcessTemplate[]; // Templates from user's organizations
    sharedTemplates: ProcessTemplate[]; // Cross-organizational templates
    communityTemplates: ProcessTemplate[]; // Highly-shared templates
    filterBy: "all" | "organization" | "shared" | "community";
  };
  availableOrganizations: {
    id: string;
    name: string;
    type: string;
    color: string;
    currentUserRole: string;
  }[];
}

interface OrganizationAccess {
  organizationId: string;
  organizationName: string;
  accessLevel: "read_only" | "read_write" | "admin";
  canModify: boolean; // Based on current user's permissions
}

interface ProcessTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultIntegrations: string[];
  estimatedSetupTime: string;
  complexity: "basic" | "intermediate" | "advanced";
  organizations: number; // Number of organizations using this template
  accessLevel: "read_only" | "read_write" | "admin"; // What access level this template provides
  isShared: boolean;
}
```

#### Process Creation Workflow with Access Management

```typescript
interface ProcessCreationState {
  step: "definition" | "access" | "integration" | "preview" | "deployment";
  basicInfo: {
    name: string;
    primaryOrganizationId: string;
    category: string;
    description: string;
    estimatedDuration?: string;
    complexity: "simple" | "moderate" | "complex";
    sharingIntent: boolean;
  };
  accessManagement: {
    organizations: OrganizationAccess[];
    accessValidation: {
      isValid: boolean;
      hasAdmin: boolean;
      errors: string[];
      warnings: string[];
    };
    sharingWorkflow: {
      enabled: boolean;
      targetOrganizations: string[];
      defaultAccessLevel: "read_only" | "read_write" | "admin";
    };
  };
  integrations: {
    required: Integration[];
    optional: Integration[];
    organizationCompatibility: {
      [organizationId: string]: {
        available: Integration[];
        missing: Integration[];
      };
    };
    configured: boolean;
  };
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    crossOrgValidation: {
      integrationCompatibility: boolean;
      accessLevelConsistency: boolean;
    };
  };
  deploymentOptions: {
    saveAsDraft: boolean;
    immediateActivation: boolean;
    notifyOrganizations: boolean;
    tags: string[];
  };
}
```

#### Process Sharing & Access Management

```typescript
interface ProcessSharingInterface {
  accessManagement: {
    grantAccess: (
      processId: string,
      organizationId: string,
      accessLevel: "read_only" | "read_write" | "admin"
    ) => Promise<boolean>;
    revokeAccess: (
      processId: string,
      organizationId: string
    ) => Promise<boolean>;
    updateAccessLevel: (
      processId: string,
      organizationId: string,
      newAccessLevel: "read_only" | "read_write" | "admin"
    ) => Promise<boolean>;
    bulkAccessManagement: (
      processId: string,
      accessUpdates: {
        organizationId: string;
        accessLevel: "read_only" | "read_write" | "admin";
        action: "grant" | "revoke" | "update";
      }[]
    ) => Promise<boolean>;
  };
  sharingWorkflow: {
    requestAccess: (
      processId: string,
      requestingOrgId: string
    ) => Promise<boolean>;
    shareWithOrganization: (
      processId: string,
      targetOrgId: string,
      accessLevel: "read_only" | "read_write" | "admin",
      message?: string
    ) => Promise<boolean>;
    getAccessHistory: (processId: string) => Promise<AccessHistoryEntry[]>;
  };
  organizationMetrics: {
    getSharedProcesses: (organizationId: string) => Promise<ProcessBlueprint[]>;
    getCrossOrgUsage: (
      processId: string
    ) => Promise<OrganizationUsageMetrics[]>;
    getCollaborationInsights: (
      organizationId: string
    ) => Promise<CollaborationMetrics>;
  };
}

interface AccessHistoryEntry {
  id: string;
  processId: string;
  organizationId: string;
  organizationName: string;
  action: "granted" | "revoked" | "updated";
  accessLevel: "read_only" | "read_write" | "admin";
  previousAccessLevel?: "read_only" | "read_write" | "admin";
  performedBy: string;
  timestamp: Date;
  reason?: string;
}

interface OrganizationUsageMetrics {
  organizationId: string;
  organizationName: string;
  accessLevel: "read_only" | "read_write" | "admin";
  usageCount: number;
  successRate: number;
  lastUsed: Date;
  avgExecutionTime: number;
}

interface CollaborationMetrics {
  organizationId: string;
  sharedProcessesReceived: number;
  sharedProcessesProvided: number;
  collaboratingOrganizations: number;
  avgCollaborationSuccessRate: number;
  topSharedProcesses: {
    processId: string;
    processName: string;
    sharingOrganizations: number;
    usageCount: number;
  }[];
}
```

### Backend Requirements

#### API Endpoints (Enhanced for Many-to-Many)

```
GET /api/processes
- List process blueprints with organization access filtering
- Query params: organizationId, organizationIds, includeShared, accessLevel
- Returns processes accessible to specified organizations

GET /api/processes/{processId}
- Detailed process blueprint with organization access information
- Includes current user's access level and organization context

POST /api/processes
- Create new process blueprint with organization access
- Body includes organizations array with access levels
- Validates organization permissions and access consistency

PUT /api/processes/{processId}
- Update process blueprint (respects access levels)
- Can include organization access updates
- Admin access required for structural changes

DELETE /api/processes/{processId}
- Delete process blueprint (admin access required)
- Validates no active tasks are using this blueprint

GET /api/processes/{processId}/organizations
- Get all organizations with access to process
- Returns organization details and access levels

POST /api/processes/{processId}/organizations
- Grant organization access to process
- Body: { organizationId, accessLevel }
- Validates requester has permission to grant access

PUT /api/processes/{processId}/organizations/{orgId}
- Update organization access level
- Requires admin access to process

DELETE /api/processes/{processId}/organizations/{orgId}
- Revoke organization access
- Validates at least one admin organization remains

GET /api/processes/shared
- Get all shared processes (cross-organizational)
- Filter by access level, organization participation

GET /api/processes/templates
- Available process blueprint templates
- Includes organization-specific and shared templates
- Filter by complexity, category, sharing status

GET /api/processes/by-organization/{orgId}
- Get processes accessible to specific organization
- Includes owned and shared processes
- Returns with access level context

GET /api/processes/{processId}/usage
- Tasks that have used this process blueprint
- Performance metrics across organizations
- Organization-specific usage statistics

GET /api/processes/{processId}/collaboration
- Collaboration metrics for shared process
- Cross-organizational usage patterns
- Performance comparison across organizations

POST /api/processes/{processId}/request-access
- Request access to process from another organization
- Creates notification workflow for approval

GET /api/organizations/{orgId}/process-sharing
- Organization's process sharing overview
- Processes shared with others vs received from others
- Collaboration metrics and insights
```

#### Data Models (Enhanced Schema)

```sql
-- Process blueprints (core definition)
CREATE TABLE process_blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  definition JSONB,
  category VARCHAR(100),
  complexity VARCHAR(20),
  estimated_duration INTEGER, -- in minutes
  status VARCHAR(20) DEFAULT 'draft',
  usage_count INTEGER DEFAULT 0,
  task_success_rate DECIMAL(5,2),
  last_used TIMESTAMP,
  tags JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many relationship with organizations
CREATE TABLE process_blueprint_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_blueprint_id UUID REFERENCES process_blueprints(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  access_level VARCHAR(50) DEFAULT 'read_write' CHECK (access_level IN ('read_only', 'read_write', 'admin')),
  granted_by UUID, -- User who granted access
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(process_blueprint_id, organization_id)
);

-- Access history for audit trail
CREATE TABLE process_access_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_blueprint_id UUID REFERENCES process_blueprints(id),
  organization_id UUID REFERENCES organizations(id),
  action VARCHAR(20), -- 'granted', 'revoked', 'updated'
  access_level VARCHAR(50),
  previous_access_level VARCHAR(50),
  performed_by UUID, -- User who performed the action
  reason TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Process usage across organizations
CREATE TABLE process_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_blueprint_id UUID REFERENCES process_blueprints(id),
  organization_id UUID REFERENCES organizations(id),
  task_id UUID REFERENCES tasks(id),
  worker_id UUID REFERENCES workers(id),
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  task_outcome VARCHAR(20), -- success, failure, interrupted
  duration INTEGER, -- actual task duration in minutes
  success_rate DECIMAL(5,2),
  performance_score INTEGER
);

-- Collaboration metrics aggregation
CREATE TABLE collaboration_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  period_start DATE,
  period_end DATE,
  shared_processes_received INTEGER,
  shared_processes_provided INTEGER,
  collaborating_organizations INTEGER,
  avg_collaboration_success_rate DECIMAL(5,2),
  total_cross_org_usage INTEGER,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced indexes for performance
CREATE INDEX idx_process_blueprint_orgs_blueprint_id ON process_blueprint_organizations(process_blueprint_id);
CREATE INDEX idx_process_blueprint_orgs_organization_id ON process_blueprint_organizations(organization_id);
CREATE INDEX idx_process_blueprint_orgs_access_level ON process_blueprint_organizations(access_level);
CREATE INDEX idx_process_usage_metrics_process_org ON process_usage_metrics(process_blueprint_id, organization_id);
CREATE INDEX idx_process_access_history_process_id ON process_access_history(process_blueprint_id);

-- Helper functions for querying
CREATE OR REPLACE FUNCTION get_process_blueprints_for_organization(org_id UUID, include_shared BOOLEAN DEFAULT TRUE)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  description TEXT,
  definition JSONB,
  access_level VARCHAR(50),
  total_organizations INTEGER,
  is_shared BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pb.id,
    pb.name,
    pb.description,
    pb.definition,
    pbo.access_level,
    (SELECT COUNT(*)::INTEGER FROM process_blueprint_organizations pbo2 WHERE pbo2.process_blueprint_id = pb.id) as total_organizations,
    (SELECT COUNT(*) > 1 FROM process_blueprint_organizations pbo3 WHERE pbo3.process_blueprint_id = pb.id) as is_shared,
    pb.created_at,
    pb.updated_at
  FROM process_blueprints pb
  INNER JOIN process_blueprint_organizations pbo ON pb.id = pbo.process_blueprint_id
  WHERE pbo.organization_id = org_id
    AND (include_shared = TRUE OR pbo.access_level = 'admin')
  ORDER BY pb.created_at DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION has_process_access(blueprint_id UUID, org_id UUID, required_access VARCHAR(50) DEFAULT 'read_only')
RETURNS BOOLEAN AS $$
DECLARE
  user_access VARCHAR(50);
BEGIN
  SELECT access_level INTO user_access
  FROM process_blueprint_organizations
  WHERE process_blueprint_id = blueprint_id AND organization_id = org_id;

  IF user_access IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check access levels (admin > read_write > read_only)
  CASE required_access
    WHEN 'read_only' THEN RETURN TRUE;
    WHEN 'read_write' THEN RETURN user_access IN ('read_write', 'admin');
    WHEN 'admin' THEN RETURN user_access = 'admin';
    ELSE RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- View for easier querying with organization details
CREATE OR REPLACE VIEW process_blueprints_with_organizations AS
SELECT
  pb.*,
  array_agg(
    json_build_object(
      'organization_id', pbo.organization_id,
      'organization_name', o.name,
      'access_level', pbo.access_level,
      'granted_at', pbo.granted_at
    ) ORDER BY o.name
  ) as organizations,
  COUNT(pbo.organization_id) as total_organizations,
  (COUNT(pbo.organization_id) > 1) as is_shared
FROM process_blueprints pb
LEFT JOIN process_blueprint_organizations pbo ON pb.id = pbo.process_blueprint_id
LEFT JOIN organizations o ON pbo.organization_id = o.id
GROUP BY pb.id, pb.name, pb.description, pb.definition, pb.category, pb.complexity,
         pb.estimated_duration, pb.status, pb.usage_count, pb.task_success_rate,
         pb.last_used, pb.tags, pb.created_at, pb.updated_at;
```

---

## 4. Workers (AI Workforce Management)

### Purpose

Central management hub for AI workforce operations providing comprehensive oversight of AI worker performance, utilization metrics, and task-based execution. Workers are instructed and activated through Tasks, which create async conversation threads for all interactions.

### Frontend Requirements

#### Workers Dashboard

```typescript
interface WorkersDashboard {
  metrics: {
    totalWorkers: number;
    activeWorkers: number;
    averageUtilization: number;
    efficiencyScore: number;
    taskCompletionRate: number;
    averageResponseTime: string;
    errorRate: number;
  };
  workers: AIWorker[];
  bulkActions: {
    assignTasks: (workerIds: string[]) => void;
    pauseWorkers: (workerIds: string[]) => void;
    resumeWorkers: (workerIds: string[]) => void;
  };
}

interface AIWorker {
  id: string;
  name: string;
  specialization: string; // user-defined specialization
  specializationType: string; // category like marketing, content, data, etc.
  status: "active" | "idle" | "busy";
  avatar: string;
  organizationId?: string;
  currentTask?: {
    name: string;
    progress: number;
    estimatedCompletion: Date;
  };
  dailyMetrics: {
    tasksCompleted: number;
    successRate: number;
    averageTime: string;
  };
  utilization: number;
  rating: number;
  customSkills: string[];
  description?: string;
}
```

#### Worker-Assistant Integration Interface

```typescript
interface WorkerAssistantInterface {
  workerId: string;
  assistantId: string; // LangGraph assistant_id
  runtime: LocalRuntime; // Assistant-UI runtime handling all chat state
  adapters: {
    langGraph: LangGraphAdapter;
    attachments: AttachmentAdapter;
    tools: ToolAdapter;
    threadList: RemoteThreadListAdapter;
  };
  threadOperations: {
    listThreads: () => Promise<Thread[]>;
    createThread: (metadata?: object) => Promise<Thread>;
    switchThread: (threadId: string) => void;
    archiveThread: (threadId: string) => Promise<void>;
  };
  quickActions: {
    startQuickTask: (instruction: string) => Promise<string>; // Returns thread_id
    applyBlueprint: (processId: string) => Promise<string>;
    bulkCancel: (threadIds: string[]) => Promise<void>;
  };
}

// LangGraph Adapter for Assistant-UI
interface LangGraphAdapter extends ChatModelAdapter {
  run: (options: {
    messages: Message[];
    abortSignal: AbortSignal;
    context: {
      assistantId: string;
      workerId: string;
      tools: any[];
      processId?: string;
    };
  }) => AsyncGenerator<ModelResponse>;
}

// Simplified thread representation for Assistant-UI
interface WorkerThread {
  id: string;
  threadId: string; // LangGraph thread_id
  name: string;
  status: "idle" | "busy" | "interrupted" | "error";
  processBlueprint?: {
    id: string;
    name: string;
  };
  lastActivity: Date;
  messageCount: number;
  awaitingInput: boolean;
  organizationId: string;
  // Assistant-UI handles all conversation state internally
}
```

#### Configure Worker Modal

```typescript
interface WorkerConfiguration {
  step: "specialist-type" | "details" | "tools" | "review";
  specialistType: {
    category: string; // user selects from available categories or creates new
    customSpecialization: string; // user-defined specialization name
    defaultTools: string[];
    focusAreas: string[];
  };
  workerDetails: {
    name: string;
    description: string;
    personalityStyle: "friendly" | "professional" | "casual" | "technical";
    responseSpeed: "fast" | "balanced" | "thorough" | "custom";
    organizationId?: string;
    customSkills: string[];
  };
  tools: {
    communication: Integration[];
    design: Integration[];
    analytics: Integration[];
    development: Integration[];
    finance: Integration[];
    productivity: Integration[];
    custom: Integration[];
  };
  preview: {
    avatar: string;
    toolCount: number;
    readinessStatus: boolean;
  };
  availableCategories: string[];
  availableOrganizations: {
    id: string;
    name: string;
    type: string;
  }[];
}
```

### Backend Requirements

#### API Endpoints

```
GET /api/workers
- List all AI workers with metrics
- Filter by specialization, status, utilization

GET /api/workers/{workerId}
- Detailed worker information
- Performance history and current tasks

POST /api/workers
- Create new AI worker
- Configure specialization and tools

PUT /api/workers/{workerId}
- Update worker configuration
- Change status or assignments

GET /api/workers/{workerId}/chat
- Chat conversation history
- Real-time message retrieval

POST /api/workers/{workerId}/chat
- Send message to AI worker
- Receive AI responses

GET /api/workers/{workerId}/tasks
- Active and recent tasks for worker
- Performance metrics per task

POST /api/workers/bulk-actions
- Bulk assign tasks
- Bulk pause/resume workers

GET /api/worker-templates
- Pre-configured worker templates
- Specialization-specific defaults

GET /api/worker-categories
- Available worker categories
- User-defined and system categories

POST /api/worker-categories
- Create new worker category
- Define default tools and skills

GET /api/worker-specializations
- List all available specializations
- Filter by category or organization

POST /api/worker-specializations
- Create custom specialization
- Define skills and tool requirements
```

#### Data Models

```sql
-- Simplified task tracking (LangGraph handles execution state)
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  thread_id VARCHAR(36) UNIQUE, -- LangGraph thread_id (UUID)
  assistant_id VARCHAR(36), -- LangGraph assistant_id (UUID)
  name VARCHAR(200),
  description TEXT,
  worker_id INTEGER REFERENCES workers(id),
  process_id INTEGER REFERENCES processes(id), -- optional process blueprint
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'failed', 'cancelled'
  priority VARCHAR(10) DEFAULT 'medium',
  instructions TEXT, -- initial user instructions
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  estimated_completion TIMESTAMP,
  organization_id INTEGER REFERENCES organizations(id),
  metadata JSONB, -- additional task metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workers with LangGraph assistant references
CREATE TABLE workers (
  id SERIAL PRIMARY KEY,
  assistant_id VARCHAR(36) UNIQUE, -- LangGraph assistant_id
  name VARCHAR(200),
  specialization VARCHAR(100),
  description TEXT,
  organization_id INTEGER REFERENCES organizations(id),
  status VARCHAR(20) DEFAULT 'active',
  performance_metrics JSONB,
  cost_per_hour DECIMAL(10,2),
  graph_id VARCHAR(100), -- LangGraph graph identifier
  assistant_config JSONB, -- LangGraph assistant configuration
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Simplified task metrics (detailed data from LangGraph API)
CREATE TABLE task_metrics (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id),
  thread_id VARCHAR(36), -- LangGraph thread_id
  run_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  checkpoint_count INTEGER DEFAULT 0,
  interrupt_count INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  token_usage JSONB,
  cost_breakdown JSONB,
  success_rate DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LangGraph assistant configurations
CREATE TABLE assistant_configs (
  id SERIAL PRIMARY KEY,
  worker_id INTEGER REFERENCES workers(id),
  assistant_id VARCHAR(36), -- LangGraph assistant_id
  graph_id VARCHAR(100),
  config JSONB, -- LangGraph assistant config
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Integrations (Tool Marketplace)

### Purpose

Centralized hub for discovering, evaluating, and connecting external tools and services to AI workers, providing access to a vast ecosystem of business applications.

### Frontend Requirements

#### Integrations Marketplace

```typescript
interface IntegrationsMarketplace {
  searchAndFilter: {
    searchQuery: string;
    selectedCategory:
      | "all"
      | "communication"
      | "design"
      | "analytics"
      | "development"
      | "finance"
      | "productivity";
    sortBy: "popular" | "name" | "rating" | "recent";
    statusFilter: "all" | "connected" | "available" | "installing";
  };
  categories: {
    communication: IntegrationCategory;
    design: IntegrationCategory;
    analytics: IntegrationCategory;
    development: IntegrationCategory;
    finance: IntegrationCategory;
    productivity: IntegrationCategory;
  };
  myIntegrations: {
    connected: Integration[];
    count: number;
  };
  quickActions: {
    recentlyAdded: Integration[];
    mostPopular: Integration[];
  };
}

interface IntegrationCategory {
  name: string;
  count: number;
  integrations: Integration[];
}

interface Integration {
  id: string;
  name: string;
  provider: string;
  logo: string;
  rating: number;
  reviewCount: number;
  description: string;
  features: string[];
  status: "connected" | "available" | "installing";
  installProgress?: number;
  category: string;
  pricing?: "free" | "freemium" | "paid";
  setupComplexity: "easy" | "medium" | "complex";
}
```

#### Integration Management

```typescript
interface IntegrationManagement {
  connectionProcess: {
    currentStep: "authentication" | "permissions" | "configuration" | "testing";
    progress: number;
    requirements: string[];
    errors?: string[];
  };
  configuration: {
    apiCredentials: Record<string, string>;
    permissions: string[];
    usageLimits: {
      requestsPerDay: number;
      costLimit: number;
    };
    testConnection: () => Promise<boolean>;
  };
  usage: {
    requestsToday: number;
    costToday: number;
    lastUsed: Date;
    performance: {
      uptime: number;
      averageResponseTime: number;
    };
  };
}
```

### Backend Requirements

#### API Endpoints

```
GET /api/integrations
- List all available integrations
- Search and filter capabilities

GET /api/integrations/categories
- Integration categories with counts

GET /api/integrations/{integrationId}
- Detailed integration information
- Setup requirements and documentation

POST /api/integrations/{integrationId}/connect
- Initiate connection process
- Handle OAuth flows

PUT /api/integrations/{integrationId}/configure
- Update integration configuration
- Test connection settings

DELETE /api/integrations/{integrationId}
- Disconnect integration
- Clean up configuration

GET /api/integrations/my-integrations
- User's connected integrations
- Usage statistics and health

GET /api/integrations/popular
- Most popular integrations
- Recently added integrations
```

#### Data Models

```sql
-- Available integrations
CREATE TABLE integrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  provider VARCHAR(100),
  category VARCHAR(50),
  description TEXT,
  logo_url VARCHAR(500),
  rating DECIMAL(3,2),
  review_count INTEGER,
  setup_complexity VARCHAR(20),
  pricing_model VARCHAR(20),
  documentation_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User integration connections
CREATE TABLE user_integrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  integration_id INTEGER REFERENCES integrations(id),
  status VARCHAR(20) DEFAULT 'available',
  configuration JSONB,
  credentials JSONB, -- encrypted
  connected_at TIMESTAMP,
  last_used TIMESTAMP
);

-- Integration usage tracking
CREATE TABLE integration_usage (
  id SERIAL PRIMARY KEY,
  user_integration_id INTEGER REFERENCES user_integrations(id),
  date DATE,
  requests_count INTEGER,
  cost DECIMAL(10,2),
  uptime_percentage DECIMAL(5,2),
  average_response_time INTEGER -- milliseconds
);

-- Integration categories
CREATE TABLE integration_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50),
  description TEXT,
  icon VARCHAR(100)
);
```

---

## 6. Tasks (LangGraph-Powered Execution)

### Purpose

Central command center for monitoring and managing all LangGraph-powered task executions. Tasks are LangGraph threads that run AI worker conversations, with built-in persistence, interrupt handling, and state management provided by LangGraph.

### Frontend Requirements

#### Tasks Dashboard

```typescript
interface TasksDashboard {
  metrics: {
    activeTasks: number; // threads with status 'busy'
    queuedTasks: number; // runs with status 'pending'
    completedToday: number; // runs with status 'success' today
    failedTasks: number; // runs with status 'error'
    interruptedTasks: number; // threads with status 'interrupted'
    successRate: number;
  };
  statusDistribution: {
    running: { count: number; percentage: number }; // threads 'busy'
    idle: { count: number; percentage: number }; // threads 'idle'
    error: { count: number; percentage: number }; // threads 'error'
    interrupted: { count: number; percentage: number }; // threads 'interrupted'
  };
  performance: {
    onTimeCompletion: number;
    averageTaskDuration: string;
    successRate: number;
    responseTime: string; // average time for LangGraph API responses
    trends: {
      onTime: number; // +5%
      duration: number; // -2%
      success: number; // +3%
    };
  };
  langGraphMetrics: {
    assistantsActive: number; // total active assistants
    threadsTotal: number; // total threads created
    runsToday: number; // total runs executed today
    avgRunDuration: string; // average LangGraph run duration
    checkpointCount: number; // total checkpoints created
    storeSize: number; // items in LangGraph store
  };
}

// Simplified task interface - Assistant-UI handles conversation state
interface LangGraphTask {
  id: string;
  threadId: string; // LangGraph thread ID
  name: string;
  description: string;
  assignedWorker: {
    id: string;
    name: string;
    specialization: string;
  };
  processBlueprint?: {
    id: string;
    name: string;
  };
  status: "running" | "stopped" | "error" | "interrupt";
  langGraphStatus: {
    currentNode?: string; // Current node in LangGraph workflow
    checkpointId?: string;
    interruptReason?: string;
  };
  // Assistant-UI handles conversation state internally
  messageCount: number;
  lastActivity: Date;
  awaitingInput: boolean;
  duration: string;
  cost: number;
  integrations: string[];
  progress?: number;
  priority: "high" | "medium" | "low";
  startTime: Date;
  estimatedCompletion?: Date;
  // Assistant-UI Thread component replaces custom chat interface
  threadComponent: React.ComponentType<ThreadProps>;
}

interface BottleneckIssue {
  id: string;
  priority: "high" | "medium";
  organizationId: string;
  organizationName: string;
  problem: string;
  impact: string;
  affectedTasks: number;
  averageDelay: string;
}
```

#### Task Management & Assistant-UI Integration

```typescript
interface TaskManagement {
  // Assistant-UI Runtime with custom adapters
  runtime: LocalRuntime;
  adapters: {
    langGraph: LangGraphChatAdapter;
    threadList: OvenThreadListAdapter;
    attachments: OvenAttachmentAdapter;
    tools: ProcessBlueprintToolAdapter;
  };

  taskCreation: {
    newTask: (
      workerId: string,
      instructions: string,
      processId?: string
    ) => Promise<string>; // Returns thread_id
    fromBlueprint: (processId: string, workerId: string) => Promise<string>;
    bulkCreate: (tasks: TaskDefinition[]) => Promise<string[]>;
  };

  // Simplified operations - Assistant-UI handles most thread management
  threadOperations: {
    listThreads: () => Promise<Thread[]>;
    getThreadState: (threadId: string) => Promise<ThreadState>;
    switchToThread: (threadId: string) => void; // Assistant-UI handles switching
    archiveThread: (threadId: string) => Promise<void>;
  };

  monitoring: {
    realTimeUpdates: boolean;
    autoRefresh: number; // seconds
    selectedTasks: string[]; // thread_ids
    bulkActions: {
      cancelRuns: (threadIds: string[]) => Promise<void>;
      respondToInterrupts: (
        responses: { threadId: string; input: any }[]
      ) => Promise<void>;
    };
  };

  filters: {
    threadStatus: "all" | "idle" | "busy" | "interrupted" | "error";
    organization: string;
    processBlueprint: string;
    worker: string;
  };
}

// LangGraph Chat Adapter for Assistant-UI
interface LangGraphChatAdapter extends ChatModelAdapter {
  async *run({ messages, abortSignal, context }): AsyncGenerator<ModelResponse> {
    const response = await fetch(`/api/langgraph/threads/${context.threadId}/runs/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        assistant_id: context.assistantId,
        tools: context.tools,
        process_id: context.processId
      }),
      signal: abortSignal,
    });

    // Stream LangGraph responses with interrupt handling
    for await (const chunk of response.body) {
      const data = JSON.parse(chunk);
      if (data.status === 'interrupt') {
        yield {
          type: 'requires-action',
          data: data.interrupt_data,
          content: [{ type: "text", text: data.message }]
        };
      } else {
        yield {
          content: [{ type: "text", text: data.content }],
          metadata: { cost: data.cost, tokens: data.token_usage }
        };
      }
    }
  }
}

// Thread List Adapter for multi-threading
interface OvenThreadListAdapter extends RemoteThreadListAdapter {
  async list() {
    const threads = await fetch('/api/tasks/threads').then(r => r.json());
    return {
      threads: threads.map(t => ({
        remoteId: t.thread_id,
        title: t.name,
        status: t.status === 'active' ? 'regular' : 'archived',
        metadata: {
          workerId: t.worker_id,
          organizationId: t.organization_id,
          processId: t.process_id,
          lastActivity: t.updated_at
        }
      }))
    };
  },

  async initialize(threadId: string) {
    const thread = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        thread_id: threadId,
        name: `Task ${new Date().toLocaleString()}`
      })
    }).then(r => r.json());
    return { remoteId: thread.thread_id };
  }
}

// Process Blueprint Tool Adapter
interface ProcessBlueprintToolAdapter {
  tools: [
    {
      type: "function",
      function: {
        name: "apply_process_blueprint",
        description: "Apply a business process blueprint to guide task execution",
        parameters: {
          type: "object",
          properties: {
            process_id: { type: "string", description: "ID of the process blueprint" },
            variables: { type: "object", description: "Variables for the process" }
          },
          required: ["process_id"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "request_human_input",
        description: "Request input from human when task requires clarification",
        parameters: {
          type: "object",
          properties: {
            question: { type: "string", description: "Question for the human" },
            context: { type: "string", description: "Context for the question" }
          },
          required: ["question"]
        }
      }
    }
  ];

  async execute(toolCall: ToolCall) {
    if (toolCall.name === 'apply_process_blueprint') {
      const process = await fetch(`/api/processes/${toolCall.parameters.process_id}`)
        .then(r => r.json());
      return {
        result: `Applied blueprint: ${process.name}`,
        metadata: { processApplied: true, blueprintId: process.id }
      };
    }

    if (toolCall.name === 'request_human_input') {
      // Trigger Assistant-UI human-in-the-loop interrupt
      return {
        type: 'requires-action',
        data: {
          question: toolCall.parameters.question,
          context: toolCall.parameters.context
        }
      };
    }
  }
}

// Simplified state management - Assistant-UI handles conversation state
interface TaskState {
  threadId: string;
  currentNode?: string;
  checkpointId?: string;
  isInterrupted: boolean;
  interruptData?: any;
  metadata: {
    workerId: string;
    processId?: string;
    organizationId: string;
    startTime: Date;
    cost: number;
  };
  // Assistant-UI manages messages, tools, and conversation flow
}

interface TaskDefinition {
  workerId: string;
  instructions: string;
  processId?: string; // optional process blueprint to follow
  priority: "high" | "medium" | "low";
  organizationId?: string;
  expectedDuration?: number; // in minutes
  integrations?: string[]; // required integrations
  langGraphConfig?: {
    workflow?: string; // custom LangGraph workflow
    tools?: string[]; // specific tools for this task
    interrupts?: string[]; // nodes where interrupts are allowed
  };
}
```

### Backend Requirements

#### API Endpoints

```
# Oven AI Task Management (Proxy + Custom Logic)

GET /api/tasks
- List tasks with LangGraph thread/run data
- Combines local task records with LangGraph thread states

GET /api/tasks/{taskId}
- Get task details with LangGraph thread state
- Returns combined Oven task + LangGraph thread data

POST /api/tasks
- Create new task and LangGraph thread
- Creates assistant if needed, then thread, then initial run

# LangGraph API Proxy Endpoints

POST /api/langgraph/assistants
- Proxy to LangGraph: POST /assistants
- Create LangGraph assistant for Oven worker

GET /api/langgraph/assistants/{assistantId}
- Proxy to LangGraph: GET /assistants/{assistant_id}

POST /api/langgraph/threads
- Proxy to LangGraph: POST /threads
- Create new conversation thread

GET /api/langgraph/threads/{threadId}/state
- Proxy to LangGraph: GET /threads/{thread_id}/state
- Get current thread state and conversation

POST /api/langgraph/threads/{threadId}/runs
- Proxy to LangGraph: POST /threads/{thread_id}/runs
- Start background run on thread

POST /api/langgraph/threads/{threadId}/runs/stream
- Proxy to LangGraph: POST /threads/{thread_id}/runs/stream
- Stream run output in real-time

POST /api/langgraph/threads/{threadId}/runs/{runId}/cancel
- Proxy to LangGraph: POST /threads/{thread_id}/runs/{run_id}/cancel
- Cancel running task

GET /api/langgraph/store/items
- Proxy to LangGraph: GET /store/items
- Access persistent memory store

POST /api/langgraph/store/items
- Proxy to LangGraph: PUT /store/items
- Store long-term memory data
```

#### Data Models

```sql
-- Simplified task tracking (LangGraph handles execution state)
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  thread_id VARCHAR(36) UNIQUE, -- LangGraph thread_id (UUID)
  assistant_id VARCHAR(36), -- LangGraph assistant_id (UUID)
  name VARCHAR(200),
  description TEXT,
  worker_id INTEGER REFERENCES workers(id),
  process_id INTEGER REFERENCES processes(id), -- optional process blueprint
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'failed', 'cancelled'
  priority VARCHAR(10) DEFAULT 'medium',
  instructions TEXT, -- initial user instructions
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  estimated_completion TIMESTAMP,
  organization_id INTEGER REFERENCES organizations(id),
  metadata JSONB, -- additional task metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workers with LangGraph assistant references
CREATE TABLE workers (
  id SERIAL PRIMARY KEY,
  assistant_id VARCHAR(36) UNIQUE, -- LangGraph assistant_id
  name VARCHAR(200),
  specialization VARCHAR(100),
  description TEXT,
  organization_id INTEGER REFERENCES organizations(id),
  status VARCHAR(20) DEFAULT 'active',
  performance_metrics JSONB,
  cost_per_hour DECIMAL(10,2),
  graph_id VARCHAR(100), -- LangGraph graph identifier
  assistant_config JSONB, -- LangGraph assistant configuration
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Simplified task metrics (detailed data from LangGraph API)
CREATE TABLE task_metrics (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id),
  thread_id VARCHAR(36), -- LangGraph thread_id
  run_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  checkpoint_count INTEGER DEFAULT 0,
  interrupt_count INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  token_usage JSONB,
  cost_breakdown JSONB,
  success_rate DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LangGraph assistant configurations
CREATE TABLE assistant_configs (
  id SERIAL PRIMARY KEY,
  worker_id INTEGER REFERENCES workers(id),
  assistant_id VARCHAR(36), -- LangGraph assistant_id
  graph_id VARCHAR(100),
  config JSONB, -- LangGraph assistant config
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. Knowledge Base (Data Source Management)

### Purpose

Central hub for managing AI workers' access to organizational knowledge and data sources, ensuring comprehensive access to business-critical information.

### Frontend Requirements

#### Knowledge Base Dashboard

```typescript
interface KnowledgeBaseDashboard {
  metrics: {
    connectedSources: number;
    failedConnections: number;
    lastSync: string; // "2 min"
  };
  uploadSection: {
    dragAndDrop: FileUploadHandler;
    supportedFormats: string[];
    maxFileSize: string; // "50MB"
    maxTotalSize: string; // "500MB"
    maxFiles: number; // 20
  };
  cloudStorage: CloudStorageConnection[];
  databases: DatabaseConnection[];
  apis: APIConnection[];
}

interface FileUploadHandler {
  onDrop: (files: File[]) => void;
  onBrowse: () => void;
  validateFile: (file: File) => boolean;
  uploadProgress: (fileId: string) => number;
}

interface CloudStorageConnection {
  id: string;
  provider: "google-drive" | "dropbox" | "onedrive";
  status: "connected" | "available" | "pending";
  health: number; // 98%
  storage: {
    used: string; // "145.2 GB"
    total?: string;
  };
  lastSync: Date;
  recentActivity: {
    file: string;
    action: "uploaded" | "modified" | "deleted";
    timestamp: Date;
  }[];
  actions: {
    configure: () => void;
    syncNow: () => void;
    connect?: () => void;
  };
}

interface DatabaseConnection {
  id: string;
  provider: "mysql" | "postgresql" | "mongodb";
  status: "connected" | "available" | "pending";
  health: number;
  records: number;
  size: string;
  lastSync: Date;
  actions: {
    configure: () => void;
    test: () => void;
    connect?: () => void;
  };
}

interface APIConnection {
  id: string;
  provider: "salesforce" | "hubspot" | "custom";
  status: "connected" | "available" | "pending";
  health?: number;
  records?: number;
  apiCalls?: number;
  setupProgress?: number; // for pending connections
  lastSync?: Date;
  actions: {
    configure: () => void;
    refresh?: () => void;
    connect?: () => void;
  };
}
```

#### Data Source Configuration

```typescript
interface DataSourceConfig {
  connectionType: "cloud-storage" | "database" | "api";
  authentication: {
    method: "oauth" | "api-key" | "username-password";
    credentials: Record<string, string>;
    testConnection: () => Promise<boolean>;
  };
  syncSettings: {
    frequency: "real-time" | "hourly" | "daily" | "weekly";
    autoSync: boolean;
    syncFilters: string[];
  };
  dataMapping: {
    fields: FieldMapping[];
    transformations: DataTransformation[];
  };
  permissions: {
    readOnly: boolean;
    allowedOperations: string[];
  };
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  dataType: string;
  required: boolean;
}
```

### Backend Requirements

#### API Endpoints

```
GET /api/knowledge-base
- Overview of all data sources
- Connection status and metrics

GET /api/knowledge-base/sources
- List all connected data sources
- Health and sync status

POST /api/knowledge-base/upload
- Handle file uploads
- Process and index documents

POST /api/knowledge-base/connect
- Connect new data source
- Handle OAuth flows

PUT /api/knowledge-base/sources/{sourceId}
- Update data source configuration
- Change sync settings

DELETE /api/knowledge-base/sources/{sourceId}
- Disconnect data source
- Clean up indexed data

POST /api/knowledge-base/sync/{sourceId}
- Manual sync trigger
- Force data refresh

GET /api/knowledge-base/search
- Search across all knowledge sources
- Return relevant documents/data

GET /api/knowledge-base/analytics
- Usage analytics
- Data source performance
```

#### Data Models

```sql
-- Knowledge base sources
CREATE TABLE knowledge_sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  type VARCHAR(50), -- file, cloud_storage, database, api
  provider VARCHAR(50),
  status VARCHAR(20) DEFAULT 'available',
  health_score INTEGER,
  connection_config JSONB,
  sync_settings JSONB,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Uploaded files
CREATE TABLE knowledge_files (
  id SERIAL PRIMARY KEY,
  source_id INTEGER REFERENCES knowledge_sources(id),
  filename VARCHAR(500),
  file_type VARCHAR(20),
  file_size BIGINT,
  file_path VARCHAR(1000),
  indexed BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexed content for search
CREATE TABLE knowledge_content (
  id SERIAL PRIMARY KEY,
  source_id INTEGER REFERENCES knowledge_sources(id),
  content_type VARCHAR(50),
  title VARCHAR(500),
  content TEXT,
  metadata JSONB,
  indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  search_vector TSVECTOR
);

-- Sync history
CREATE TABLE sync_history (
  id SERIAL PRIMARY KEY,
  source_id INTEGER REFERENCES knowledge_sources(id),
  sync_started TIMESTAMP,
  sync_completed TIMESTAMP,
  records_processed INTEGER,
  status VARCHAR(20),
  error_message TEXT
);

-- Search analytics
CREATE TABLE search_analytics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  query TEXT,
  source_id INTEGER REFERENCES knowledge_sources(id),
  results_count INTEGER,
  clicked_result_id INTEGER,
  search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Assistant-UI Integration Architecture

### Purpose

Integration layer that connects Oven AI's LangGraph-powered backend with assistant-ui for seamless conversation management, replacing custom chat interfaces with production-ready components that handle message editing, branching, streaming, and multi-threading out of the box.

### Frontend Integration

#### Runtime Provider Setup

```typescript
// app/providers/AssistantRuntimeProvider.tsx
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
  type RemoteThreadListAdapter,
} from "@assistant-ui/react";

const OvenAIRuntimeProvider = ({ children }: { children: React.ReactNode }) => {
  const runtime = useLocalRuntime(LangGraphChatAdapter, {
    threadList: OvenThreadListAdapter,
    attachments: OvenAttachmentAdapter,
    tools: ProcessBlueprintToolAdapter,
    unstable_humanToolNames: [
      "request_human_input",
      "approve_action",
      "escalate_issue",
    ],
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};
```

#### LangGraph Chat Adapter Implementation

```typescript
// lib/adapters/LangGraphChatAdapter.ts
const LangGraphChatAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal, context }) {
    const response = await fetch(
      `/api/langgraph/threads/${context.threadId}/runs/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LANGGRAPH_API_KEY}`,
        },
        body: JSON.stringify({
          assistant_id,
          input,
          tools,
          stream_mode,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`LangGraph API error: ${response.statusText}`);
    }

    let accumulatedContent = "";

    for await (const chunk of response.body) {
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = JSON.parse(line.slice(6));

          if (data.event === "on_chat_model_stream") {
            accumulatedContent += data.data.chunk.content;
            yield {
              content: [{ type: "text", text: accumulatedContent }],
              metadata: { tokens: data.usage?.total_tokens },
            };
          }

          if (data.event === "interrupt") {
            yield {
              type: "requires-action",
              content: [{ type: "text", text: data.message }],
              data: {
                type: data.interrupt_type,
                question: data.question,
                context: data.context,
                options: data.options,
              },
            };
            return; // Stop streaming, wait for human input
          }

          if (data.event === "tool_calls") {
            yield {
              content: [
                {
                  type: "tool-call",
                  toolCallId: data.tool_call_id,
                  toolName: data.tool_name,
                  args: data.args,
                },
              ],
            };
          }

          if (data.event === "error") {
            throw new Error(data.error_message);
          }
        }
      }
    }
  },
};
```

#### Thread List Adapter for Multi-Threading

```typescript
// lib/adapters/OvenThreadListAdapter.ts
const OvenThreadListAdapter: RemoteThreadListAdapter = {
  async list() {
    const response = await fetch("/api/tasks/threads", {
      headers: { Authorization: `Bearer ${await getAuthToken()}` },
    });
    const threads = await response.json();

    return {
      threads: threads.map((thread) => ({
        remoteId: thread.thread_id,
        title: thread.name || `Task with ${thread.worker_name}`,
        status: thread.status === "archived" ? "archived" : "regular",
        metadata: {
          workerId: thread.worker_id,
          workerName: thread.worker_name,
          organizationId: thread.organization_id,
          processId: thread.process_id,
          processName: thread.process_name,
          lastActivity: new Date(thread.updated_at),
          messageCount: thread.message_count,
          cost: thread.total_cost,
        },
      })),
    };
  },

  async initialize(threadId: string) {
    // Create new task when thread is initialized
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        thread_id: threadId,
        name: `New Task - ${new Date().toLocaleString()}`,
        status: "active",
      }),
    });

    const task = await response.json();
    return { remoteId: task.thread_id };
  },

  async rename(threadId: string, title: string) {
    await fetch(`/api/tasks/threads/${threadId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({ name: title }),
    });
  },

  async archive(threadId: string) {
    await fetch(`/api/tasks/threads/${threadId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({ status: "archived" }),
    });
  },
};
```

#### Process Blueprint Tool Integration

```typescript
// lib/adapters/ProcessBlueprintToolAdapter.ts
const ProcessBlueprintToolAdapter = {
  tools: [
    {
      type: "function" as const,
      function: {
        name: "apply_process_blueprint",
        description:
          "Apply a business process blueprint to guide the current task execution",
        parameters: {
          type: "object",
          properties: {
            process_id: {
              type: "string",
              description: "ID of the process blueprint to apply",
            },
            variables: {
              type: "object",
              description: "Variables to customize the process execution",
            },
          },
          required: ["process_id"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "request_human_input",
        description:
          "Request input from human when task requires clarification or approval",
        parameters: {
          type: "object",
          properties: {
            question: {
              type: "string",
              description: "Question or request for the human",
            },
            context: {
              type: "string",
              description: "Context and background for the request",
            },
            urgency: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "Urgency level of the request",
            },
          },
          required: ["question"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "escalate_to_specialist",
        description:
          "Escalate task to a specialist worker with different skills",
        parameters: {
          type: "object",
          properties: {
            specialist_type: {
              type: "string",
              description: "Type of specialist needed",
            },
            reason: {
              type: "string",
              description: "Reason for escalation",
            },
            current_progress: {
              type: "string",
              description: "Summary of current progress",
            },
          },
          required: ["specialist_type", "reason"],
        },
      },
    },
  ],
};
```

#### UI Component Integration

```typescript
// components/TaskThread.tsx
import { Thread } from "@assistant-ui/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface TaskThreadProps {
  taskId: string;
  threadId: string;
  workerId: string;
  organizationId: string;
  processId?: string;
}

const TaskThread = ({
  taskId,
  threadId,
  workerId,
  organizationId,
  processId,
}: TaskThreadProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3>Task Conversation</h3>
          <TaskStatusBadge taskId={taskId} />
        </div>
      </CardHeader>
      <CardContent className="h-[600px]">
        <Thread
          key={threadId} // Force re-mount when switching threads
          context={{
            threadId,
            assistantId: workerId,
            workerId,
            organizationId,
            processId,
          }}
        />
      </CardContent>
    </Card>
  );
};
```

#### Thread Switching Interface

```typescript
// components/ThreadSwitcher.tsx
import { useThread } from "@assistant-ui/react";

const ThreadSwitcher = ({ threads }: { threads: WorkerThread[] }) => {
  const { switchToThread } = useThread();

  return (
    <div className="space-y-2">
      {threads.map((thread) => (
        <Card
          key={thread.threadId}
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => switchToThread(thread.threadId)}
        >
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{thread.name}</h4>
                <p className="text-sm text-gray-500">
                  {thread.messageCount} messages •{" "}
                  {thread.lastActivity.toLocaleString()}
                </p>
              </div>
              <StatusBadge status={thread.status} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

### Backend Integration

#### API Endpoints for Assistant-UI

```
# Assistant-UI specific endpoints
GET /api/assistant-ui/threads
- List threads formatted for Assistant-UI ThreadListAdapter
- Include metadata for Oven AI context

POST /api/assistant-ui/threads
- Create new thread and corresponding Oven AI task
- Initialize LangGraph thread and assistant

GET /api/assistant-ui/threads/{threadId}/messages
- Get conversation history for thread
- Format for Assistant-UI message interface

POST /api/assistant-ui/threads/{threadId}/runs/stream
- Proxy to LangGraph streaming endpoint
- Handle Oven AI specific context and tools

PUT /api/assistant-ui/threads/{threadId}/interrupt-response
- Handle human responses to interrupted tasks
- Resume LangGraph execution with user input
```

#### LangGraph Proxy Implementation

```typescript
// pages/api/assistant-ui/threads/[threadId]/runs/stream.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { threadId } = req.query;
  const { assistant_id, input, tools, stream_mode = "updates" } = req.body;

  // Set up SSE headers for streaming
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  try {
    // Forward request to LangGraph API
    const langGraphResponse = await fetch(
      `${process.env.LANGGRAPH_API_URL}/threads/${threadId}/runs/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LANGGRAPH_API_KEY}`,
        },
        body: JSON.stringify({
          assistant_id,
          input,
          tools,
          stream_mode,
        }),
      }
    );

    // Stream LangGraph response to client
    const reader = langGraphResponse.body?.getReader();
    if (!reader) throw new Error("No response stream");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      res.write(`data: ${chunk}\n\n`);
    }
  } catch (error) {
    res.write(
      `data: ${JSON.stringify({ event: "error", error: error.message })}\n\n`
    );
  } finally {
    res.end();
  }
}
```

### Benefits of Assistant-UI Integration

#### Replaced Components

1. **Custom Chat Interfaces** → Assistant-UI Thread component
2. **Message State Management** → Built-in LocalRuntime
3. **Conversation History** → Automatic persistence with ThreadListAdapter
4. **Message Editing/Regeneration** → Built-in features
5. **Streaming Implementation** → Built-in streaming support
6. **Multi-threading UI** → Built-in thread switching

#### Enhanced Features

- **Message Branching**: Users can edit messages and explore different conversation paths
- **Automatic Persistence**: All conversations saved automatically
- **Real-time Streaming**: Smooth streaming responses from LangGraph
- **Human-in-the-Loop**: Built-in interrupt handling for human input
- **Tool Calling UI**: Visual representation of tool usage
- **Attachment Support**: File upload and sharing capabilities
- **Accessibility**: Screen reader support and keyboard navigation

#### Development Benefits

- **Reduced Codebase**: ~70% less custom chat interface code
- **Faster Development**: Pre-built components and state management
- **Better UX**: Production-tested conversation interface
- **Easy Maintenance**: Updates handled by assistant-ui library
- **Type Safety**: Full TypeScript support with proper interfaces

---

## Dynamic Worker Specialization System

### Custom Specialization Creation

The platform allows users to create custom AI worker specializations tailored to their specific business needs:

#### Specialization Categories

- **Marketing & Sales**: Email marketing, social media, lead generation, customer outreach
- **Content & Creative**: Content creation, graphic design, video production, copywriting
- **Data & Analytics**: Data analysis, reporting, business intelligence, performance tracking
- **Development & Technical**: API integration, automation, quality assurance, technical support
- **Operations & Support**: Customer service, project management, administrative tasks
- **Finance & Business**: Financial analysis, accounting, budgeting, compliance
- **Custom Categories**: Users can create entirely new categories for unique business functions

#### Specialization Configuration

```typescript
interface CustomSpecialization {
  name: string;
  category: string;
  description: string;
  requiredSkills: string[];
  recommendedTools: string[];
  performanceMetrics: string[];
  organizationScope: "global" | "organization-specific";
  created_by: string;
}
```

### Dynamic Skill Assignment

Workers can be configured with custom skill sets that align with organizational needs:

- **Technical Skills**: API usage, data processing, content generation
- **Business Skills**: Industry knowledge, compliance requirements, communication styles
- **Tool Proficiencies**: Platform integrations, software competencies
- **Soft Skills**: Communication style, response patterns, decision-making approaches

### Performance Tracking by Specialization

Each custom specialization includes:

- **Specialized KPIs**: Metrics relevant to the specific role
- **Skill Utilization**: Tracking which skills are used most effectively
- **Tool Performance**: Success rates with different integration tools
- **Learning Patterns**: Continuous improvement based on task outcomes

## Global Technical Requirements

### Frontend Architecture

#### Technology Stack

- **Framework**: NextJS with TypeScript
- **State Management**: Context Library + Assistant-UI LocalRuntime
- **UI Library**: Shadcn/ui + Assistant-UI Thread components
- **Chat Interface**: Assistant-UI with custom LangGraph adapters
- **Real-time Updates**: Assistant-UI streaming + WebSocket for task status
- **Charts**: Recharts or Chart.js for data visualization
- **Forms**: React Hook Form with Yup validation

#### Component Architecture

```typescript
// Global state management with Assistant-UI integration
interface GlobalState {
  user: UserState;
  dashboard: DashboardState;
  organizations: OrganizationsState;
  processes: ProcessesState;
  workers: WorkersState;
  integrations: IntegrationsState;
  tasks: TasksState;
  knowledgeBase: KnowledgeBaseState;
  notifications: NotificationState;
  realtime: RealtimeState;
  // Assistant-UI runtime replaces custom chat state management
  assistantRuntime: {
    runtime: LocalRuntime;
    activeThreads: Map<string, Thread>;
    adapters: {
      langGraph: LangGraphChatAdapter;
      threadList: OvenThreadListAdapter;
      attachments: OvenAttachmentAdapter;
      tools: ProcessBlueprintToolAdapter;
    };
  };
}

// Real-time updates
interface RealtimeState {
  connected: boolean;
  subscriptions: string[];
  lastHeartbeat: Date;
  // Assistant-UI handles chat streaming internally
  taskStatusUpdates: WebSocket;
}

// Notification system
interface NotificationState {
  alerts: Alert[];
  toasts: Toast[];
  preferences: NotificationPreferences;
  // Assistant-UI handles conversation notifications
}

// Assistant-UI Runtime Provider for the entire app
interface OvenAIRuntimeProvider {
  children: React.ReactNode;
  config: {
    langGraphApiUrl: string;
    defaultAssistantId: string;
    enableStreaming: boolean;
    enableHumanInTheLoop: boolean;
    tools: ToolDefinition[];
  };
}
```
