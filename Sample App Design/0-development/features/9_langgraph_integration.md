# LangGraph Integration Architecture

## 1. Integration Overview

This document details how the Oven AI platform integrates with **LangGraph** via its HTTP Assistants API. This integration is the cornerstone of our architecture, allowing us to leverage enterprise-grade AI agent capabilities without building complex execution infrastructure.

## 2. Architectural Benefits

### 2.1. Reduced Development Complexity

By using LangGraph, we eliminate the need to build:

- **State Management:** LangGraph handles conversation state, memory, and context persistence
- **Tool Execution:** Complex tool calling, error handling, and retry logic
- **Async Processing:** Multi-step workflows and long-running operations
- **Message Routing:** Intelligent routing between different agent capabilities
- **Conversation History:** Storage and retrieval of conversation threads
- **Streaming Responses:** Real-time message streaming to clients

**Development Impact:** Reduces backend complexity by approximately 70%, allowing focus on business logic.

### 2.2. Enterprise Scalability

LangGraph provides:

- **Horizontal Scaling:** Automatic scaling of agent execution
- **Resource Management:** Efficient CPU and memory utilization
- **Load Balancing:** Distribution of requests across multiple instances
- **Fault Tolerance:** Automatic recovery from failures
- **Performance Optimization:** Optimized execution paths and caching

### 2.3. Flexibility and Maintainability

- **Decoupled Updates:** Modify agent logic without touching the main application
- **A/B Testing:** Test different agent configurations simultaneously
- **Version Control:** Manage different versions of agent implementations
- **Hot Swapping:** Update agents without downtime

## 3. Integration Architecture

### 3.1. Proxy Pattern

Our application acts as a **smart proxy** between the frontend and LangGraph:

```
Frontend (assistant-ui) ↔ Our Backend (Proxy) ↔ LangGraph API
```

**Our Backend Responsibilities:**

- Authentication and authorization
- Organization-scoped data management
- Business logic validation
- Credential management for integrations
- Metric collection and analytics

**LangGraph Responsibilities:**

- AI agent execution
- Conversation state management
- Tool calling and integration
- Message history storage
- Streaming response handling

### 3.2. Data Flow

#### Creating a Task (Conversation)

1. User creates task in our UI
2. Our backend validates request and organization
3. Backend calls LangGraph to create assistant with worker configuration
4. Backend creates thread in LangGraph
5. Backend stores `assistant_id` and `thread_id` in our database
6. Frontend receives task metadata

#### Sending Messages

1. Frontend sends message via our API
2. Backend validates and proxies to LangGraph `POST /threads/{thread_id}/runs`
3. LangGraph processes message and streams response
4. Backend streams response back to frontend
5. assistant-ui renders streaming response in real-time

### 3.3. API Mapping

Our APIs map to LangGraph APIs as follows:

| Our API                         | LangGraph API                                       | Purpose                 |
| ------------------------------- | --------------------------------------------------- | ----------------------- |
| `POST /api/tasks`               | `POST /assistants` + `POST /threads`                | Create new conversation |
| `POST /api/tasks/:id/messages`  | `POST /threads/{thread_id}/runs`                    | Send message            |
| `GET /api/tasks/:id/messages`   | `GET /threads/{thread_id}/messages`                 | Get history             |
| `POST /api/tasks/:id/interrupt` | `POST /threads/{thread_id}/runs/{run_id}/interrupt` | Stop execution          |

## 4. Worker Configuration Integration

### 4.1. Assistant Creation

When creating a LangGraph assistant from a Worker configuration:

```typescript
// Our Worker configuration
const worker = {
  systemPrompt: "You are a helpful customer service agent...",
  model: "gpt-4",
  temperature: 0.7,
  enabledIntegrations: ["slack", "calendar"],
};

// Translated to LangGraph assistant creation
const assistantRequest = {
  name: worker.name,
  instructions: worker.systemPrompt,
  model: worker.model,
  temperature: worker.temperature,
  tools: await getToolsForIntegrations(worker.enabledIntegrations),
};
```

