import chalk from 'chalk';
import { $ } from 'bun';
import { existsSync } from 'fs';

export async function syncCommand(): Promise<void> {
  try {
    console.log(chalk.blue('Syncing task metadata...'));
    
    if (!existsSync('.git')) {
      console.error(chalk.red('Error: Not in a git repository'));
      console.log(chalk.gray('Run this command from the MCC directory'));
      process.exit(1);
    }
    
    try {
      const status = await $`git status --porcelain`.quiet();
      
      if (status.stdout.toString().trim()) {
        console.log(chalk.gray('Committing local changes...'));
        await $`git add tasks.json`;
        await $`git commit -m "Update task metadata" --no-verify`.quiet();
      }
    } catch (error) {
      // No changes to commit
    }
    
    console.log(chalk.gray('Pulling remote changes...'));
    try {
      await $`git pull --rebase`.quiet();
    } catch (error: any) {
      if (error.stderr?.includes('no tracking information')) {
        console.log(chalk.yellow('No remote tracking branch set'));
      } else {
        throw error;
      }
    }
    
    console.log(chalk.gray('Pushing local changes...'));
    try {
      await $`git push`.quiet();
    } catch (error: any) {
      if (error.stderr?.includes('no upstream branch')) {
        console.log(chalk.yellow('No upstream branch set'));
        console.log(chalk.gray('Set upstream with: git push -u origin <branch>'));
      } else {
        throw error;
      }
    }
    
    console.log(chalk.green('✓ Sync complete'));
  } catch (error: any) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}