// Worker script to process background job queues
// Run with: node worker.mjs

import { ideaGenerationQueue, ideaEvaluationQueue } from './src/lib/queue/index.ts';

async function startWorker() {
    try {
        console.log('Starting job queue worker...');
        console.log(' Job queues imported successfully');
        console.log(' Worker is now processing jobs...');
        console.log(' Idea Generation Queue: Ready');
        console.log(' Idea Evaluation Queue: Ready');
        
        // Monitor queue activity
        ideaGenerationQueue.on('active', (job) => {
            console.log(`Processing job ${job.id}: ${job.name}`);
        });
        
        ideaGenerationQueue.on('completed', (job, result) => {
            console.log(` Completed job ${job.id}: ${job.name}`);
        });
        
        ideaGenerationQueue.on('failed', (job, err) => {
            console.log(` Failed job ${job.id}: ${job.name} - ${err.message}`);
        });
        
        ideaEvaluationQueue.on('active', (job) => {
            console.log(` Evaluating job ${job.id}: ${job.name}`);
        });
        
        ideaEvaluationQueue.on('completed', (job, result) => {
            console.log(` Evaluation completed ${job.id}: ${job.name}`);
        });
        
        ideaEvaluationQueue.on('failed', (job, err) => {
            console.log(` Evaluation failed ${job.id}: ${job.name} - ${err.message}`);
        });
        
        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('⏹️  Shutting down worker gracefully...');
            await ideaGenerationQueue.close();
            await ideaEvaluationQueue.close();
            console.log(' Worker shut down complete');
            process.exit(0);
        });
        
        process.on('SIGINT', async () => {
            console.log('⏹️  Shutting down worker gracefully...');
            await ideaGenerationQueue.close();
            await ideaEvaluationQueue.close();
            console.log(' Worker shut down complete');
            process.exit(0);
        });
        
        console.log(' Worker is ready to process jobs! Press Ctrl+C to stop.');
        
    } catch (error) {
        console.error('Failed to start worker:', error);
        process.exit(1);
    }
}

startWorker(); 