### 4.2. Tool Configuration

For each enabled integration, our backend:

1. Retrieves encrypted credentials from our database
2. Configures the corresponding tool with credentials
3. Passes tools array to LangGraph assistant creation

```typescript
async function getToolsForIntegrations(integrationIds: string[]) {
  const tools = [];

  for (const integrationId of integrationIds) {
    const credentials = await getCredentials(integrationId);
    const tool = await configureTool(integrationId, credentials);
    tools.push(tool);
  }

  return tools;
}
```

## 5. Knowledge Base Integration

### 5.1. RAG Implementation

The Knowledge Base integrates with LangGraph through a retrieval tool:

1. **Vector Search Tool:** Created as a LangGraph tool that can query our vector database
2. **Query Processing:** When assistant needs information, it calls the retrieval tool
3. **Context Injection:** Relevant documents are returned as context to the assistant

### 5.2. Tool Configuration

```typescript
const retrievalTool = {
  name: "knowledge_search",
  description:
    "Search the organization's knowledge base for relevant information",
  parameters: {
    query: "string",
    max_results: "number",
  },
  implementation: async (query, maxResults) => {
    const vectors = await vectorDB.search(query, maxResults);
    return vectors.map((v) => v.content);
  },
};
```

## 6. Error Handling and Resilience

### 6.1. LangGraph API Failures

Our proxy handles various failure scenarios:

- **Connection Timeouts:** Graceful degradation with user notification
- **Rate Limiting:** Exponential backoff and queuing
- **Service Unavailable:** Fallback messaging and retry logic
- **Invalid Requests:** Validation before proxying

### 6.2. State Synchronization

Periodic sync between our database and LangGraph:

- **Task Status Updates:** Poll LangGraph for conversation states
- **Message Count Tracking:** For metrics and billing
- **Error State Detection:** Identify and handle failed conversations

## 7. Performance Considerations

### 7.1. Caching Strategy

- **Assistant Configurations:** Cache frequently used worker configs
- **Tool Definitions:** Cache tool configurations per organization
- **Credentials:** Secure caching of decrypted credentials (short TTL)

### 7.2. Connection Optimization

- **Connection Pooling:** Reuse HTTP connections to LangGraph
- **Request Batching:** Where possible, batch requests to reduce latency
- **Streaming Optimization:** Minimize proxy overhead for streaming responses

## 8. Security Considerations

### 8.1. Credential Management

- **Secure Storage:** All integration credentials encrypted at rest
- **Just-in-Time Decryption:** Decrypt credentials only when creating assistants
- **Credential Rotation:** Support for updating credentials without downtime

### 8.2. API Security

- **Authentication:** Validate user permissions before proxying to LangGraph
- **Input Sanitization:** Clean and validate all inputs before forwarding
- **Rate Limiting:** Prevent abuse through our proxy layer

## 9. Monitoring and Observability

### 9.1. Metrics Collection

Track key metrics across the integration:

- **Proxy Response Times:** Time spent in our layer vs LangGraph
- **Success Rates:** Failed vs successful API calls
- **Token Usage:** Track LLM token consumption for billing
- **Tool Usage:** Which integrations are most frequently used

### 9.2. Logging Strategy

- **Request/Response Logging:** Log proxy requests (without sensitive data)
- **Error Tracking:** Comprehensive error logging and alerting
- **Performance Logging:** Track slow requests and bottlenecks

## 10. Development Workflow

### 10.1. Local Development

For local development against LangGraph:

1. **LangGraph Cloud:** Use development tier for testing
2. **Mock Responses:** Create mock LangGraph responses for offline development
3. **Integration Testing:** Automated tests against staging LangGraph instance

### 10.2. Deployment Strategy

- **Environment Separation:** Different LangGraph instances for dev/staging/prod
- **Configuration Management:** Environment-specific LangGraph endpoints
- **Rollback Strategy:** Quick rollback if LangGraph integration issues arise

This integration architecture provides a robust, scalable foundation for the Oven AI platform while dramatically reducing development complexity and time-to-market.
