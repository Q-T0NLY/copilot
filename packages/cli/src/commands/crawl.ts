import chalk from 'chalk';
import ora from 'ora';
import Conf from 'conf';
import axios from 'axios';
import fs from 'fs/promises';

const config = new Conf({ projectName: 'ai-dev-platform' });

export async function crawlCommand(url: string, options: any) {
  console.log(chalk.blue(`🕷️  Crawling ${url}...\n`));

  const apiUrl = config.get('apiUrl', 'http://localhost:3001') as string;
  const apiKey = config.get('apiKey', 'dev-key-12345') as string;

  const spinner = ora('Crawling web page...').start();

  try {
    const response = await axios.post(
      `${apiUrl}/api/crawler/crawl`,
      {
        url,
        javascript: options.javascript || false
      },
      {
        headers: { 'x-api-key': apiKey }
      }
    );

    spinner.succeed('Crawl completed!');

    const result = response.data.result;
    
    console.log(chalk.green('\n📄 Page Information:\n'));
    console.log(chalk.white(`Title: ${result.title}`));
    console.log(chalk.white(`URL: ${result.url}`));
    console.log(chalk.white(`Links found: ${result.links.length}`));
    console.log(chalk.white(`Content length: ${result.content.length} characters`));

    if (options.output) {
      await fs.writeFile(options.output, JSON.stringify(result, null, 2));
      console.log(chalk.green(`\n✅ Results saved to ${options.output}`));
    }
  } catch (error: any) {
    spinner.fail('Failed to crawl page');
    console.log(chalk.red('❌ Error:'), error.message);
  }
}
