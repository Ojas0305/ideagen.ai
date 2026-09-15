# Setup

## Prerequisites

- A free [Supabase](https://supabase.com) account
- An [OpenAI](https://platform.openai.com) API key

## Database

1. Create a new Supabase project and wait for it to finish provisioning.
2. Open the project's SQL Editor.
3. Run each file in `supabase/migrations/` in order, pasting the contents and executing one at a time:
   - `001_create_basic_tables.sql`: core tables (projects, personas, data sources, sessions, ideas) and the four default AI personas
   - `002_remove_auth.sql`: this app has no authentication; this migration opens up table access accordingly
   - `003_add_evaluation_columns.sql`: scoring columns (feasibility, market potential, uniqueness) and the problem/solution/market/audience/implementation fields
   - `004_add_persona_conversations.sql`: persona discussion threads
   - `005_add_persona_id_to_ideas.sql`: links each idea back to the persona that generated it

## Environment variables

```bash
cd idea-generation-app
cp .env.example .env.local
```

Fill in `.env.local`:

- **Required:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (all from your Supabase project's Settings > API), and `OPENAI_API_KEY`.
- **Optional:** the news, market data, and social media keys. Each one falls back to sample data if left blank, see the root [README](../README.md) for what each does.

## Running it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Notes

- **No authentication.** This is a single-user demo, there's no login screen and no per-user data separation.
- **Stack:** Next.js 15 (App Router) + TypeScript, Tailwind CSS, Radix UI, Supabase (PostgreSQL), OpenAI GPT-4 with a GPT-3.5 fallback.

See the root [README](../README.md) for what the app actually does, and [API_KEYS_SETUP.md](API_KEYS_SETUP.md) for where to get each optional API key.
