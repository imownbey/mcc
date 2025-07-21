import chalk from 'chalk';
import * as path from 'path';
import { saveConfig } from '../lib/config.ts';
import { isGitRepo } from '../lib/git.ts';

export async function initCommand(repoPath: string): Promise<void> {
  const absolutePath = path.resolve(repoPath);
  
  console.log(chalk.blue('Initializing MCC...'));
  
  if (!await isGitRepo(absolutePath)) {
    console.error(chalk.red(`Error: ${absolutePath} is not a git repository`));
    process.exit(1);
  }
  
  const config = {
    mainRepo: absolutePath,
    terminal: 'auto' as const,
    defaultBranchPrefix: 'mcc/',
    autoGenerateClaudeMd: true
  };
  
  await saveConfig(config);
  
  console.log(chalk.green('✓ MCC initialized successfully'));
  console.log(chalk.gray(`Main repository: ${absolutePath}`));
  console.log(chalk.gray('You can now create tasks with: mcc new <task-name>'));
}