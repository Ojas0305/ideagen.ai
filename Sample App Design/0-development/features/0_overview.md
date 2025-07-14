# Oven AI Platform - Development Overview

## 1. Platform Introduction

**Oven AI** is a comprehensive platform for managing AI-powered workflows and autonomous agents. The platform enables organizations to create, deploy, and manage AI workers that can execute complex business processes through conversational interfaces.

## 2. Core Concepts

### 2.1. Key Entities

The platform is built around several core entities that work together:

- **Organizations:** Dynamic, hierarchical structures that users define to organize their work
- **Workers:** Configurable AI agents with specific capabilities, prompts, and tool access
- **Process Blueprints:** Non-executable templates that define common workflows
- **Tasks:** Live, asynchronous conversation threads where AI workers execute processes
- **Integrations:** Connections to external tools and APIs that expand worker capabilities
- **Knowledge Base:** Repository of documents and information for AI workers to reference

### 2.2. Architecture Philosophy

The platform follows a **proxy architecture** where:

- **LangGraph** handles all AI execution, state management, and conversation history
- **assistant-ui** provides the frontend chat interface
- **Our application** acts as a business logic layer and proxy to LangGraph

This approach dramatically reduces complexity while providing enterprise-grade AI capabilities.

## 3. Feature Relationships

### 3.1. Foundation Layer

1. **Organizations** (`1_organizations.md`) - Must be implemented first as all other entities belong to an organization
2. **Integrations** (`5_integrations.md`) - External tool connections that workers can use

### 3.2. Configuration Layer

3. **Workers** (`7_workers.md`) - AI agent configurations and capabilities
4. **Process Blueprints** (`3_process_blueprints.md`) - Workflow templates
5. **Knowledge Base** (`6_knowledge_base.md`) - Information repository for AI workers

### 3.3. Execution Layer

6. **Tasks** (`4_async_thread_management.md`) - Live conversation threads powered by workers
7. **Performance Metrics** (`2_performance_metrics.md`) - Monitoring and analytics dashboard

## 4. User Journey

### 4.1. Setup Phase

1. **Create Organization:** User defines their organizational structure
2. **Configure Integrations:** Connect to external tools (Google Calendar, Slack, etc.)
3. **Upload Knowledge:** Add documents and information to the knowledge base
4. **Create Workers:** Define AI agents with specific capabilities and personalities

### 4.2. Execution Phase

5. **Create Tasks:** Start conversations with AI workers to execute processes
6. **Monitor Performance:** Track efficiency and effectiveness through the metrics dashboard
7. **Iterate:** Refine workers and processes based on performance data

## 5. Technology Stack

### 5.1. Core Technologies

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Node.js/Python, REST APIs
- **Database:** PostgreSQL with proper relational design
- **AI Execution:** LangGraph via HTTP Assistants API
- **Chat UI:** assistant-ui library
- **Vector Storage:** Pinecone/ChromaDB for knowledge base

### 5.2. Key Integrations

- **LangGraph:** Handles all AI agent execution and state management
- **assistant-ui:** Provides streaming chat interface components
- **Vector Database:** Enables RAG (Retrieval-Augmented Generation) capabilities

## 6. Development Benefits

By leveraging LangGraph and assistant-ui, this architecture provides:

- **Reduced Complexity:** Offload the hardest parts of building agentic systems
- **Scalability:** LangGraph is designed for enterprise-scale AI execution
- **Flexibility:** Update AI logic without redeploying the main application
- **Speed to Market:** Focus on business logic instead of AI infrastructure
- **Proven Components:** Use battle-tested libraries for critical functionality

## 7. Next Steps

To begin development, proceed to the Implementation Workflow (`8_implementation_workflow.md`) which outlines the recommended order of feature development and setup instructions.
