// Core type definitions for the Idea Generation Platform

export interface User {
    id: string
    email: string
    name: string
    role: 'user' | 'admin' | 'manager'
    avatar_url?: string
    created_at: string
    updated_at: string
}

export interface Project {
    id: string
    name: string
    description?: string
    industry?: string
    challenge?: string
    status: 'planning' | 'processing' | 'generating' | 'completed' | 'paused'
    owner_id: string
    created_at: string
    updated_at: string
    owner?: User
    dataSources?: DataSource[]
    aiPersonas?: AIPersona[]
    sessions?: IdeaSession[]
}

export interface DataSource {
    id: string
    name: string
    type: 'market_research' | 'social_media' | 'competitor_analysis' | 'industry_reports' | 'custom_api'
    api_endpoint?: string
    credentials?: Record<string, any>
    configuration?: Record<string, any>
    status: 'connected' | 'disconnected' | 'error' | 'syncing'
    last_sync?: string
    data_quality: number
    records_collected: number
    created_at: string
    updated_at: string
}

export interface AIPersona {
    id: string
    name: string
    role: string
    system_prompt: string
    expertise: string[]
    thinking_style: 'creative' | 'analytical' | 'critical' | 'practical'
    personality: 'optimistic' | 'realistic' | 'cautious' | 'aggressive'
    configuration?: Record<string, any>
    metrics?: {
        ideas_generated: number
        average_score: number
        utilization_rate: number
    }
    is_default: boolean
    created_at: string
    updated_at: string
}

export interface IdeaSession {
    id: string
    project_id: string
    name: string
    status: 'pending' | 'starting' | 'data_retrieval' | 'processing' | 'seed_generation' | 'idea_development' | 'completed' | 'failed'
    stage: 'data_retrieval' | 'processing' | 'seed_generation' | 'idea_development' | 'completed'
    progress: number
    configuration?: Record<string, any>
    statistics?: {
        seeds_generated: number
        full_ideas_developed: number
        average_score: number
        data_insights_processed: number
    }
    started_at?: string
    completed_at?: string
    estimated_completion?: string
    created_at: string
    updated_at: string
    project?: Project
    seeds?: IdeaSeed[]
    ideas?: FullIdea[]
}

export interface IdeaSeed {
    id: string
    session_id: string
    ai_persona_id?: string
    title: string
    description: string
    category?: string
    confidence_score: number
    generated_by: string
    tags: string[]
    metadata?: Record<string, any>
    created_at: string
    session?: IdeaSession
    ai_persona?: AIPersona
}

export interface FullIdea {
    id: string
    session_id: string
    seed_id?: string
    ai_persona_id?: string
    title: string
    description: string
    problem?: string
    solution?: string
    market_opportunity?: string
    target_audience?: string
    implementation?: string
    feasibility_score: number
    market_score: number
    uniqueness_score: number
    overall_score: number
    category?: string
    tags: string[]
    metadata?: Record<string, any>
    created_at: string
    updated_at: string
    session?: IdeaSession
    seed?: IdeaSeed
    ai_persona?: AIPersona
    evaluations?: Evaluation[]
}

export interface Evaluation {
    id: string
    idea_id: string
    type: 'human_feedback' | 'ai_analysis' | 'market_validation' | 'technical_review'
    score?: number
    feedback?: string
    criteria?: string
    evaluated_by?: string
    evaluator_name?: string
    metadata?: Record<string, any>
    created_at: string
    idea?: FullIdea
}

export interface DataInsight {
    id: string
    data_source_id: string
    session_id: string
    source: string
    content: string
    category?: string
    sentiment?: 'positive' | 'negative' | 'neutral'
    relevance: number
    metadata?: Record<string, any>
    extracted_at: string
    created_at: string
    dataSource?: DataSource
    session?: IdeaSession
}

export interface SessionEvent {
    id: string
    session_id: string
    event_type: 'stage_update' | 'seed_generated' | 'idea_completed' | 'persona_message' | 'error'
    data: Record<string, any>
    timestamp: string
}

export interface ExportJob {
    id: string
    user_id: string
    idea_ids: string[]
    format: 'pdf' | 'powerpoint' | 'word' | 'json'
    template: string
    options?: Record<string, any>
    status: 'pending' | 'processing' | 'completed' | 'failed'
    download_url?: string
    expires_at?: string
    created_at: string
    updated_at: string
}

// API Response types
export interface ApiResponse<T> {
    data?: T
    error?: {
        code: string
        message: string
        details?: any[]
    }
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        total: number
        limit: number
        offset: number
        hasMore: boolean
    }
}

// Dashboard Analytics types
export interface DashboardAnalytics {
    kpis: {
        activeProjects: number
        ideasGenerated: number
        successRate: number
        averageProcessingTime: string
    }
    trends: {
        projectsCreated: { date: string; value: number }[]
        ideasGenerated: { date: string; value: number }[]
    }
    topCategories: { category: string; count: number }[]
}

// WebSocket message types
export interface WebSocketMessage {
    type: 'stage_update' | 'seed_generated' | 'idea_completed' | 'persona_message' | 'error'
    data: any
    timestamp: string
}

// Form types
export interface CreateProjectForm {
    name: string
    description?: string
    industry?: string
    challenge?: string
    dataSourceIds: string[]
    aiPersonaIds: string[]
}

export interface CreateSessionForm {
    name: string
    configuration: {
        maxIdeas: number
        minScore: number
        focusAreas: string[]
        timeLimit: string
    }
}

export interface CreateDataSourceForm {
    name: string
    type: DataSource['type']
    apiEndpoint?: string
    credentials?: Record<string, any>
    configuration?: Record<string, any>
}

export interface CreateAIPersonaForm {
    name: string
    role: string
    systemPrompt: string
    expertise: string[]
    thinkingStyle: AIPersona['thinking_style']
    personality: AIPersona['personality']
    configuration?: Record<string, any>
}

export interface EvaluationForm {
    type: Evaluation['type']
    score?: number
    feedback?: string
    criteria?: string
}

export interface ExportForm {
    ideaIds: string[]
    format: ExportJob['format']
    template: string
    options?: {
        includeMetrics: boolean
        includeImplementation: boolean
        branding?: string
    }
} 