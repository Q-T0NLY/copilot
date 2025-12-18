/**
 * Intelligence API Routes
 * 
 * Endpoints for Generative Ensemble Fusion, Project Graph, and Knowledge Systems
 */

import { Router, Request, Response } from 'express';
import { GenerativeEnsembleFusion } from '../intelligence/GenerativeEnsembleFusion';
import { ProjectGraph } from '../intelligence/ProjectGraph';

const router = Router();
const gef = new GenerativeEnsembleFusion();
const projectGraph = new ProjectGraph(process.cwd());

/**
 * POST /api/intelligence/gef/fuse
 * Fuse multiple model responses with knowledge enhancement
 */
router.post('/gef/fuse', async (req: Request, res: Response) => {
  try {
    const { prompt, context, options } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await gef.fuseResponses(prompt, context, options);

    res.json({
      success: true,
      result: {
        output: result.fusedOutput,
        gefScore: result.gefScore.toFixed(2) + '%',
        confidenceScore: (result.confidenceScore * 100).toFixed(2) + '%',
        scoringMetrics: result.scoringMetrics,
        modelContributions: Object.fromEntries(result.modelContributions),
        knowledgeEnhanced: result.knowledgeGraphEnhancement
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/intelligence/gef/stats
 * Get GEF engine statistics
 */
router.get('/gef/stats', (req: Request, res: Response) => {
  const stats = gef.getStatistics();
  res.json({
    success: true,
    stats
  });
});

/**
 * POST /api/intelligence/gef/knowledge
 * Add knowledge to the knowledge graph
 */
router.post('/gef/knowledge', (req: Request, res: Response) => {
  try {
    const { node } = req.body;

    if (!node || !node.id || !node.type || !node.content) {
      return res.status(400).json({ error: 'Invalid knowledge node' });
    }

    gef.addKnowledge(node);

    res.json({
      success: true,
      message: 'Knowledge node added successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/intelligence/project-graph/build
 * Build or rebuild the project graph
 */
router.post('/project-graph/build', async (req: Request, res: Response) => {
  try {
    await projectGraph.buildGraph();
    const stats = projectGraph.getStatistics();

    res.json({
      success: true,
      message: 'Project graph built successfully',
      stats
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/intelligence/project-graph/context/:symbol
 * Get context for a symbol
 */
router.get('/project-graph/context/:symbol', (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { includeReferences, includeDependencies, depth } = req.query;

    const context = projectGraph.getContext(symbol, {
      includeReferences: includeReferences === 'true',
      includeDependencies: includeDependencies === 'true',
      depth: depth ? parseInt(depth as string) : 2
    });

    res.json({
      success: true,
      context
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/intelligence/project-graph/stats
 * Get project graph statistics
 */
router.get('/project-graph/stats', (req: Request, res: Response) => {
  const stats = projectGraph.getStatistics();
  res.json({
    success: true,
    stats
  });
});

/**
 * POST /api/intelligence/project-graph/update-file
 * Update a specific file in the project graph
 */
router.post('/project-graph/update-file', async (req: Request, res: Response) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    await projectGraph.updateFile(filePath);

    res.json({
      success: true,
      message: 'File updated in project graph'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
