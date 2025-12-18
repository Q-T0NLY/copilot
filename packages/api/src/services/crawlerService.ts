import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer, { Browser } from 'puppeteer';

export interface CrawlResult {
  url: string;
  title: string;
  content: string;
  links: string[];
  timestamp: Date;
}

export class CrawlerService {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async crawl(url: string, javascript = false): Promise<CrawlResult> {
    if (javascript) {
      return this.crawlWithPuppeteer(url);
    }
    return this.crawlStatic(url);
  }

  private async crawlStatic(url: string): Promise<CrawlResult> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'AI-Dev-Platform-Crawler/1.0'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // Remove script and style elements
    $('script, style').remove();

    const title = $('title').text().trim();
    const content = $('body').text().trim().replace(/\s+/g, ' ');
    const links = $('a')
      .map((_, el) => $(el).attr('href'))
      .get()
      .filter((href): href is string => !!href && href.startsWith('http'));

    return {
      url,
      title,
      content,
      links,
      timestamp: new Date()
    };
  }

  private async crawlWithPuppeteer(url: string): Promise<CrawlResult> {
    await this.initialize();

    const page = await this.browser!.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
      const title = document.title;
      const content = document.body.innerText;
      const links = Array.from(document.querySelectorAll('a'))
        .map(a => a.href)
        .filter(href => href.startsWith('http'));

      return { title, content, links };
    });

    await page.close();

    return {
      url,
      ...data,
      timestamp: new Date()
    };
  }

  async scrapeMultiple(urls: string[], javascript = false): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];

    for (const url of urls) {
      try {
        const result = await this.crawl(url, javascript);
        results.push(result);
      } catch (error) {
        console.error(`Failed to crawl ${url}:`, error);
      }
    }

    return results;
  }
}
