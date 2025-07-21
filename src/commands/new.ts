import chalk from 'chalk';
import * as path from 'path';
import { existsSync } from 'fs';
import { requireConfig } from '../lib/config.ts';
import { createWorktree, createWorktreeFromExisting, branchExists } from '../lib/git.ts';
import { createTask, getTask, getTaskPath } from '../lib/tasks.ts';
import { generateClaudeMd } from '../lib/claude.ts';
import { openInTerminal } from '../lib/terminal.ts';

interface NewOptions {
  branch?: string;
  description?: string;
  open?: boolean;
}

export async function newCommand(name: string, options: NewOptions): Promise<void> {
  try {
    const config = await requireConfig();
    
    if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
      console.error(chalk.red('Error: Task name must contain only letters, numbers, hyphens, and underscores'));
      process.exit(1);
    }
    
    const branch = options.branch || `${config.defaultBranchPrefix || 'mcc/'}${name}`;
    
    console.log(chalk.blue(`Creating new task '${name}'...`));
    
    const taskPath = getTaskPath(name);
    
    // Check if worktree already exists
    if (existsSync(taskPath)) {
      console.error(chalk.red(`Error: Task directory already exists at ${taskPath}`));
      console.log(chalk.gray(`Delete it first with 'mcc delete ${name}' or use 'mcc open ${name}' to open it`));
      process.exit(1);
    }
    
    if (await branchExists(config.mainRepo, branch)) {
      console.log(chalk.yellow(`Branch '${branch}' already exists, checking it out...`));
      console.log(chalk.gray(`Creating worktree at ${taskPath}`));
      await createWorktreeFromExisting(config.mainRepo, taskPath, branch);
    } else {
      console.log(chalk.gray(`Creating worktree at ${taskPath}`));
      await createWorktree(config.mainRepo, taskPath, branch);
    }
    
    let task;
    try {
      task = await createTask(name, branch, config.mainRepo, options.description);
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log(chalk.yellow(`Task '${name}' already exists in registry`));
        const existingTask = await getTask(name);
        if (existingTask) {
          task = existingTask;
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
    
    if (config.autoGenerateClaudeMd !== false) {
      console.log(chalk.gray('Generating CLAUDE.md'));
      await generateClaudeMd(task, taskPath);
    }
    
    console.log(chalk.green(`✓ Task '${name}' created successfully`));
    console.log(chalk.gray(`Branch: ${branch}`));
    console.log(chalk.gray(`Path: ${taskPath}`));
    
    if (options.open !== false) {
      console.log(chalk.blue('Opening in terminal...'));
      await openInTerminal(taskPath, name, config);
    } else {
      console.log(chalk.gray(`Run 'mcc open ${name}' to start working`));
    }
  } catch (error: any) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}