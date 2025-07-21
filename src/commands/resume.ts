import chalk from 'chalk';
import { existsSync } from 'fs';
import { requireConfig } from '../lib/config.ts';
import { getTask, updateTask, getTaskPath } from '../lib/tasks.ts';
import { createWorktreeFromExisting, branchExists, fetchBranch } from '../lib/git.ts';
import { generateClaudeMd } from '../lib/claude.ts';
import { openInTerminal } from '../lib/terminal.ts';

interface ResumeOptions {
  open?: boolean;
}

export async function resumeCommand(name: string, options: ResumeOptions): Promise<void> {
  try {
    const config = await requireConfig();
    const task = await getTask(name);
    
    if (!task) {
      console.error(chalk.red(`Error: Task '${name}' not found`));
      console.log(chalk.gray('Run "mcc list" to see available tasks'));
      process.exit(1);
    }
    
    const taskPath = getTaskPath(name);
    
    if (existsSync(taskPath)) {
      console.log(chalk.yellow(`Task directory already exists at ${taskPath}`));
      
      if (options.open !== false) {
        await updateTask(name, { 
          lastAccessed: new Date().toISOString(),
          status: 'active'
        });
        console.log(chalk.blue('Opening in terminal...'));
        await openInTerminal(taskPath, name, config);
      }
      return;
    }
    
    console.log(chalk.blue(`Resuming task '${name}'...`));
    
    if (!await branchExists(config.mainRepo, task.branch)) {
      console.log(chalk.gray(`Branch '${task.branch}' not found locally, fetching from origin...`));
      try {
        await fetchBranch(config.mainRepo, task.branch);
      } catch (error) {
        console.error(chalk.red(`Error: Could not fetch branch '${task.branch}' from origin`));
        process.exit(1);
      }
    }
    
    console.log(chalk.gray(`Creating worktree at ${taskPath}`));
    await createWorktreeFromExisting(config.mainRepo, taskPath, task.branch);
    
    if (config.autoGenerateClaudeMd !== false && !existsSync(`${taskPath}/CLAUDE.md`)) {
      console.log(chalk.gray('Generating CLAUDE.md'));
      await generateClaudeMd(task, taskPath, task.customClaudeMd);
    }
    
    await updateTask(name, { 
      lastAccessed: new Date().toISOString(),
      status: 'active'
    });
    
    console.log(chalk.green(`✓ Task '${name}' resumed successfully`));
    
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