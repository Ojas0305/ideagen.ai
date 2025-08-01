// Quick fix for the specific problematic idea
require('dotenv').config({ path: './ideagen.ai/idea-generation-app/.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixProblematicIdea() {
    console.log('Fixing the problematic idea with manual parsing...')
    
    try {
        // Get the specific idea that has parsing issues
        const { data: idea, error: fetchError } = await supabase
            .from('full_ideas')
            .select('*')
            .eq('session_id', '8ed648a2-4d04-4fab-9b97-2b65bfa0f14d')
            .eq('title', 'Data-Driven Marketplace for Unused Business Resources')
            .single()
        
        if (fetchError || !idea) {
            console.error('Could not find the problematic idea')
            return
        }
        
        console.log('Found idea:', idea.title)
        console.log('Current structured fields:')
        console.log('  Problem:', idea.problem)
        console.log('  Solution:', idea.solution)
        
        // Manually extract the content (since regex is failing)
        const description = idea.description
        
        // Manual extraction based on the visible pattern
        const problem = "Businesses often have unused resources that are not fully utilized, leading to inefficiencies and wastage. Conversely, there are businesses that need these resources but cannot afford to buy them new or do not need them on a full-time basis. This gap creates a market inefficiency that needs to be addressed."
        
        const solution = "The Data-Driven Marketplace for Unused Business Resources is an online platform where businesses can list and sell their unused resources. These resources can range from surplus office supplies, unused software licenses, underutilized office spaces, or manpower. The platform uses intelligent algorithms to match available resources with companies that need them. Predictive analytics are incorporated to forecast demand and supply trends, helping users make informed decisions about pricing and timing. The platform ensures a secure and transparent transaction process to build trust among its users."
        
        const market = "According to a report by Accenture, companies worldwide are sitting on approximately $1 trillion in cash from unused assets. This represents a significant market opportunity. Furthermore, the trend towards a circular economy, where resources are reused and recycled, is growing, further increasing the potential market size."
        
        const audience = "The primary target audience is businesses of all sizes that have unused resources or need resources on a temporary or permanent basis. This includes small businesses, startups, and large corporations across various industries."
        
        const implementation = "Phase 1: Develop a Minimum Viable Product (MVP) of the platform. Phase 2: Conduct a beta test with a small group of businesses. Phase 3: Refine the platform based on feedback from the beta test. Phase 4: Launch the platform on a larger scale. Phase 5: Continuously improve the platform based on user feedback and data analysis."
        
        // Update the idea with manually extracted content
        const { error: updateError } = await supabase
            .from('full_ideas')
            .update({
                problem,
                solution,
                market_opportunity: market,
                target_audience: audience,
                implementation
            })
            .eq('id', idea.id)
        
        if (updateError) {
            console.error('Error updating idea:', updateError)
            return
        }
        
        console.log('Successfully updated structured fields!')
        
        // Now trigger evaluation for this idea
        console.log('Triggering AI evaluation...')
        const response = await fetch('http://localhost:3001/api/test-ai-evaluation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ideaId: idea.id })
        })
        
        if (response.ok) {
            const result = await response.json()
            console.log('Evaluation completed! Overall score:', result.overall_score)
        } else {
            console.error('Evaluation failed:', await response.text())
        }
        
    } catch (error) {
        console.error('Error:', error)
    }
}

fixProblematicIdea() 