#!/usr/bin/env node

/**
 * API Setup Verification Script
 * 
 * This script checks if all required API keys for Phase 2.1 External Data Sources are properly configured.
 * Run this after setting up your .env.local file to verify everything is working.
 */

require('dotenv').config({ path: '.env.local' })

console.log('Verifying API Configuration for Phase 2.1...\n')

const requiredKeys = [
  {
    name: 'NEWS_DATA_API_KEY',
    service: 'NewsData.io',
    url: 'https://newsdata.io/register',
    description: 'Real-time news and industry insights'
  },
  {
    name: 'MEDIASTACK_API_KEY', 
    service: 'Mediastack',
    url: 'https://mediastack.com/signup',
    description: 'Additional news sources and backup data'
  },
  {
    name: 'APIFY_TOKEN',
    service: 'Apify',
    url: 'https://apify.com/pricing',
    description: 'Twitter/X social media scraping'
  }
]

const optionalKeys = [
  {
    name: 'FMP_API_KEY',
    service: 'Financial Modeling Prep',
    description: 'Market research and financial data'
  },
  {
    name: 'TWELVE_DATA_API_KEY',
    service: 'Twelve Data',
    description: 'Stock market and financial data'
  },
  {
    name: 'MEANINGCLOUD_KEY',
    service: 'MeaningCloud',
    description: 'Sentiment analysis'
  }
]

let allConfigured = true
let criticalMissing = []

console.log('📋 REQUIRED API KEYS:')
console.log('=' .repeat(50))

requiredKeys.forEach(key => {
  const value = process.env[key.name]
  const isConfigured = value && value.length > 0 && !value.includes('your_')
  
  if (isConfigured) {
    console.log(` ${key.service}: Configured`)
  } else {
    console.log(` ${key.service}: MISSING`)
    console.log(`    Variable: ${key.name}`)
    console.log(`    Sign up: ${key.url}`)
    console.log(`   📄 Used for: ${key.description}`)
    allConfigured = false
    criticalMissing.push(key)
  }
  console.log('')
})

console.log('📋 OPTIONAL API KEYS:')
console.log('=' .repeat(50))

optionalKeys.forEach(key => {
  const value = process.env[key.name]
  const isConfigured = value && value.length > 0 && !value.includes('your_')
  
  if (isConfigured) {
    console.log(` ${key.service}: Configured`)
  } else {
    console.log(`⚪ ${key.service}: Not configured (optional)`)
  }
})

console.log('\n' + '=' .repeat(50))

if (allConfigured) {
  console.log(' SUCCESS! All required API keys are configured.')
  console.log('You can now run the application and test the data sources.')
  console.log('\nNext steps:')
  console.log('1. npm run dev')
  console.log('2. Test: curl "http://localhost:3000/api/data-sources?action=health"')
  console.log('3. Verify real data is flowing instead of mock data')
} else {
  console.log('  SETUP INCOMPLETE!')
  console.log(` ${criticalMissing.length} critical API key(s) missing.`)
  console.log('\n TO FIX:')
  console.log('1. Create/edit your .env.local file in the idea-generation-app directory')
  console.log('2. Add the missing API keys listed above')
  console.log('3. Run this script again to verify')
  console.log('\n📖 Full setup guide: ./API_KEYS_SETUP.md')
  
  process.exit(1)
}

console.log('\n Pro tip: Keep your API keys secure and never commit them to version control!') 