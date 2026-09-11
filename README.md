# IdeaGen AI

A multi-persona AI brainstorming tool. Instead of asking one chatbot for one generic answer, IdeaGen AI runs four AI personas, each with a distinct personality, that research a problem, propose competing business ideas, and then debate them in a simulated group discussion before you pick a winner.

## How it works

You describe a company, an industry, and a problem you're trying to solve. From there, the app:

1. Pulls real-world context: live news, market and stock data for the industry, and Reddit discussion trends, so the ideas are grounded in current information rather than generated blind.
2. Generates four competing seed ideas, one per persona, each shaped by that persona's personality settings (creativity, risk tolerance) and informed by the market data above.
3. Expands the strongest seeds into full business concepts: problem statement, solution, market size, target audience, and an implementation plan.
4. Scores every idea on feasibility, market potential, uniqueness, and overall viability.
5. Runs a simulated persona discussion, two rounds of the four personas reacting to and critiquing each idea, stored as a readable chat thread.
6. Streams all of this to a live-updating Idea Workspace so you can watch the pipeline run end to end.

## The four personas

| Persona | Role |
|---|---|
| **The Visionary** | Bold, blue-sky thinking |
| **The Analyst** | Data-driven, cautious about feasibility |
| **The Critic** | Pokes holes, flags risks |
| **The Customer Advocate** | Always asks "but does the user actually want this?" |

Each persona's creativity level, risk tolerance, and expertise are configurable and fed directly into GPT-4 as instructions. That's why their output reads as genuinely different perspectives instead of four variations of the same answer.

## App pages

- **Dashboard**: KPIs (active projects, ideas generated, success rate), a pipeline view of projects by stage, and health status of the AI personas and data connectors.
- **Data Sources**: shows which external APIs are configured, with a live test button to preview the data they'd return.
- **AI Personas**: screen for creating and editing personas (prompt, personality, expertise).
- **Evaluation**: generated ideas ranked by score, plus a manual entry mode to score your own idea.
- **Export**: planned, not yet built.

## Tech stack

- **Frontend/Backend**: Next.js (App Router) and TypeScript, Tailwind CSS, Radix UI
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4, with GPT-3.5 fallback
- **External data**: NewsData.io / Mediastack (news), Financial Modeling Prep / Twelve Data (market data), Reddit. Each source falls back to realistic sample data if a key isn't configured, so the app runs without any external keys set up.

## Getting started

```bash
cd idea-generation-app
npm install
# create .env.local with the variables listed below
npm run dev
```

See [`idea-generation-app/SETUP.md`](idea-generation-app/SETUP.md) for full database setup instructions, and [`idea-generation-app/API_KEYS_SETUP.md`](idea-generation-app/API_KEYS_SETUP.md) for the optional external data API keys.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `OPENAI_API_KEY` | Yes | Powers persona generation, scoring, and discussions |
| `NEWS_DATA_API_KEY`, `MEDIASTACK_API_KEY` | No | Live news context; falls back to sample data |
| `FMP_API_KEY` / Twelve Data key | No | Live market/stock context; falls back to sample data |

## Project structure

```
idea-generation-app/   # the actual application (Next.js)
assignment/            # early planning docs: architecture, API spec, DB schema
```

## Known limitations

This is a personal project, built and iterated on solo after an initial MVP pass with a mentor. A few deliberate trade-offs worth knowing about if you read the code:

- **No authentication.** This is currently a single-user demo. There's no login and no row-level access control.
- **Synchronous pipeline.** Idea generation runs inline inside the API request rather than through a real job queue, so the UI polls for progress instead of receiving push updates. There's an unused Redis/Bull queue scaffold in the codebase from an earlier design that was never wired up.
- **Export page is a placeholder.** Not implemented yet.

## License

MIT. See [LICENSE](LICENSE).
