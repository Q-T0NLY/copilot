import { Router } from 'express';
import { CrawlerService } from '../services/crawlerService';

const router = Router();
const crawlerService = new CrawlerService();

router.post('/crawl', async (req, res, next) => {
  try {
    const { url, javascript = false } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const result = await crawlerService.crawl(url, javascript);
    res.json({ result });
  } catch (error) {
    next(error);
  }
});

router.post('/crawl/batch', async (req, res, next) => {
  try {
    const { urls, javascript = false } = req.body;

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'URLs array is required' });
    }

    const results = await crawlerService.scrapeMultiple(urls, javascript);
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

export { router as crawlerRouter };
