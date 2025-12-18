import { Router } from 'express';
import { ApiKeyService } from '../services/apiKeyService';

const router = Router();
const apiKeyService = new ApiKeyService();

router.post('/register', async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const apiKey = await apiKeyService.generateKey(name);
    res.json({ apiKey, message: 'API key generated successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/keys', async (_req, res, next) => {
  try {
    const keys = await apiKeyService.listKeys();
    res.json({ keys });
  } catch (error) {
    next(error);
  }
});

router.delete('/keys/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const revoked = await apiKeyService.revokeKey(key);
    
    if (revoked) {
      res.json({ message: 'API key revoked successfully' });
    } else {
      res.status(404).json({ error: 'API key not found' });
    }
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };
