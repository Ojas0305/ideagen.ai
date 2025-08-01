import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { PersonaService } from '@/lib/openai/personas'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const body = await request.json()
        
        const { idea_id } = body

        if (!idea_id) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Idea ID is required' } },
                { status: 400 }
            )
        }

        // Get the idea from database
        const { data: idea, error: fetchError } = await supabase
            .from('full_ideas')
            .select('*')
            .eq('id', idea_id)
            .single()

        if (fetchError || !idea) {
            return NextResponse.json(
                { error: { code: 'NOT_FOUND', message: 'Idea not found' } },
                { status: 404 }
            )
        }

        console.log('Evaluating idea with real AI:', idea.title)

        // Re-parse the content with updated regex patterns before evaluation
        const fullIdeaContent = idea.description
        
        let problem = 'Not specified'
        let solution = 'Not specified'
        let market_opportunity = 'Not specified'
        let target_audience = 'Not specified'
        let implementation = 'Not specified'
        
        // Apply the same regex patterns as in server-queue.ts
        const problemPatterns = [
          /(?:problem|challenge|issue)[:\s]+([\s\S]*?)(?=\n|solution|market|target|implementation|$)/i,
          /businesses are (?:confronted|facing|dealing) with ([\s\S]*?)(?=\n|\.)/i,
          /(?:address|solve|tackle)[:\s]+([\s\S]*?)(?=\n|\.)/i,
          /\d+\.\s*\*\*Problem Statement\*\*[:\s]+([\s\S]*?)(?=\n\s*\d+\.|$)/i,
          /\*\*Problem Statement\*\*[:\s]+([\s\S]*?)(?=\n\s*\*\*|$)/i
        ]
        
        const solutionPatterns = [
          /(?:solution|approach|method)[:\s]+([\s\S]*?)(?=\n|market|target|implementation|$)/i,
          /(?:platform|system|service) (?:that|which) ([\s\S]*?)(?=\n|\.)/i,
          /(?:provides|offers|enables) ([\s\S]*?)(?=\n|\.)/i,
          /\d+\.\s*\*\*Solution Description\*\*[:\s]+([\s\S]*?)(?=\n\s*\d+\.|$)/i,
          /\*\*Solution Description\*\*[:\s]+([\s\S]*?)(?=\n\s*\*\*|$)/i
        ]
        
        const marketPatterns = [
          /(?:market|opportunity|potential)[:\s]+([\s\S]*?)(?=\n|target|implementation|$)/i,
          /(?:industry|sector|business) ([\s\S]*?)(?=\n|\.)/i,
          /\d+\.\s*\*\*Market Opportunity\*\*[:\s]+([\s\S]*?)(?=\n\s*\d+\.|$)/i,
          /\*\*Market Opportunity\*\*[:\s]+([\s\S]*?)(?=\n\s*\*\*|$)/i
        ]
        
        const audiencePatterns = [
          /(?:target|audience|customers|users)[:\s]+([\s\S]*?)(?=\n|implementation|$)/i,
          /(?:for|serves|helps) ([\s\S]*?) (?:businesses|companies|organizations)/i,
          /\d+\.\s*\*\*Target Audience\*\*[:\s]+([\s\S]*?)(?=\n\s*\d+\.|$)/i,
          /\*\*Target Audience\*\*[:\s]+([\s\S]*?)(?=\n\s*\*\*|$)/i
        ]
        
        const implPatterns = [
          /(?:implementation|plan|strategy)[:\s]+([\s\S]*?)(?=\n|$)/i,
          /(?:using|through|via) ([\s\S]*?)(?=\n|\.)/i,
          /\d+\.\s*\*\*Implementation Plan\*\*[:\s]+([\s\S]*?)(?=\n\s*\d+\.|$)/i,
          /\*\*Implementation Plan\*\*[:\s]+([\s\S]*?)(?=\n\s*\*\*|$)/i
        ]
        
        // Extract fields using patterns
        for (const pattern of problemPatterns) {
          const match = fullIdeaContent.match(pattern)
          if (match && match[1] && match[1].trim().length > 10) {
            problem = match[1].trim()
            break
          }
        }
        
        for (const pattern of solutionPatterns) {
          const match = fullIdeaContent.match(pattern)
          if (match && match[1] && match[1].trim().length > 10) {
            solution = match[1].trim()
            break
          }
        }
        
        for (const pattern of marketPatterns) {
          const match = fullIdeaContent.match(pattern)
          if (match && match[1] && match[1].trim().length > 10) {
            market_opportunity = match[1].trim()
            break
          }
        }
        
        for (const pattern of audiencePatterns) {
          const match = fullIdeaContent.match(pattern)
          if (match && match[1] && match[1].trim().length > 10) {
            target_audience = match[1].trim()
            break
          }
        }
        
        for (const pattern of implPatterns) {
          const match = fullIdeaContent.match(pattern)
          if (match && match[1] && match[1].trim().length > 10) {
            implementation = match[1].trim()
            break
          }
        }
        
        console.log('📋 Re-parsed fields:', {
          problem: problem !== 'Not specified' ? 'Found' : 'Missing',
          solution: solution !== 'Not specified' ? 'Found' : 'Missing', 
          market_opportunity: market_opportunity !== 'Not specified' ? 'Found' : 'Missing',
          target_audience: target_audience !== 'Not specified' ? 'Found' : 'Missing',
          implementation: implementation !== 'Not specified' ? 'Found' : 'Missing'
        })

        // Use the already-parsed database fields instead of re-parsing description
        // This ensures we use the latest parsed data from our improved regex patterns
        const structuredIdea = {
            ...idea,
            problem: problem,
            solution: solution, 
            market_opportunity: market_opportunity,
            target_audience: target_audience,
            implementation: implementation
        }

        console.log('📋 Using structured data from database for AI evaluation:', {
            title: structuredIdea.title,
            problem: structuredIdea.problem !== 'Not specified' ? 'Available' : 'Missing',
            solution: structuredIdea.solution !== 'Not specified' ? 'Available' : 'Missing',
            market_opportunity: structuredIdea.market_opportunity !== 'Not specified' ? 'Available' : 'Missing',
            target_audience: structuredIdea.target_audience !== 'Not specified' ? 'Available' : 'Missing',
            implementation: structuredIdea.implementation !== 'Not specified' ? 'Available' : 'Missing'
        })

        // Evaluate the idea on all criteria using real AI
        const feasibilityEval = await PersonaService.evaluateIdea(structuredIdea, 'feasibility')
        const marketPotentialEval = await PersonaService.evaluateIdea(structuredIdea, 'market_potential')
        const uniquenessEval = await PersonaService.evaluateIdea(structuredIdea, 'uniqueness')
        const overallEval = await PersonaService.evaluateIdea(structuredIdea, 'overall')

        const evaluationResult = {
            feasibility_score: feasibilityEval.score,
            market_potential_score: marketPotentialEval.score,
            uniqueness_score: uniquenessEval.score,
            overall_score: overallEval.score,
            reasoning: {
                feasibility: feasibilityEval.reasoning,
                market_potential: marketPotentialEval.reasoning,
                uniqueness: uniquenessEval.reasoning,
                overall: overallEval.reasoning
            }
        }

        console.log(' AI Evaluation Result:', evaluationResult)

        // Create a clean description without any previous evaluation data
        const baseDescription = idea.description.split('\n\n** AI Evaluation Results')[0]

        // Create detailed evaluation summary to append to description
        const evaluationSummary = `

** AI Evaluation Results (${new Date().toLocaleString()}):**
• **Feasibility Score:** ${evaluationResult.feasibility_score}/100
  ${evaluationResult.reasoning.feasibility}

• **Market Potential Score:** ${evaluationResult.market_potential_score}/100
  ${evaluationResult.reasoning.market_potential}

• **Uniqueness Score:** ${evaluationResult.uniqueness_score}/100
  ${evaluationResult.reasoning.uniqueness}

• **Overall Score:** ${evaluationResult.overall_score}/100
  ${evaluationResult.reasoning.overall}

---
*Evaluated using GPT-4 AI assessment*`
        
        // Update only existing columns: overall_score, description, updated_at
        const { error: updateError } = await supabase
            .from('full_ideas')
            .update({
                overall_score: evaluationResult.overall_score,
                description: baseDescription + evaluationSummary,
                problem: problem,
                solution: solution,
                market_opportunity: market_opportunity,
                target_audience: target_audience,
                implementation: implementation,
                updated_at: new Date().toISOString()
            })
            .eq('id', idea_id)

        if (updateError) {
            console.error('Error updating idea scores:', updateError)
            return NextResponse.json(
                { error: { code: 'UPDATE_ERROR', message: 'Failed to update idea scores', details: updateError } },
                { status: 500 }
            )
        }

        console.log(' Successfully updated idea with AI evaluation and extracted fields')

        return NextResponse.json({
            success: true,
            idea_id,
            evaluation: evaluationResult,
            extracted_fields: {
                problem: problem !== 'Not specified' ? 'Found' : 'Missing',
                solution: solution !== 'Not specified' ? 'Found' : 'Missing',
                market_opportunity: market_opportunity !== 'Not specified' ? 'Found' : 'Missing',
                target_audience: target_audience !== 'Not specified' ? 'Found' : 'Missing',
                implementation: implementation !== 'Not specified' ? 'Found' : 'Missing'
            },
            extracted_content: {
                problem: problem !== 'Not specified' ? problem.substring(0, 100) + '...' : 'Not specified',
                solution: solution !== 'Not specified' ? solution.substring(0, 100) + '...' : 'Not specified',
                market_opportunity: market_opportunity !== 'Not specified' ? market_opportunity.substring(0, 100) + '...' : 'Not specified',
                target_audience: target_audience !== 'Not specified' ? target_audience.substring(0, 100) + '...' : 'Not specified',
                implementation: implementation !== 'Not specified' ? implementation.substring(0, 100) + '...' : 'Not specified'
            },
            message: 'Idea evaluated successfully with real AI and updated in database with extracted fields'
        })

    } catch (error) {
        console.error('Error in AI evaluation:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
} 