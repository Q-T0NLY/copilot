/**
 * API Routes for Advanced AI Systems
 * DAG/RAG++, Prompt Toolkit, and NLP Fusion endpoints
 */

import { Router, Request, Response } from 'express';
import { DAGRAGEngine } from '../rag/DAGRAGEngine';
import { PromptToolkit } from '../prompts/PromptToolkit';
import { ContextNLPFusion } from '../nlp/ContextNLPFusion';

const router = Router();

// Initialize engines
const ragEngine = new DAGRAGEngine();
const promptToolkit = new PromptToolkit();
const nlpFusion = new ContextNLPFusion();

// ============================================================================
// DAG/RAG++ Endpoints
// ============================================================================

/**
 * Index documents for RAG
 */
router.post('/rag/index', async (req: Request, res: Response) => {
  try {
    const { documents } = req.body;
    
    if (!Array.isArray(documents)) {
      return res.status(400).json({ error: 'documents must be an array' });
    }
    
    await ragEngine.indexDocuments(documents);
    
    res.json({
      success: true,
      indexed: documents.length,
      stats: ragEngine.getStats()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Perform RAG++ generation
 */
router.post('/rag/generate', async (req: Request, res: Response) => {
  try {
    const { query, context } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }
    
    const answer = await ragEngine.generate(query, context);
    const stats = ragEngine.getStats();
    
    res.json({
      answer,
      query,
      stats
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Build and view query DAG
 */
router.post('/rag/dag', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }
    
    const dag = await ragEngine.buildQueryDAG(query);
    
    res.json({
      query,
      dag,
      nodeCount: dag.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get RAG statistics
 */
router.get('/rag/stats', (req: Request, res: Response) => {
  res.json(ragEngine.getStats());
});

// ============================================================================
// Prompt Toolkit Endpoints
// ============================================================================

/**
 * List all prompt templates
 */
router.get('/prompts/templates', (req: Request, res: Response) => {
  const { category } = req.query;
  const templates = promptToolkit.listTemplates(category as any);
  
  res.json({
    templates,
    count: templates.length
  });
});

/**
 * Get specific template
 */
router.get('/prompts/templates/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const template = promptToolkit.getTemplate(id);
  
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  res.json(template);
});

/**
 * Render prompt from template
 */
router.post('/prompts/render', (req: Request, res: Response) => {
  try {
    const { templateId, variables } = req.body;
    
    if (!templateId || !variables) {
      return res.status(400).json({ error: 'templateId and variables are required' });
    }
    
    const rendered = promptToolkit.renderPrompt(templateId, variables);
    
    res.json({
      templateId,
      rendered,
      variables
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Optimize a prompt
 */
router.post('/prompts/optimize', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }
    
    const result = await promptToolkit.optimizePrompt(prompt);
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Execute prompt chain
 */
router.post('/prompts/chain', async (req: Request, res: Response) => {
  try {
    const { chainId, input } = req.body;
    
    if (!chainId || !input) {
      return res.status(400).json({ error: 'chainId and input are required' });
    }
    
    const results = await promptToolkit.executeChain(chainId, input);
    
    res.json({
      chainId,
      results,
      stepCount: results.length
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Add custom template
 */
router.post('/prompts/templates', (req: Request, res: Response) => {
  try {
    const template = req.body;
    
    if (!template.id || !template.name || !template.template || !template.variables) {
      return res.status(400).json({ 
        error: 'id, name, template, and variables are required' 
      });
    }
    
    promptToolkit.addTemplate(template);
    
    res.json({
      success: true,
      template
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Search templates by tags
 */
router.post('/prompts/search', (req: Request, res: Response) => {
  const { tags } = req.body;
  
  if (!Array.isArray(tags)) {
    return res.status(400).json({ error: 'tags must be an array' });
  }
  
  const templates = promptToolkit.searchTemplates(tags);
  
  res.json({
    tags,
    templates,
    count: templates.length
  });
});

// ============================================================================
// NLP Fusion Endpoints
// ============================================================================

/**
 * Add context source
 */
router.post('/nlp/context', (req: Request, res: Response) => {
  try {
    const context = req.body;
    
    if (!context.id || !context.type || !context.content) {
      return res.status(400).json({ 
        error: 'id, type, and content are required' 
      });
    }
    
    context.timestamp = new Date();
    nlpFusion.addContext(context);
    
    res.json({
      success: true,
      context,
      stats: nlpFusion.getStats()
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Extract NLP features
 */
router.post('/nlp/features', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }
    
    const features = await nlpFusion.extractFeatures(text);
    
    res.json(features);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fuse multiple contexts
 */
router.post('/nlp/fuse', async (req: Request, res: Response) => {
  try {
    const { query, sourceIds } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }
    
    const fused = await nlpFusion.fuseContexts(query, sourceIds);
    
    res.json(fused);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get NLP statistics
 */
router.get('/nlp/stats', (req: Request, res: Response) => {
  res.json(nlpFusion.getStats());
});

export default router;
