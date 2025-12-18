import chalk from 'chalk';
import Conf from 'conf';
import Table from 'cli-table3';

const config = new Conf({ projectName: 'ai-dev-platform' });

export async function settingsCommand(options: any) {
  if (options.list) {
    console.log(chalk.blue('⚙️  Current Settings:\n'));
    
    const table = new Table({
      head: [chalk.cyan('Key'), chalk.cyan('Value')],
      colWidths: [30, 50]
    });

    const settings = config.store;
    for (const [key, value] of Object.entries(settings)) {
      table.push([key, String(value)]);
    }

    console.log(table.toString());
  } else if (options.set) {
    const [key, value] = options.set.split('=');
    
    if (!key || !value) {
      console.log(chalk.red('❌ Invalid format. Use: --set key=value'));
      return;
    }

    config.set(key, value);
    console.log(chalk.green(`✅ Set ${key} = ${value}`));
  } else if (options.get) {
    const value = config.get(options.get);
    
    if (value === undefined) {
      console.log(chalk.yellow(`⚠️  Setting "${options.get}" not found`));
    } else {
      console.log(chalk.green(`${options.get} = ${value}`));
    }
  } else {
    console.log(chalk.yellow('ℹ️  Use --list, --set, or --get options'));
  }
}
