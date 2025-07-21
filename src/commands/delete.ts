import chalk from 'chalk';
import { existsSync } from 'fs';
import { getTask, deleteTask as deleteTaskRecord, getTaskPath } from '../lib/tasks.ts';
import { removeWorktree } from '../lib/git.ts';
import { $ } from 'bun';

interface DeleteOptions {
  force?: boolean;
}

export async function deleteCommand(name: string, options: DeleteOptions): Promise<void> {
  try {
    const task = await getTask(name);
    
    if (!task) {
      console.error(chalk.red(`Error: Task '${name}' not found`));
      console.log(chalk.gray('Run "mcc list" to see available tasks'));
      process.exit(1);
    }
    
    if (!options.force) {
      console.log(chalk.yellow(`This will delete task '${name}' and its worktree`));
      console.log(chalk.yellow(`Branch: ${task.branch}`));
      const prompt = await $`read -p "Are you sure? (y/N) " -n 1 -r; echo $REPLY`.quiet();
      
      if (!prompt.stdout.toString().trim().match(/^[Yy]$/)) {
        console.log(chalk.gray('\nCancelled'));
        return;
      }
      console.log();
    }
    
    const taskPath = getTaskPath(name);
    
    if (existsSync(taskPath)) {
      console.log(chalk.gray('Removing worktree...'));
      try {
        await removeWorktree(taskPath);
      } catch (error: any) {
        console.error(chalk.yellow('Warning: Could not remove worktree:'), error.message);
        console.log(chalk.gray('You may need to remove it manually'));
      }
    }
    
    console.log(chalk.gray('Removing task record...'));
    await deleteTaskRecord(name);
    
    console.log(chalk.green(`✓ Task '${name}' deleted successfully`));
    console.log(chalk.gray(`Note: Branch '${task.branch}' was not deleted from git`));
  } catch (error: any) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}