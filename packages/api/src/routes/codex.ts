import { Router, Request, Response } from 'express';
import CodexEngine from '../codex/CodexEngine';

const router = Router();
const codex = new CodexEngine();

// Translate natural language to code
router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { prompt, language, context } = req.body;
    
    if (!prompt || !language) {
      return res.status(400).json({ error: 'prompt and language are required' });
    }

    const code = await codex.translate({ prompt, language, context });
    res.json({ code });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Intelligent code completion
router.post('/complete', async (req: Request, res: Response) => {
  try {
    const { code, language, context } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'code and language are required' });
    }

    const completions = await codex.complete({ code, language, context });
    res.json({ completions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Refactor code
router.post('/refactor', async (req: Request, res: Response) => {
  try {
    const { code, language, instruction } = req.body;
    
    if (!code || !language || !instruction) {
      return res.status(400).json({ error: 'code, language, and instruction are required' });
    }

    const refactored = await codex.refactor({ code, language, instruction });
    res.json({ refactored });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate unit tests
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { code, language, framework } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'code and language are required' });
    }

    const tests = await codex.generateTests({ code, language, framework });
    res.json({ tests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Explain code
router.post('/explain', async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'code and language are required' });
    }

    const explanation = await codex.explain({ code, language });
    res.json({ explanation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate documentation
router.post('/docs', async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'code and language are required' });
    }

    const documentation = await codex.generateDocs(code, language);
    res.json({ documentation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fix bugs
router.post('/fix', async (req: Request, res: Response) => {
  try {
    const { code, language, error } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'code and language are required' });
    }

    const result = await codex.fixBugs(code, language, error);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
