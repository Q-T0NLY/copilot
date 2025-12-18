import { Router } from 'express';
import { ChatHistoryService } from '../models/ChatHistory';
import { CodeSnippetService } from '../models/CodeSnippet';
import { PostgresDatabase } from '../database/postgres';

const router = Router();
const chatHistoryService = new ChatHistoryService();
const codeSnippetService = new CodeSnippetService();
const db = PostgresDatabase.getInstance();

// Initialize database on first request
let dbInitialized = false;
async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      await db.initialize();
      dbInitialized = true;
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  }
}

// Chat History endpoints
router.post('/chat/history', async (req, res, next) => {
  try {
    await ensureDbInitialized();
    const { user_id, message, role, context } = req.body;

    if (!user_id || !message || !role) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const id = await chatHistoryService.saveMessage({
      user_id,
      message,
      role,
      context
    });

    res.json({ id, message: 'Chat message saved' });
  } catch (error) {
    next(error);
  }
});

router.get('/chat/history/:userId', async (req, res, next) => {
  try {
    await ensureDbInitialized();
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const history = await chatHistoryService.getHistory(userId, limit);
    res.json({ history });
  } catch (error) {
    next(error);
  }
});

router.delete('/chat/history/:userId', async (req, res, next) => {
  try {
    await ensureDbInitialized();
    const { userId } = req.params;

    await chatHistoryService.deleteHistory(userId);
    res.json({ message: 'Chat history deleted' });
  } catch (error) {
    next(error);
  }
});

// Code Snippets endpoints
router.post('/snippets', async (req, res, next) => {
  try {
    await ensureDbInitialized();
    const { user_id, title, code, language, description, tags } = req.body;

    if (!user_id || !title || !code || !language) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const id = await codeSnippetService.saveSnippet({
      user_id,
      title,
      code,
      language,
      description,
      tags
    });

    res.json({ id, message: 'Snippet saved' });
  } catch (error) {
    next(error);
  }
});

router.get('/snippets/:userId', async (req, res, next) => {
  try {
    await ensureDbInitialized();
    const { userId } = req.params;
    const language = req.query.language as string;

    const snippets = await codeSnippetService.getSnippets(userId, language);
    res.json({ snippets });
  } catch (error) {
    next(error);
  }
});

router.get('/snippets/search/:userId', async (req, res, next) => {
  try {
    await ensureDbInitialized();
    const { userId } = req.params;
    const searchTerm = req.query.q as string;

    if (!searchTerm) {
      res.status(400).json({ error: 'Search term required' });
      return;
    }

    const snippets = await codeSnippetService.searchSnippets(userId, searchTerm);
    res.json({ snippets });
  } catch (error) {
    next(error);
  }
});

router.put('/snippets/:id', async (req, res, next) => {
  try {
    await ensureDbInitialized();
    const id = parseInt(req.params.id);
    const updates = req.body;

    await codeSnippetService.updateSnippet(id, updates);
    res.json({ message: 'Snippet updated' });
  } catch (error) {
    next(error);
  }
});

router.delete('/snippets/:id/:userId', async (req, res, next) => {
  try {
    await ensureDbInitialized();
    const id = parseInt(req.params.id);
    const { userId } = req.params;

    await codeSnippetService.deleteSnippet(id, userId);
    res.json({ message: 'Snippet deleted' });
  } catch (error) {
    next(error);
  }
});

// User Preferences endpoints
router.get('/preferences/:userId', async (req, res, next) => {
  try {
    await ensureDbInitialized();
    const { userId } = req.params;

    const result = await db.query(
      'SELECT preferences FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.json({ preferences: {} });
      return;
    }

    res.json({ preferences: result.rows[0].preferences });
  } catch (error) {
    next(error);
  }
});

router.put('/preferences/:userId', async (req, res, next) => {
  try {
    await ensureDbInitialized();
    const { userId } = req.params;
    const { preferences } = req.body;

    await db.query(
      `INSERT INTO user_preferences (user_id, preferences) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id) 
       DO UPDATE SET preferences = $2, updated_at = CURRENT_TIMESTAMP`,
      [userId, JSON.stringify(preferences)]
    );

    res.json({ message: 'Preferences saved' });
  } catch (error) {
    next(error);
  }
});

export { router as databaseRouter };
