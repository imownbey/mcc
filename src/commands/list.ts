import chalk from 'chalk';
import { listTasks } from '../lib/tasks.ts';
import { Task } from '../types.ts';

interface ListOptions {
  all?: boolean;
  active?: boolean;
}

export async function listCommand(options: ListOptions): Promise<void> {
  let filter: { status?: Task['status'] } | undefined;
  
  if (options.active) {
    filter = { status: 'active' };
  }
  
  const tasks = await listTasks(filter);
  
  if (tasks.length === 0) {
    console.log(chalk.gray('No tasks found'));
    console.log(chalk.gray('Create a new task with: mcc new <task-name>'));
    return;
  }
  
  console.log(chalk.bold('Tasks:'));
  console.log();
  
  for (const task of tasks) {
    const statusColor = {
      active: chalk.green,
      paused: chalk.yellow,
      completed: chalk.gray
    }[task.status];
    
    console.log(`${chalk.bold(task.name)} ${statusColor(`[${task.status}]`)}`);
    
    if (task.description) {
      console.log(chalk.gray(`  ${task.description}`));
    }
    
    console.log(chalk.gray(`  Branch: ${task.branch}`));
    console.log(chalk.gray(`  Last accessed: ${new Date(task.lastAccessed).toLocaleString()}`));
    console.log();
  }
}