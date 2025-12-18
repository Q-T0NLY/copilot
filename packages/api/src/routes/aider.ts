import { Router, Request, Response } from 'express';
import AiderEngine from '../aider/AiderEngine';

const router = Router();
const aider = new AiderEngine();

// Conversational code editing
router.post('/edit', async (req: Request, res: Response) => {
  try {
    const { instruction, files, context } = req.body;
    
    if (!instruction || !files || !Array.isArray(files)) {
      return res.status(400).json({ error: 'instruction and files array are required' });
    }

    const result = await aider.edit({ instruction, files, context });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Multi-file refactoring
router.post('/refactor', async (req: Request, res: Response) => {
  try {
    const { files, goal, constraints } = req.body;
    
    if (!files || !Array.isArray(files) || !goal) {
      return res.status(400).json({ error: 'files array and goal are required' });
    }

    const result = await aider.refactor({ files, goal, constraints });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate diff
router.post('/diff', async (req: Request, res: Response) => {
  try {
    const { original, instruction, language } = req.body;
    
    if (!original || !instruction || !language) {
      return res.status(400).json({ error: 'original, instruction, and language are required' });
    }

    const result = await aider.generateDiff({ original, instruction, language });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Suggest architecture improvements
router.post('/architecture', async (req: Request, res: Response) => {
  try {
    const { files, currentStructure } = req.body;
    
    if (!files || !Array.isArray(files) || !currentStructure) {
      return res.status(400).json({ error: 'files array and currentStructure are required' });
    }

    const result = await aider.suggestArchitecture(files, currentStructure);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate commit message
router.post('/commit', async (req: Request, res: Response) => {
  try {
    const { changes, context } = req.body;
    
    if (!changes || !Array.isArray(changes)) {
      return res.status(400).json({ error: 'changes array is required' });
    }

    const result = await aider.generateCommitMessage({ changes, context });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Test-driven development
router.post('/tdd', async (req: Request, res: Response) => {
  try {
    const { requirement, language } = req.body;
    
    if (!requirement || !language) {
      return res.status(400).json({ error: 'requirement and language are required' });
    }

    const result = await aider.generateTestFirst(requirement, language);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversation history
router.get('/history', (req: Request, res: Response) => {
  const history = aider.getHistory();
  res.json({ history });
});

// Clear conversation history
router.post('/history/clear', (req: Request, res: Response) => {
  aider.clearHistory();
  res.json({ message: 'History cleared' });
});

export default router;
