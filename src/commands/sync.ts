import chalk from 'chalk';
import { $ } from 'bun';
import { existsSync } from 'fs';

interface SyncOptions {
  remote?: string;
}

export async function syncCommand(options: SyncOptions): Promise<void> {
  try {
    console.log(chalk.blue('Syncing task metadata...'));
    
    if (!existsSync('.git')) {
      console.error(chalk.red('Error: Not in a git repository'));
      console.log(chalk.gray('Run this command from the MCC directory'));
      process.exit(1);
    }
    
    // Check if tasks.json exists
    if (!existsSync('tasks.json')) {
      console.log(chalk.yellow('No tasks.json found - nothing to sync'));
      return;
    }
    
    // Determine which remote to use
    const remote = options.remote || 'origin';
    
    // Check if we're in a multi-repo setup by looking for multiple remotes
    const remotes = await $`git remote`.quiet();
    const remotesList = remotes.stdout.toString().trim().split('\n').filter(Boolean);
    
    if (remotesList.length > 1 && !options.remote) {
      console.log(chalk.yellow('Multiple remotes detected. Using default remote: origin'));
      console.log(chalk.gray('Specify a different remote with --remote <name>'));
      console.log(chalk.gray(`Available remotes: ${remotesList.join(', ')}`));
    }
    
    try {
      const status = await $`git status --porcelain tasks.json`.quiet();
      
      if (status.stdout.toString().trim()) {
        console.log(chalk.gray('Committing task metadata...'));
        await $`git add tasks.json`;
        await $`git commit -m "Update task metadata" --no-verify`.quiet();
      }
    } catch (error) {
      // No changes to commit
    }
    
    console.log(chalk.gray(`Pulling from ${remote}...`));
    try {
      await $`git pull ${remote} --rebase`.quiet();
    } catch (error: any) {
      if (error.stderr?.includes('no tracking information')) {
        console.log(chalk.yellow(`No tracking branch set for remote '${remote}'`));
      } else if (error.stderr?.includes('couldn\'t find remote ref')) {
        console.log(chalk.yellow(`Remote '${remote}' has no commits yet`));
      } else {
        throw error;
      }
    }
    
    console.log(chalk.gray(`Pushing to ${remote}...`));
    try {
      await $`git push ${remote}`.quiet();
    } catch (error: any) {
      if (error.stderr?.includes('no upstream branch')) {
        console.log(chalk.yellow(`No upstream branch set for remote '${remote}'`));
        const currentBranch = await $`git branch --show-current`.quiet();
        const branch = currentBranch.stdout.toString().trim();
        console.log(chalk.gray(`Set upstream with: git push -u ${remote} ${branch}`));
      } else {
        throw error;
      }
    }
    
    console.log(chalk.green(`✓ Sync complete with remote '${remote}'`));
  } catch (error: any) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}