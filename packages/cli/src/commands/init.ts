import inquirer from 'inquirer';
import chalk from 'chalk';
import Conf from 'conf';
import boxen from 'boxen';

const config = new Conf({ projectName: 'ai-dev-platform' });

export async function initCommand() {
  console.log(chalk.blue('🔧 Initializing AI Dev Platform...\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiUrl',
      message: 'API Gateway URL:',
      default: config.get('apiUrl', 'http://localhost:3001')
    },
    {
      type: 'password',
      name: 'apiKey',
      message: 'API Key:',
      default: config.get('apiKey', 'dev-key-12345')
    },
    {
      type: 'list',
      name: 'defaultProvider',
      message: 'Default LLM Provider:',
      choices: ['openai', 'anthropic'],
      default: config.get('defaultProvider', 'openai')
    },
    {
      type: 'input',
      name: 'defaultModel',
      message: 'Default Model:',
      default: config.get('defaultModel', 'gpt-4')
    }
  ]);

  // Save configuration
  config.set('apiUrl', answers.apiUrl);
  config.set('apiKey', answers.apiKey);
  config.set('defaultProvider', answers.defaultProvider);
  config.set('defaultModel', answers.defaultModel);

  console.log(
    boxen(
      chalk.green('✅ Configuration saved successfully!\n\n') +
      chalk.white('Settings:\n') +
      chalk.gray(`API URL: ${answers.apiUrl}\n`) +
      chalk.gray(`Provider: ${answers.defaultProvider}\n`) +
      chalk.gray(`Model: ${answers.defaultModel}`),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green'
      }
    )
  );
}
