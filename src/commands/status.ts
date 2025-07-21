import chalk from 'chalk';
import { existsSync } from 'fs';
import { listTasks, getTask, getTaskPath } from '../lib/tasks.ts';
import { getGitStatus, getCurrentBranch } from '../lib/git.ts';

export async function statusCommand(name?: string): Promise<void> {
  try {
    if (name) {
      await showTaskStatus(name);
    } else {
      await showAllStatus();
    }
  } catch (error: any) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

async function showTaskStatus(name: string): Promise<void> {
  const task = await getTask(name);
  
  if (!task) {
    console.error(chalk.red(`Error: Task '${name}' not found`));
    process.exit(1);
  }
  
  const taskPath = getTaskPath(name);
  
  console.log(chalk.bold(`Task: ${name}`));
  console.log(chalk.gray(`Status: ${task.status}`));
  console.log(chalk.gray(`Branch: ${task.branch}`));
  
  if (!existsSync(taskPath)) {
    console.log(chalk.yellow('Worktree not found locally'));
    console.log(chalk.gray(`Run 'mcc resume ${name}' to recreate it`));
    return;
  }
  
  try {
    const currentBranch = await getCurrentBranch(taskPath);
    if (currentBranch !== task.branch) {
      console.log(chalk.yellow(`Warning: Current branch (${currentBranch}) differs from task branch (${task.branch})`));
    }
    
    const status = await getGitStatus(taskPath);
    
    if (status.trim()) {
      console.log('\nGit status:');
      console.log(status);
    } else {
      console.log(chalk.green('\n✓ Working tree clean'));
    }
  } catch (error: any) {
    console.log(chalk.red('\nCould not get git status:'), error.message);
  }
}

async function showAllStatus(): Promise<void> {
  const tasks = await listTasks({ status: 'active' });
  
  if (tasks.length === 0) {
    console.log(chalk.gray('No active tasks'));
    return;
  }
  
  console.log(chalk.bold('Active Tasks:'));
  console.log();
  
  for (const task of tasks) {
    const taskPath = getTaskPath(task.name);
    
    console.log(chalk.bold(task.name));
    console.log(chalk.gray(`  Branch: ${task.branch}`));
    
    if (!existsSync(taskPath)) {
      console.log(chalk.yellow('  Worktree not found locally'));
    } else {
      try {
        const status = await getGitStatus(taskPath);
        if (status.trim()) {
          const lines = status.trim().split('\n');
          console.log(chalk.yellow(`  ${lines.length} file(s) with changes`));
        } else {
          console.log(chalk.green('  ✓ Clean'));
        }
      } catch {
        console.log(chalk.red('  Could not get status'));
      }
    }
    console.log();
  }
}