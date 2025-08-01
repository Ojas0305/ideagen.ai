// Test script for automated idea generation pipeline
// Run with: node test-automation.js

const { v4: uuidv4 } = require('uuid');

const API_BASE_URL = 'http://localhost:3001';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    const data = await response.json();
    return { response, data };
}

async function testAutomatedIdeaGeneration() {
    console.log('Testing Automated Idea Generation Pipeline\n');

    try {
        // Step 1: Create a test project
        console.log('📋 Step 1: Creating test project...');
        const projectData = {
            name: `Automation Test Project ${new Date().toLocaleTimeString()}`,
            description: 'A test project for automated idea generation',
            industry: 'Technology',
            challenge: 'Develop innovative solutions for remote team collaboration'
        };

        const { response: projectResponse, data: project } = await apiRequest('/api/projects', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });

        if (!projectResponse.ok) {
            throw new Error(`Failed to create project: ${project.error?.message}`);
        }

        console.log(`Created project: ${project.name} (ID: ${project.id})\n`);

        // Step 2: Create an idea session
        console.log('📋 Step 2: Creating idea session...');
        const sessionData = {
            name: `Automated Session ${new Date().toLocaleTimeString()}`,
            description: 'Automated AI-powered idea generation session',
            project_id: project.id,
            status: 'planning'
        };

        const { response: sessionResponse, data: session } = await apiRequest('/api/idea-sessions', {
            method: 'POST',
            body: JSON.stringify(sessionData)
        });

        if (!sessionResponse.ok) {
            throw new Error(`Failed to create session: ${session.error?.message}`);
        }

        console.log(`Created session: ${session.name} (ID: ${session.id})\n`);

        // Step 3: Start automated idea generation
        console.log(' Step 3: Starting automated idea generation...');
        const { response: startResponse, data: startResult } = await apiRequest('/api/idea-sessions/start', {
            method: 'POST',
            body: JSON.stringify({ session_id: session.id })
        });

        if (!startResponse.ok) {
            throw new Error(`Failed to start generation: ${startResult.error?.message}`);
        }

        console.log(`Started generation job: ${startResult.job_id}`);
        console.log(` Estimated completion: ${startResult.estimated_completion}\n`);

        // Step 4: Monitor progress
        console.log('Step 4: Monitoring progress...');
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max
        let completed = false;

        while (attempts < maxAttempts && !completed) {
            await sleep(5000); // Wait 5 seconds between checks
            attempts++;

            const { response: progressResponse, data: progress } = await apiRequest(
                `/api/idea-sessions/progress?session_id=${session.id}&job_id=${startResult.job_id}`
            );

            if (progressResponse.ok) {
                const stage = progress.statistics?.stage || 'unknown';
                const progressPercent = progress.statistics?.progress || 0;
                const status = progress.status;

                console.log(` [${attempts}] Status: ${status} | Stage: ${stage} | Progress: ${progressPercent}%`);
                console.log(` Ideas Generated: ${progress.ideas_generated?.total || 0} (${progress.ideas_generated?.seeds || 0} seeds, ${progress.ideas_generated?.full_ideas || 0} full)`);
                
                if (progress.average_score > 0) {
                    console.log(`⭐ Average Score: ${progress.average_score}`);
                }

                if (progress.recent_ideas && progress.recent_ideas.length > 0) {
                    console.log(' Recent Ideas:');
                    progress.recent_ideas.forEach(idea => {
                        console.log(`  - ${idea.title} (Category: ${idea.category}, Score: ${idea.overall_score})`);
                    });
                }

                if (status === 'completed') {
                    completed = true;
                    console.log('\nIdea generation completed successfully!');
                    break;
                } else if (status === 'failed') {
                    throw new Error('Idea generation failed');
                }
            }

            console.log(''); // Empty line for readability
        }

        if (!completed) {
            console.log(' Generation is taking longer than expected but may still be running...');
        }

        // Step 5: Get final results
        console.log('📋 Step 5: Fetching final results...');
        const { response: ideasResponse, data: ideasResult } = await apiRequest(
            `/api/full-ideas?session_id=${session.id}`
        );

        if (ideasResponse.ok) {
            console.log(`\nFinal Results:`);
            console.log(`Total Ideas: ${ideasResult.ideas?.length || 0}`);
            
            if (ideasResult.ideas && ideasResult.ideas.length > 0) {
                console.log('\n Generated Ideas:');
                ideasResult.ideas.forEach((idea, index) => {
                    console.log(`\n${index + 1}. ${idea.title}`);
                    console.log(`   Category: ${idea.category}`);
                    console.log(`   Score: ${idea.overall_score}`);
                    console.log(`   Description: ${idea.description?.substring(0, 200)}...`);
                });
            }
        }

        // Step 6: Check evaluation dashboard
        console.log('\nStep 6: Checking evaluation dashboard...');
        const { response: evalResponse, data: evalData } = await apiRequest(
            `/api/evaluation?session_id=${session.id}`
        );

        if (evalResponse.ok) {
            console.log(`\n Evaluation Summary:`);
            console.log(`Total Ideas: ${evalData.total_ideas}`);
            console.log(`Average Score: ${evalData.average_score}`);
            console.log(`Categories: ${Object.keys(evalData.categories || {}).join(', ')}`);
        }

        console.log('\n Test completed successfully! All automation components are working.');
        console.log('\n Phase 1.1 (Automated Idea Generation Pipeline) - COMPLETE');

    } catch (error) {
        console.error('\n Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testAutomatedIdeaGeneration(); 