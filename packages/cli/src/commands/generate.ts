import chalk from 'chalk';
import ora from 'ora';
import Conf from 'conf';
import axios from 'axios';
import fs from 'fs/promises';

const config = new Conf({ projectName: 'ai-dev-platform' });

export async function generateCommand(description: string, options: any) {
  console.log(chalk.blue(`🚀 Generating ${options.language} code...\n`));

  const apiUrl = config.get('apiUrl', 'http://localhost:3001') as string;
  const apiKey = config.get('apiKey', 'dev-key-12345') as string;

  const spinner = ora('Generating code...').start();

  try {
    const response = await axios.post(
      `${apiUrl}/api/llm/code/generate`,
      {
        description,
        language: options.language
      },
      {
        headers: { 'x-api-key': apiKey }
      }
    );

    spinner.succeed('Code generated successfully!');

    const code = response.data.code;
    
    console.log(chalk.green('\n📝 Generated Code:\n'));
    console.log(chalk.white(code));

    if (options.output) {
      await fs.writeFile(options.output, code);
      console.log(chalk.green(`\n✅ Saved to ${options.output}`));
    }
  } catch (error: any) {
    spinner.fail('Failed to generate code');
    console.log(chalk.red('❌ Error:'), error.message);
  }
}
