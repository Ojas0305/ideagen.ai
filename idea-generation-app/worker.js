// Worker script to process background job queues
// This should be run as a separate process: node worker.js

const { createRequire } = require('module');
const require = createRequire(import.meta.url);

async function startWorker() {
    try {
        console.log('Starting job queue worker...');
        
        // Dynamic import the queue module
        const { ideaGenerationQueue, ideaEvaluationQueue } = await import('./src/lib/queue/index.ts');
        
        console.log(' Job queues imported successfully');
        console.log('Worker is now processing jobs...');
        console.log(' Idea Generation Queue: Ready');
        console.log(' Idea Evaluation Queue: Ready');
        
        // The queues are already set up to process jobs automatically
        // We just need to keep the process alive
        
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
        
        // Keep process alive
        const keepAlive = () => {
            setTimeout(keepAlive, 1000);
        };
        keepAlive();
        
    } catch (error) {
        console.error('Failed to start worker:', error);
        process.exit(1);
    }
}

startWorker(); 