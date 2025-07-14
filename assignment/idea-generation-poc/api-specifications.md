# API Specifications - Idea Generation Platform

## Base URL

```
https://api.ideagen.com/v1
```

## Authentication

All API requests require authentication using Bearer tokens:

```
Authorization: Bearer <your_api_token>
```

## Core Endpoints

### Projects

#### Create Project

```http
POST /projects
```

**Request Body:**

```json
{
  "name": "Mobile App Innovations",
  "description": "Generate innovative ideas for mobile applications",
  "industry": "Technology",
  "challenge": "User engagement and retention",
  "dataSourceIds": ["ds_001", "ds_002"],
  "aiPersonaIds": ["persona_001", "persona_002", "persona_003"]
}
```

**Response:**

```json
{
  "id": "proj_001",
  "name": "Mobile App Innovations",
  "description": "Generate innovative ideas for mobile applications",
  "industry": "Technology",
  "challenge": "User engagement and retention",
  "status": "planning",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "owner": {
    "id": "user_001",
    "name": "Sarah Johnson",
    "email": "sarah@company.com"
  }
}
```

#### Get Projects

```http
GET /projects
```

**Query Parameters:**

- `status`: Filter by status (planning, processing, generating, completed)
- `industry`: Filter by industry
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset

**Response:**

```json
{
  "projects": [
    {
      "id": "proj_001",
      "name": "Mobile App Innovations",
      "status": "processing",
      "industry": "Technology",
      "createdAt": "2024-01-15T10:00:00Z",
      "ideasGenerated": 12,
      "averageScore": 78.5
    }
  ],
  "total": 25,
  "hasMore": true
}
```

#### Get Project Details

```http
GET /projects/{projectId}
```

**Response:**

```json
{
  "id": "proj_001",
  "name": "Mobile App Innovations",
  "description": "Generate innovative ideas for mobile applications",
  "industry": "Technology",
  "challenge": "User engagement and retention",
  "status": "processing",
  "createdAt": "2024-01-15T10:00:00Z",
  "dataSources": [
    {
      "id": "ds_001",
      "name": "Market Research API",
      "type": "market_research",
      "status": "connected"
    }
  ],
  "aiPersonas": [
    {
      "id": "persona_001",
      "name": "The Visionary",
      "role": "Big picture thinking",
      "utilization": 78
    }
  ],
  "sessions": [
    {
      "id": "session_001",
      "name": "Initial Generation",
      "status": "completed",
      "ideasGenerated": 12,
      "startedAt": "2024-01-15T10:00:00Z",
      "completedAt": "2024-01-15T14:30:00Z"
    }
  ]
}
```

### Data Sources

#### Create Data Source

```http
POST /data-sources
```

**Request Body:**

```json
{
  "name": "Market Research API",
  "type": "market_research",
  "apiEndpoint": "https://api.marketresearch.com/v1",
  "credentials": {
    "apiKey": "encrypted_api_key",
    "secretKey": "encrypted_secret"
  },
  "configuration": {
    "industries": ["technology", "healthcare"],
    "regions": ["north_america", "europe"],
    "refreshInterval": "24h"
  }
}
```

**Response:**

```json
{
  "id": "ds_001",
  "name": "Market Research API",
  "type": "market_research",
  "status": "connected",
  "lastSync": "2024-01-15T08:00:00Z",
  "createdAt": "2024-01-15T08:00:00Z"
}
```

#### Get Data Sources

```http
GET /data-sources
```

**Response:**

```json
{
  "dataSources": [
    {
      "id": "ds_001",
      "name": "Market Research API",
      "type": "market_research",
      "status": "connected",
      "lastSync": "2024-01-15T08:00:00Z",
      "dataQuality": 92,
      "recordsCollected": 1547
    }
  ]
}
```

#### Test Data Source Connection

```http
POST /data-sources/{dataSourceId}/test
```

**Response:**

```json
{
  "status": "success",
  "responseTime": 245,
  "sampleData": {
    "recordCount": 100,
    "categories": ["market_trends", "consumer_behavior"],
    "lastUpdate": "2024-01-15T06:00:00Z"
  }
}
```

### AI Personas

#### Create AI Persona

```http
POST /ai-personas
```

**Request Body:**

```json
{
  "name": "The Visionary",
  "role": "Big picture thinking and disruptive innovation",
  "systemPrompt": "You are a visionary thinker who sees beyond current limitations...",
  "expertise": ["innovation", "technology", "market_disruption"],
  "thinkingStyle": "creative",
  "personality": "optimistic",
  "configuration": {
    "creativity": 0.9,
    "riskTolerance": 0.8,
    "focusAreas": ["emerging_tech", "user_experience"]
  }
}
```

**Response:**

