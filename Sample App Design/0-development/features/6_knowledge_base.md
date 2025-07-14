# Feature: Knowledge Base for RAG

## 1. Purpose

The "Knowledge Base" feature provides a repository for documents and structured information. This content can then be used by AI workers to answer questions and complete tasks, implementing a Retrieval-Augmented Generation (RAG) pattern.

## 2. Frontend Requirements

### 2.1. TypeScript Interface

```typescript
// src/types/knowledge.ts
export interface KnowledgeDocument {
  id: string;
  name: string;
  type: "pdf" | "txt" | "md" | "url";
  status: "processing" | "ready" | "error";
  organizationId: string;
  createdAt: string;
}
```

### 2.2. User Interface (UI)

- **File Upload:** A UI component to allow users to upload documents (PDF, TXT, etc.) to the knowledge base. Show upload progress.
- **URL Ingestion:** An input field to submit a URL to be scraped and added to the knowledge base.
- **Document List:** A view to list all documents in the knowledge base, showing their name, type, and processing status.
- **Management:** Functionality to delete documents from the knowledge base.

## 3. Backend Requirements

### 3.1. API Endpoints

- `POST /api/knowledge/upload`: Endpoint to handle file uploads. This should be a multipart/form-data endpoint.
- `POST /api/knowledge/ingest-url`: Endpoint to ingest data from a URL.
  - Body: `{ url: string; }`
- `GET /api/knowledge`: List all documents for an organization.
- `DELETE /api/knowledge/:id`: Delete a document and its associated vectorized data.

### 3.2. Backend Logic & Architecture

This is a multi-step process that happens asynchronously after a document is uploaded.

1.  **File Storage:** Store the original uploaded file in a persistent object store (like AWS S3 or Google Cloud Storage).
2.  **Document Parsing:** Extract text content from the uploaded files (e.g., using `PyPDF2` for PDFs, or a scraper for URLs).
3.  **Text Chunking:** Split the extracted text into smaller, meaningful chunks.
4.  **Vectorization (Embedding):** Use a sentence-transformer model or an embedding API (like OpenAI's) to convert each text chunk into a vector.
5.  **Vector Storage:** Store the vectors and their corresponding text chunks in a specialized **Vector Database** (e.g., Pinecone, Weaviate, ChromaDB).
6.  **Asynchronous Processing:** Use a background job queue (e.g., Celery, BullMQ) to manage steps 2-5, as they can be time-consuming. The API should return immediately after upload, and the UI should reflect the "processing" status.

### 3.3. Integration with LangGraph

- The ultimate goal is for the LangGraph assistants to query this knowledge base.
- This is typically implemented by creating a "retrieval" tool that is given to the assistant.
- When the assistant decides to use this tool, it formulates a query. The tool's code (running on the LangGraph side) will:
  1.  Take the query string.
  2.  Convert it to a vector using the same embedding model.
  3.  Query the Vector DB to find the most similar text chunks.
  4.  Return these chunks as context to the assistant.

### 3.4. Database Schema

**`knowledge_documents` table:**

- `id` (PK)
- `name` (String)
- `type` (String)
- `status` (String: 'processing', 'ready', 'error')
- `storage_path` (String, path to original file in S3)
- `organization_id` (FK)
- `created_at` (Timestamp)
