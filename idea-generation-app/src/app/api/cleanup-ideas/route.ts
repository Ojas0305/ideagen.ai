import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        
        console.log('🧹 Starting cleanup of test ideas...')

        // First, delete all existing ideas
        const { error: deleteError } = await supabase
            .from('full_ideas')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

        if (deleteError) {
            console.error('Error deleting existing ideas:', deleteError)
            return NextResponse.json(
                { error: { code: 'DELETE_ERROR', message: deleteError.message } },
                { status: 400 }
            )
        }

        console.log(' Deleted all existing ideas')

        // Now insert the original 4 demo ideas
        const originalIdeas = [
            {
                id: '1a2b3c4d-5e6f-7890-abcd-ef1234567890',
                session_id: '199e6ec6-0e1b-495c-aa87-bccb26eb8ea3',
                title: 'AI-Powered Personal Learning Assistant',
                description: 'An intelligent tutoring system that adapts to individual learning styles and provides personalized educational content across multiple subjects.',
                category: 'Education',
                overall_score: 87,
                feasibility_score: 85,
                market_potential_score: 89,
                uniqueness_score: 87,
                problem: 'Students struggle with one-size-fits-all education approaches that don\'t adapt to their individual learning styles and pace.',
                solution: 'AI system that analyzes learning patterns and provides personalized content, practice problems, and explanations tailored to each student.',
                market_opportunity: 'Global educational technology market worth $404 billion by 2025, with personalized learning being a key growth driver.',
                target_audience: 'K-12 students, college students, and adult learners seeking skill development.',
                implementation: 'Phase 1: Core AI engine development, Phase 2: Content partnerships, Phase 3: Mobile app and web platform.',
                created_at: new Date('2024-01-10').toISOString(),
                updated_at: new Date('2024-01-10').toISOString()
            },
            {
                id: '2b3c4d5e-6f78-9012-bcde-f23456789012',
                session_id: '199e6ec6-0e1b-495c-aa87-bccb26eb8ea3',
                title: 'Smart Urban Farming Network',
                description: 'A network of automated vertical farms that use IoT sensors, AI optimization, and sustainable practices to grow fresh produce in urban environments.',
                category: 'Sustainability',
                overall_score: 75,
                feasibility_score: 70,
                market_potential_score: 82,
                uniqueness_score: 73,
                problem: 'Urban areas lack access to fresh, locally-grown produce, leading to food deserts and high transportation emissions.',
                solution: 'Automated vertical farming systems with AI-driven optimization for water, nutrients, and lighting to maximize yield in minimal space.',
                market_opportunity: 'Vertical farming market expected to reach $24 billion by 2030, driven by urbanization and sustainability concerns.',
                target_audience: 'Urban communities, restaurants, grocery chains, and environmentally conscious consumers.',
                implementation: 'Phase 1: Pilot urban farm setup, Phase 2: IoT and AI system development, Phase 3: Network expansion.',
                created_at: new Date('2024-01-12').toISOString(),
                updated_at: new Date('2024-01-12').toISOString()
            },
            {
                id: '3c4d5e6f-7890-1234-cdef-345678901234',
                session_id: '199e6ec6-0e1b-495c-aa87-bccb26eb8ea3',
                title: 'Blockchain-Based Identity Verification',
                description: 'A decentralized identity verification system that gives users control over their personal data while providing secure authentication for services.',
                category: 'Technology',
                overall_score: 68,
                feasibility_score: 60,
                market_potential_score: 78,
                uniqueness_score: 66,
                problem: 'Current identity verification systems are centralized, vulnerable to breaches, and give users little control over their personal data.',
                solution: 'Blockchain-based identity platform where users control their credentials and can verify identity without revealing unnecessary information.',
                market_opportunity: 'Digital identity market projected to reach $49.5 billion by 2026, with blockchain solutions gaining traction.',
                target_audience: 'Financial institutions, healthcare providers, government agencies, and privacy-conscious individuals.',
                implementation: 'Phase 1: Blockchain infrastructure, Phase 2: Mobile wallet development, Phase 3: Enterprise partnerships.',
                created_at: new Date('2024-01-15').toISOString(),
                updated_at: new Date('2024-01-15').toISOString()
            },
            {
                id: '4d5e6f78-9012-3456-def0-456789012345',
                session_id: '199e6ec6-0e1b-495c-aa87-bccb26eb8ea3',
                title: 'Mental Health Support Chatbot',
                description: 'An AI-powered chatbot that provides 24/7 mental health support, crisis intervention, and connects users with appropriate professional resources.',
                category: 'Healthcare',
                overall_score: 55,
                feasibility_score: 65,
                market_potential_score: 45,
                uniqueness_score: 55,
                problem: 'Mental health services are often inaccessible, expensive, and have long wait times, leaving many without immediate support.',
                solution: 'AI chatbot trained on therapeutic techniques that provides immediate support and can escalate to human professionals when needed.',
                market_opportunity: 'Digital mental health market growing at 25% CAGR, expected to reach $5.6 billion by 2026.',
                target_audience: 'Individuals seeking mental health support, healthcare institutions, and employee wellness programs.',
                implementation: 'Phase 1: AI model training with mental health experts, Phase 2: Safety protocols and crisis detection, Phase 3: Professional network integration.',
                created_at: new Date('2024-01-18').toISOString(),
                updated_at: new Date('2024-01-18').toISOString()
            }
        ]

        const { data: insertedIdeas, error: insertError } = await supabase
            .from('full_ideas')
            .insert(originalIdeas)
            .select()

        if (insertError) {
            console.error('Error inserting original ideas:', insertError)
            return NextResponse.json(
                { error: { code: 'INSERT_ERROR', message: insertError.message } },
                { status: 400 }
            )
        }

        console.log(' Successfully restored original 4 ideas')

        return NextResponse.json({
            success: true,
            message: 'Successfully cleaned up test ideas and restored original 4 ideas',
            ideasRestored: insertedIdeas?.length || 4
        })

    } catch (error) {
        console.error('Error during cleanup:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
} 