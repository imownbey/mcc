#!/usr/bin/env bun

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.ts';
import { newCommand } from './commands/new.ts';
import { listCommand } from './commands/list.ts';
import { openCommand } from './commands/open.ts';
import { resumeCommand } from './commands/resume.ts';
import { deleteCommand } from './commands/delete.ts';
import { statusCommand } from './commands/status.ts';
import { syncCommand } from './commands/sync.ts';

const program = new Command();

program
  .name('mcc')
  .description('Multi-Claude Code - Manage multiple Claude Code instances with git worktrees')
  .version('1.0.0');

program
  .command('init <repo-path>')
  .description('Initialize MCC with your main repository')
  .action(initCommand);

program
  .command('new <name>')
  .description('Create a new task with a git worktree')
  .option('-b, --branch <branch>', 'Branch name (default: mcc/<name>)')
  .option('-d, --description <desc>', 'Task description')
  .option('--no-open', "Don't open in terminal after creation")
  .action(newCommand);

program
  .command('list')
  .description('List all tasks')
  .option('-a, --all', 'Show all tasks (including completed)')
  .option('--active', 'Show only active tasks')
  .action(listCommand);

program
  .command('open <name>')
  .description('Open a task in a new terminal')
  .action(openCommand);

program
  .command('resume <name>')
  .description('Resume a task (recreate worktree if needed)')
  .option('--no-open', "Don't open in terminal after resuming")
  .action(resumeCommand);

program
  .command('delete <name>')
  .description('Delete a task and its worktree')
  .option('-f, --force', 'Skip confirmation')
  .action(deleteCommand);

program
  .command('status [name]')
  .description('Show git status for task(s)')
  .action(statusCommand);

program
  .command('sync')
  .description('Sync task metadata with remote repository')
  .option('-r, --remote <remote>', 'Specify which remote to sync with (default: origin)')
  .action(syncCommand);

program.addHelpText('after', `
Examples:
  $ mcc init ~/projects/my-app
  $ mcc new auth-feature -d "Add user authentication"
  $ mcc list
  $ mcc open auth-feature
  $ mcc status
  $ mcc sync
`);

try {
  await program.parseAsync(process.argv);
} catch (error: any) {
  console.error(chalk.red('Unexpected error:'), error.message);
  process.exit(1);
}