```json
{
  "id": "persona_001",
  "name": "The Visionary",
  "role": "Big picture thinking and disruptive innovation",
  "expertise": ["innovation", "technology", "market_disruption"],
  "thinkingStyle": "creative",
  "personality": "optimistic",
  "createdAt": "2024-01-15T09:00:00Z",
  "metrics": {
    "ideasGenerated": 0,
    "averageScore": 0,
    "utilizationRate": 0
  }
}
```

#### Get AI Personas

```http
GET /ai-personas
```

**Response:**

```json
{
  "personas": [
    {
      "id": "persona_001",
      "name": "The Visionary",
      "role": "Big picture thinking and disruptive innovation",
      "thinkingStyle": "creative",
      "status": "active",
      "metrics": {
        "ideasGenerated": 156,
        "averageScore": 82.3,
        "utilizationRate": 78
      }
    }
  ]
}
```

### Idea Sessions

#### Start Idea Session

```http
POST /projects/{projectId}/sessions
```

**Request Body:**

```json
{
  "name": "Q1 Innovation Session",
  "configuration": {
    "maxIdeas": 20,
    "minScore": 70,
    "focusAreas": ["user_experience", "monetization"],
    "timeLimit": "4h"
  }
}
```

**Response:**

```json
{
  "id": "session_001",
  "name": "Q1 Innovation Session",
  "status": "starting",
  "stage": "data_retrieval",
  "startedAt": "2024-01-15T10:00:00Z",
  "estimatedCompletion": "2024-01-15T14:00:00Z",
  "websocketUrl": "wss://api.ideagen.com/sessions/session_001/stream"
}
```

#### Get Session Status

```http
GET /sessions/{sessionId}
```

**Response:**

```json
{
  "id": "session_001",
  "name": "Q1 Innovation Session",
  "status": "generating",
  "stage": "seed_generation",
  "progress": 65,
  "startedAt": "2024-01-15T10:00:00Z",
  "estimatedCompletion": "2024-01-15T14:00:00Z",
  "statistics": {
    "seedsGenerated": 8,
    "fullIdeasDeveloped": 3,
    "averageScore": 76.2,
    "dataInsightsProcessed": 145
  }
}
```

#### Get Session Results

```http
GET /sessions/{sessionId}/results
```

**Response:**

```json
{
  "session": {
    "id": "session_001",
    "status": "completed",
    "completedAt": "2024-01-15T14:30:00Z"
  },
  "seeds": [
    {
      "id": "seed_001",
      "title": "AI-Powered Personal Assistant",
      "description": "A mobile app that learns user preferences...",
      "category": "productivity",
      "confidenceScore": 0.85,
      "generatedBy": "persona_001",
      "createdAt": "2024-01-15T11:15:00Z"
    }
  ],
  "ideas": [
    {
      "id": "idea_001",
      "title": "AI-Powered Customer Service Chatbot",
      "description": "An intelligent chatbot that provides 24/7 customer support...",
      "problem": "Long customer service wait times",
      "solution": "AI-powered instant response system",
      "marketOpportunity": "Customer service automation market worth $5.8B",
      "targetAudience": "SMBs and enterprises",
      "implementation": "Phase 1: Core AI engine, Phase 2: Integration APIs...",
      "scores": {
        "feasibility": 92,
        "marketPotential": 96,
        "uniqueness": 88,
        "overall": 94
      },
      "createdAt": "2024-01-15T13:20:00Z"
    }
  ]
}
```

### Real-time Updates (WebSocket)

#### Session Updates

```javascript
// Connect to session stream
const ws = new WebSocket('wss://api.ideagen.com/sessions/session_001/stream');

// Message types received:
{
  "type": "stage_update",
  "stage": "data_retrieval",
  "progress": 25,
  "message": "Processing market research data..."
}

{
  "type": "seed_generated",
  "seed": {
    "id": "seed_001",
    "title": "AI-Powered Personal Assistant",
    "description": "A mobile app that learns user preferences...",
    "confidenceScore": 0.85
  }
}

{
  "type": "idea_completed",
  "idea": {
    "id": "idea_001",
    "title": "AI-Powered Customer Service Chatbot",
    "scores": {
      "overall": 94
    }
  }
}

{
  "type": "persona_message",
  "persona": "The Visionary",
  "message": "I'm seeing strong potential in AI-powered solutions...",
  "timestamp": "2024-01-15T11:30:00Z"
}
```

### Idea Management

#### Get Ideas

```http
GET /ideas
```

**Query Parameters:**

- `projectId`: Filter by project
- `sessionId`: Filter by session
- `category`: Filter by category
- `minScore`: Minimum overall score
- `sortBy`: Sort by score, date, or category
- `limit`: Number of results
- `offset`: Pagination offset

**Response:**

```json
{
  "ideas": [
    {
      "id": "idea_001",
      "title": "AI-Powered Customer Service Chatbot",
      "category": "customer_experience",
      "scores": {
        "overall": 94
      },
      "createdAt": "2024-01-15T13:20:00Z",
      "project": {
        "id": "proj_001",
        "name": "Mobile App Innovations"
      }
    }
  ],
  "total": 247,
  "hasMore": true
}
```

