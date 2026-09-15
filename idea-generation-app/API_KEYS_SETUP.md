# Optional API keys

None of these are required to run the app. Every data source falls back to
realistic sample data if its key is missing, this just controls whether
the Dashboard and Idea Workspace pull live data or demo data. Add whichever
ones you want to `idea-generation-app/.env.local`.

| Variable | Source | Used for |
|---|---|---|
| `NEWS_DATA_API_KEY` | [newsdata.io](https://newsdata.io) | Live industry news |
| `MEDIASTACK_API_KEY` | [mediastack.com](https://mediastack.com) | Additional news coverage |
| `FMP_API_KEY` | [financialmodelingprep.com](https://financialmodelingprep.com) | Company/industry financial data |
| `TWELVE_DATA_API_KEY` | [twelvedata.com](https://twelvedata.com) | Real-time market data |
| `APIFY_TOKEN` | [apify.com](https://apify.com) | Additional web-scraped market data (used if FMP/Twelve Data return little) |

Each provider has a free tier, sign up and generate an API key from their
dashboard, then paste it into `.env.local` (see `.env.example` for the
full variable list, including the required Supabase and OpenAI keys).

Reddit is used for social/trend data too, but needs no key, it's a public
API call.

## Verifying it worked

```bash
curl "http://localhost:3000/api/data-sources"
```

Each source will show as `configured` if its key is set, or `missing_key`
if it's using sample data instead.
