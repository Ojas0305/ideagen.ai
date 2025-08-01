# 🔑 API Keys Setup Guide - CRITICAL FOR PHASE 2.1

##  **IMMEDIATE ACTION REQUIRED**

The current API failures are caused by **missing environment variables**. Follow this guide to get all APIs working.

## 📋 Required Environment Variables

Add these to your `.env.local` file in the `idea-generation-app` directory:

### **1. NewsData.io API**
```bash
NEWS_DATA_API_KEY=your_newsdata_api_key
```
- **Sign up**: https://newsdata.io/register
- **Plan**: Free plan available with registration
- **Quota**: Check their pricing page for current limits
- **Used for**: Real-time news and industry insights

### **2. Mediastack API** 📄
```bash
MEDIASTACK_API_KEY=your_mediastack_access_key
```
- **Sign up**: https://mediastack.com/signup
- **Plan**: Free plan (100 calls/month)
- **Quota**: 100 requests per month (free tier)
- **Used for**: Additional news sources and backup data

### **3. Apify Token** 🐦
```bash
APIFY_TOKEN=your_apify_token
```
- **Sign up**: https://apify.com/pricing
- **Plan**: Free plan ($5 credit monthly)
- **Quota**: $5 worth of compute units monthly
- **Used for**: Twitter/X social media scraping

##  Quick Setup Instructions

### Step 1: Create Environment File
```bash
cd idea-generation-app
cp .env.example .env.local  # If .env.example exists
# OR create .env.local manually
```

### Step 2: Get NewsData.io API Key
1. Go to https://newsdata.io/register
2. Sign up with your email
3. Verify your account
4. Go to Dashboard → API Key
5. Copy your API key
6. Add to `.env.local`: `NEWS_DATA_API_KEY=your_key_here`

### Step 3: Get Mediastack API Key
1. Go to https://mediastack.com/signup
2. Choose Free plan
3. Complete registration
4. Go to Dashboard
5. Copy your Access Key
6. Add to `.env.local`: `MEDIASTACK_API_KEY=your_key_here`

### Step 4: Get Apify Token
1. Go to https://apify.com/pricing
2. Sign up for free account
3. Go to Settings → Integrations
4. Copy your API token
5. Add to `.env.local`: `APIFY_TOKEN=your_token_here`

##  Example .env.local File

```bash
# Existing Supabase vars
NEXT_PUBLIC_SUPABASE_URL=your_existing_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_existing_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_existing_service_key

# OpenAI
OPENAI_API_KEY=your_existing_openai_key

# PHASE 2.1 DATA SOURCE APIS - ADD THESE NOW
NEWS_DATA_API_KEY=nd_your_key_here_example123
MEDIASTACK_API_KEY=your_access_key_here_example456  
APIFY_TOKEN=apify_api_your_token_here_example789
```

##  Verification

After setting up the keys, test the APIs:

```bash
# Run the data integration test
curl "http://localhost:3000/api/data-sources?action=health"
```

You should see all APIs showing as "online" instead of "offline".

## 🐛 Troubleshooting

### NewsData.io 422 Error
-  **FIXED**: Corrected API parameter format
-  Ensure API key is valid and activated

### Mediastack 429 Error  
-  **FIXED**: Added rate limiting handling
- ℹ️ Free plan limited to 100 calls/month

### Apify 404 Error
-  **FIXED**: Changed from `memo23/apify-twitter-profile-scraper` to `apidojo/tweet-scraper`
-  Using correct tweet search actor instead of profile scraper

## Cost Breakdown

| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| NewsData.io |  Available | $0 |
| Mediastack | 100 calls | $0 |
| Apify | $5 credit | $0 |
| **Total** | | **$0/month** |

##  Next Steps

1. **Get all API keys** (15 minutes)
2. **Add to .env.local** (2 minutes)  
3. **Restart development server** (1 minute)
4. **Test data integration** (2 minutes)
5. **Verify real data flows** (5 minutes)

**Total time: ~25 minutes to fix all API failures** 