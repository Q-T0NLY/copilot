import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { llmRouter } from './routes/llm';
import { crawlerRouter } from './routes/crawler';
import { settingsRouter } from './routes/settings';
import { databaseRouter } from './routes/database';
import { healingRouter } from './routes/healing';
import performanceRouter from './routes/performance';
import consensusRouter from './routes/consensus';
import intelligenceRouter from './routes/intelligence';
import codexRouter from './routes/codex';
import copilotRouter from './routes/copilot';
import aiderRouter from './routes/aider';
import warpRouter from './routes/warp';
import { apiKeyMiddleware } from './middleware/apiKey';
import { errorHandler } from './middleware/errorHandler';
import { PostgresDatabase } from './database/postgres';
import { MongoDatabase } from './database/mongo';
import PerformanceMonitor from './performance/PerformanceMonitor';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Performance monitoring middleware
const perfMonitor = PerformanceMonitor.getInstance();
app.use((req, res, next) => {
  const startTime = perfMonitor.startRequest();
  
  res.on('finish', () => {
    const success = res.statusCode < 400;
    perfMonitor.endRequest(startTime, success);
  });
  
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/llm', apiKeyMiddleware, llmRouter);
app.use('/api/crawler', apiKeyMiddleware, crawlerRouter);
app.use('/api/settings', apiKeyMiddleware, settingsRouter);
app.use('/api/database', apiKeyMiddleware, databaseRouter);
app.use('/api/healing', apiKeyMiddleware, healingRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/consensus', apiKeyMiddleware, consensusRouter);
app.use('/api/intelligence', apiKeyMiddleware, intelligenceRouter);
app.use('/api/codex', apiKeyMiddleware, codexRouter);
app.use('/api/copilot', apiKeyMiddleware, copilotRouter);
app.use('/api/aider', apiKeyMiddleware, aiderRouter);
app.use('/api/warp', apiKeyMiddleware, warpRouter);

// Error handling
app.use(errorHandler);

// Initialize databases and start server
async function initializeAndStart() {
  try {
    // Initialize PostgreSQL
    const postgres = PostgresDatabase.getInstance();
    await postgres.initialize();
    console.log('✅ PostgreSQL initialized');

    // Initialize MongoDB (optional - will fail gracefully if not configured)
    try {
      const mongo = MongoDatabase.getInstance();
      await mongo.connect();
      console.log('✅ MongoDB initialized');
    } catch (mongoError) {
      console.warn('⚠️  MongoDB not available (optional)');
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to initialize:', error);
    // In development, continue without database
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Starting without database connections');
      app.listen(PORT, () => {
        console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    } else {
      process.exit(1);
    }
  }
}

initializeAndStart();

export default app;
