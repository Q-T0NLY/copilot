import chalk from 'chalk';
import ora from 'ora';
import Conf from 'conf';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const config = new Conf({ projectName: 'ai-dev-platform' });

export async function completeCommand(file: string, options: any) {
  console.log(chalk.blue(`🔧 Completing code in ${file}...\n`));

  const apiUrl = config.get('apiUrl', 'http://localhost:3001') as string;
  const apiKey = config.get('apiKey', 'dev-key-12345') as string;

  const spinner = ora('Reading file...').start();

  try {
    const code = await fs.readFile(file, 'utf-8');
    const language = options.language || path.extname(file).slice(1) || 'typescript';

    spinner.text = 'Completing code...';

    const response = await axios.post(
      `${apiUrl}/api/llm/code/complete`,
      { code, language },
      {
        headers: { 'x-api-key': apiKey }
      }
    );

    spinner.succeed('Code completion ready!');

    const completion = response.data.completion;
    
    console.log(chalk.green('\n📝 Suggested Completion:\n'));
    console.log(chalk.white(completion));
  } catch (error: any) {
    spinner.fail('Failed to complete code');
    console.log(chalk.red('❌ Error:'), error.message);
  }
}
