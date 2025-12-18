import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import Conf from 'conf';
import axios from 'axios';

const config = new Conf({ projectName: 'ai-dev-platform' });

export async function chatCommand(options: any) {
  console.log(chalk.blue('💬 Starting AI Chat Session...\n'));
  console.log(chalk.gray('Type "exit" or "quit" to end the session.\n'));

  const apiUrl = config.get('apiUrl', 'http://localhost:3001') as string;
  const apiKey = config.get('apiKey', 'dev-key-12345') as string;
  const provider = config.get('defaultProvider', 'openai') as string;
  const model = options.model || config.get('defaultModel', 'gpt-4') as string;

  const conversationHistory: string[] = [];

  while (true) {
    const { message } = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: chalk.cyan('You:'),
        validate: (input) => input.trim().length > 0 || 'Message cannot be empty'
      }
    ]);

    if (message.toLowerCase() === 'exit' || message.toLowerCase() === 'quit') {
      console.log(chalk.yellow('\n👋 Ending chat session. Goodbye!\n'));
      break;
    }

    const spinner = ora('Thinking...').start();

    try {
      const response = await axios.post(
        `${apiUrl}/api/llm/complete`,
        {
          provider,
          model,
          prompt: message,
          context: conversationHistory.slice(-5) // Last 5 messages for context
        },
        {
          headers: { 'x-api-key': apiKey }
        }
      );

      spinner.stop();

      const completion = response.data.completion;
      console.log(chalk.green('\n🤖 AI:'), completion, '\n');

      conversationHistory.push(`User: ${message}`);
      conversationHistory.push(`AI: ${completion}`);
    } catch (error: any) {
      spinner.stop();
      console.log(chalk.red('\n❌ Error:'), error.message, '\n');
    }
  }
}