#### Get Idea Details

```http
GET /ideas/{ideaId}
```

**Response:**

```json
{
  "id": "idea_001",
  "title": "AI-Powered Customer Service Chatbot",
  "description": "An intelligent chatbot that provides 24/7 customer support...",
  "problem": "Long customer service wait times",
  "solution": "AI-powered instant response system",
  "marketOpportunity": "Customer service automation market worth $5.8B",
  "targetAudience": "SMBs and enterprises",
  "implementation": "Phase 1: Core AI engine, Phase 2: Integration APIs...",
  "scores": {
    "feasibility": 92,
    "marketPotential": 96,
    "uniqueness": 88,
    "overall": 94
  },
  "seed": {
    "id": "seed_001",
    "title": "AI-Powered Personal Assistant"
  },
  "session": {
    "id": "session_001",
    "name": "Q1 Innovation Session"
  },
  "evaluations": [
    {
      "id": "eval_001",
      "type": "human_feedback",
      "score": 92,
      "feedback": "Excellent market potential and feasibility",
      "evaluatedBy": "user_001",
      "createdAt": "2024-01-15T15:00:00Z"
    }
  ],
  "createdAt": "2024-01-15T13:20:00Z"
}
```

### Evaluations

#### Add Evaluation

```http
POST /ideas/{ideaId}/evaluations
```

**Request Body:**

```json
{
  "type": "human_feedback",
  "score": 92,
  "feedback": "Excellent market potential and feasibility",
  "criteria": "market_potential"
}
```

**Response:**

```json
{
  "id": "eval_001",
  "type": "human_feedback",
  "score": 92,
  "feedback": "Excellent market potential and feasibility",
  "criteria": "market_potential",
  "evaluatedBy": "user_001",
  "createdAt": "2024-01-15T15:00:00Z"
}
```

### Export & Implementation

#### Export Ideas

```http
POST /ideas/export
```

**Request Body:**

```json
{
  "ideaIds": ["idea_001", "idea_002"],
  "format": "powerpoint",
  "template": "business_presentation",
  "options": {
    "includeMetrics": true,
    "includeImplementation": true,
    "branding": "company_template"
  }
}
```

**Response:**

```json
{
  "exportId": "export_001",
  "status": "processing",
  "format": "powerpoint",
  "estimatedCompletion": "2024-01-15T16:00:00Z",
  "downloadUrl": null
}
```

#### Get Export Status

```http
GET /exports/{exportId}
```

**Response:**

```json
{
  "id": "export_001",
  "status": "completed",
  "format": "powerpoint",
  "downloadUrl": "https://api.ideagen.com/exports/export_001/download",
  "expiresAt": "2024-01-22T16:00:00Z",
  "createdAt": "2024-01-15T15:45:00Z"
}
```

### Analytics

#### Get Dashboard Analytics

```http
GET /analytics/dashboard
```

**Response:**

```json
{
  "kpis": {
    "activeProjects": 12,
    "ideasGenerated": 247,
    "successRate": 0.76,
    "averageProcessingTime": "4.2h"
  },
  "trends": {
    "projectsCreated": [
      { "date": "2024-01-01", "value": 8 },
      { "date": "2024-01-02", "value": 12 }
    ],
    "ideasGenerated": [
      { "date": "2024-01-01", "value": 45 },
      { "date": "2024-01-02", "value": 67 }
    ]
  },
  "topCategories": [
    { "category": "technology", "count": 89 },
    { "category": "customer_experience", "count": 67 }
  ]
}
```

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

### Common Error Codes

- `AUTHENTICATION_ERROR` (401)
- `AUTHORIZATION_ERROR` (403)
- `VALIDATION_ERROR` (400)
- `RESOURCE_NOT_FOUND` (404)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_SERVER_ERROR` (500)
- `SERVICE_UNAVAILABLE` (503)

## Rate Limiting

### Limits

- Standard: 1000 requests/hour
- Premium: 5000 requests/hour
- Enterprise: 20000 requests/hour

### Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642291200
```

## Pagination

### Request Parameters

```
?limit=20&offset=40
```

### Response Structure

```json
{
  "data": [...],
  "pagination": {
    "total": 247,
    "limit": 20,
    "offset": 40,
    "hasMore": true
  }
}
```

## Webhooks

### Supported Events

- `project.created`
- `project.completed`
- `session.started`
- `session.completed`
- `idea.generated`
- `idea.evaluated`

### Webhook Payload

```json
{
  "event": "idea.generated",
  "data": {
    "id": "idea_001",
    "title": "AI-Powered Customer Service Chatbot",
    "projectId": "proj_001",
    "sessionId": "session_001",
    "scores": {
      "overall": 94
    }
  },
  "timestamp": "2024-01-15T13:20:00Z"
}
```
