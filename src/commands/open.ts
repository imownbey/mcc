import chalk from 'chalk';
import { existsSync } from 'fs';
import { requireConfig } from '../lib/config.ts';
import { getTask, updateTask, getTaskPath } from '../lib/tasks.ts';
import { openInTerminal } from '../lib/terminal.ts';

export async function openCommand(name: string): Promise<void> {
  try {
    const config = await requireConfig();
    const task = await getTask(name);
    
    if (!task) {
      console.error(chalk.red(`Error: Task '${name}' not found`));
      console.log(chalk.gray('Run "mcc list" to see available tasks'));
      process.exit(1);
    }
    
    const taskPath = getTaskPath(name);
    
    if (!existsSync(taskPath)) {
      console.error(chalk.red(`Error: Task directory not found at ${taskPath}`));
      console.log(chalk.gray(`Run 'mcc resume ${name}' to recreate the worktree`));
      process.exit(1);
    }
    
    await updateTask(name, { 
      lastAccessed: new Date().toISOString(),
      status: 'active'
    });
    
    console.log(chalk.blue(`Opening task '${name}'...`));
    await openInTerminal(taskPath, name, config);
  } catch (error: any) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}