import { Router } from 'express';
import { LLMService } from '../services/llmService';

const router = Router();
const llmService = new LLMService();

router.get('/providers', async (_req, res, next) => {
  try {
    const providers = await llmService.getProviders();
    res.json({ providers });
  } catch (error) {
    next(error);
  }
});

router.post('/complete', async (req, res, next) => {
  try {
    const { provider, model, prompt, maxTokens, temperature, context } = req.body;

    if (!provider || !model || !prompt) {
      res.status(400).json({ 
        error: 'Provider, model, and prompt are required' 
      });
      return;
    }

    const completion = await llmService.complete({
      provider,
      model,
      prompt,
      maxTokens,
      temperature,
      context
    });

    res.json({ completion });
  } catch (error) {
    next(error);
  }
});

router.post('/code/complete', async (req, res, next) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      res.status(400).json({ 
        error: 'Code and language are required' 
      });
      return;
    }

    const completion = await llmService.codeCompletion(code, language);
    res.json({ completion });
  } catch (error) {
    next(error);
  }
});

router.post('/code/generate', async (req, res, next) => {
  try {
    const { description, language } = req.body;

    if (!description || !language) {
      res.status(400).json({ 
        error: 'Description and language are required' 
      });
      return;
    }

    const code = await llmService.generateCode(description, language);
    res.json({ code });
  } catch (error) {
    next(error);
  }
});

export { router as llmRouter };
