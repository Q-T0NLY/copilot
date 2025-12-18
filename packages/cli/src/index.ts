#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { initCommand } from './commands/init';
import { chatCommand } from './commands/chat';
import { generateCommand } from './commands/generate';
import { completeCommand } from './commands/complete';
import { crawlCommand } from './commands/crawl';
import { settingsCommand } from './commands/settings';

const program = new Command();

// Display banner
console.log(
  chalk.cyan(
    figlet.textSync('AI Dev', {
      font: 'Standard',
      horizontalLayout: 'default'
    })
  )
);

console.log(chalk.yellow('🚀 World-class AI Development Platform\n'));

program
  .name('aidev')
  .description('Advanced AI-powered development CLI with code completion, generation, and more')
  .version('1.0.0');

// Commands
program
  .command('init')
  .description('Initialize AI Dev configuration')
  .action(initCommand);

program
  .command('chat')
  .description('Start interactive chat with AI assistant')
  .option('-m, --model <model>', 'LLM model to use')
  .action(chatCommand);

program
  .command('generate')
  .description('Generate code from description')
  .argument('<description>', 'What to generate')
  .option('-l, --language <language>', 'Programming language', 'typescript')
  .option('-o, --output <file>', 'Output file')
  .action(generateCommand);

program
  .command('complete')
  .description('Complete code snippet')
  .argument('<file>', 'File with code to complete')
  .option('-l, --language <language>', 'Programming language')
  .action(completeCommand);

program
  .command('crawl')
  .description('Crawl and analyze web pages')
  .argument('<url>', 'URL to crawl')
  .option('-j, --javascript', 'Enable JavaScript rendering')
  .option('-o, --output <file>', 'Save results to file')
  .action(crawlCommand);

program
  .command('settings')
  .description('Manage settings')
  .option('-l, --list', 'List all settings')
  .option('-s, --set <key=value>', 'Set a setting')
  .option('-g, --get <key>', 'Get a setting')
  .action(settingsCommand);

program.parse();
