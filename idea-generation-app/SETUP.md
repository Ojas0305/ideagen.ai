# Setup Instructions for IdeaGen AI

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **OpenAI API Key**: Get your API key from [platform.openai.com](https://platform.openai.com)

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be ready (2-3 minutes)

### 2. Run Database Migration

1. Go to your project's SQL Editor in the Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and execute the SQL to create all tables, indexes, and sample data

### 3. Configure Environment Variables

1. In your Supabase project dashboard, go to Settings > API
2. Copy your project URL and keys
3. Create `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="IdeaGen AI"
```

## Running the Application

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev -- -p 3001
   ```

3. Open [http://localhost:3001](http://localhost:3001) in your browser

## Features to Test

### Phase 1 - Database & Auth ( Ready)

- [x] User registration and login
- [x] Project creation and management
- [x] AI personas configuration
- [x] Data sources setup

### Phase 2 - AI Integration ( Next)

- [ ] Real OpenAI API calls for persona conversations
- [ ] Idea generation pipeline with real AI
- [ ] Data source connectors for external APIs

### Phase 3 - Advanced Features (📋 Planned)

- [ ] Real-time collaboration
- [ ] Advanced analytics
- [ ] Export functionality
- [ ] File upload and processing

## Architecture

The application uses:

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Database**: Supabase (PostgreSQL with real-time features)
- **AI**: OpenAI GPT-4 for persona conversations
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## Development Workflow

1. **Mock to Real**: Systematically replace mock data with real database operations
2. **Test Driven**: Test each feature thoroughly before moving to the next
3. **Incremental**: Build and deploy features incrementally

## Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure all required variables are set
2. **Database Connection**: Verify Supabase URL and keys are correct
3. **CORS Issues**: Check Supabase project settings for allowed origins
4. **API Limits**: Monitor OpenAI usage to avoid rate limits

### Getting Help

- Check the browser console for detailed error messages
- Verify database tables exist by checking Supabase Table Editor
- Test API endpoints using the built-in API routes

## Next Steps

After completing the setup:

1. Test user registration and login
2. Create a sample project
3. Configure AI personas
4. Run the idea generation pipeline
5. Review generated ideas and analytics

The application is designed to be production-ready with proper error handling, security, and scalability considerations.
