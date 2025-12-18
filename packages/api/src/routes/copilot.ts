import { Router, Request, Response } from 'express';
import CopilotEngine from '../copilot/CopilotEngine';

const router = Router();
const copilot = new CopilotEngine();

// Get code suggestions
router.post('/suggest', async (req: Request, res: Response) => {
  try {
    const { code, language, cursorPosition, context, fileContent } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'code and language are required' });
    }

    const suggestions = await copilot.suggest({ code, language, cursorPosition, context, fileContent });
    res.json({ suggestions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get alternative implementations
router.post('/alternatives', async (req: Request, res: Response) => {
  try {
    const { code, language, count } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'code and language are required' });
    }

    const alternatives = await copilot.getAlternatives(code, language, count);
    res.json({ alternatives });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Inline chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { question, code, language } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }

    const answer = await copilot.chat({ question, code, language });
    res.json({ answer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate from comment
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { comment, language, context } = req.body;
    
    if (!comment || !language) {
      return res.status(400).json({ error: 'comment and language are required' });
    }

    const code = await copilot.generateFromComment(comment, language, context);
    res.json({ code });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Infer imports
router.post('/imports', async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'code and language are required' });
    }

    const imports = await copilot.inferImports(code, language);
    res.json({ imports });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Detect patterns
router.post('/patterns', async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'code and language are required' });
    }

    const analysis = await copilot.detectPatterns(code, language);
    res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
