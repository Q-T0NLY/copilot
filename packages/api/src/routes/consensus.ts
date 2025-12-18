/**
 * Multi-Model Consensus Routes
 * 
 * Provides endpoints for multi-model AI consensus evaluation
 * with parallel execution and confidence scoring.
 */

import { Router, Request, Response } from 'express';
import MultiModelConsensus from '../llm/MultiModelConsensus';

const router = Router();
const consensus = new MultiModelConsensus();

/**
 * POST /api/consensus/evaluate
 * Evaluate a prompt across multiple models
 */
router.post('/evaluate', async (req: Request, res: Response) => {
  try {
    const { prompt, models, maxTokens, temperature, requireConsensus } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required',
      });
    }

    const result = await consensus.evaluateParallel(prompt, models, {
      maxTokens,
      temperature,
      requireConsensus,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * POST /api/consensus/task
 * Get consensus for a specific task type
 */
router.post('/task', async (req: Request, res: Response) => {
  try {
    const { prompt, taskType } = req.body;

    if (!prompt || !taskType) {
      return res.status(400).json({
        success: false,
        error: 'Prompt and taskType are required',
      });
    }

    if (!['reasoning', 'analysis', 'creativity', 'speed'].includes(taskType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid taskType. Must be: reasoning, analysis, creativity, or speed',
      });
    }

    const result = await consensus.getConsensusForTask(prompt, taskType);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

export default router;
