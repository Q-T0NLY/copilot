import { Router, Request, Response } from 'express';
import WarpEngine from '../warp/WarpEngine';

const router = Router();
const warp = new WarpEngine();

// Suggest command from natural language
router.post('/suggest', async (req: Request, res: Response) => {
  try {
    const { query, platform, shell, context } = req.body;
    
    if (!query || !platform) {
      return res.status(400).json({ error: 'query and platform are required' });
    }

    if (!['linux', 'macos', 'windows'].includes(platform)) {
      return res.status(400).json({ error: 'platform must be linux, macos, or windows' });
    }

    const result = await warp.suggest({ query, platform, shell, context });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Explain command
router.post('/explain', async (req: Request, res: Response) => {
  try {
    const { command, platform } = req.body;
    
    if (!command || !platform) {
      return res.status(400).json({ error: 'command and platform are required' });
    }

    if (!['linux', 'macos', 'windows'].includes(platform)) {
      return res.status(400).json({ error: 'platform must be linux, macos, or windows' });
    }

    const result = await warp.explain({ command, platform });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create workflow
router.post('/workflow', async (req: Request, res: Response) => {
  try {
    const { goal, platform, constraints } = req.body;
    
    if (!goal || !platform) {
      return res.status(400).json({ error: 'goal and platform are required' });
    }

    if (!['linux', 'macos', 'windows'].includes(platform)) {
      return res.status(400).json({ error: 'platform must be linux, macos, or windows' });
    }

    const result = await warp.createWorkflow({ goal, platform, constraints });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fix command error
router.post('/fix', async (req: Request, res: Response) => {
  try {
    const { command, error, platform } = req.body;
    
    if (!command || !error || !platform) {
      return res.status(400).json({ error: 'command, error, and platform are required' });
    }

    if (!['linux', 'macos', 'windows'].includes(platform)) {
      return res.status(400).json({ error: 'platform must be linux, macos, or windows' });
    }

    const result = await warp.fix({ command, error, platform });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Complete partial command
router.post('/complete', async (req: Request, res: Response) => {
  try {
    const { partial, platform } = req.body;
    
    if (!partial || !platform) {
      return res.status(400).json({ error: 'partial and platform are required' });
    }

    if (!['linux', 'macos', 'windows'].includes(platform)) {
      return res.status(400).json({ error: 'platform must be linux, macos, or windows' });
    }

    const completions = await warp.complete(partial, platform);
    res.json({ completions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get history analysis
router.get('/history', (req: Request, res: Response) => {
  const analysis = warp.getHistoryAnalysis();
  res.json(analysis);
});

export default router;
