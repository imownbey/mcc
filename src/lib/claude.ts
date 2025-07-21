import { Task } from '../types.ts';
import * as path from 'path';
import { existsSync } from 'fs';

export async function generateClaudeMd(
  task: Task,
  taskPath: string,
  customContent?: string
): Promise<void> {
  const claudeMdPath = path.join(taskPath, 'CLAUDE.md');
  
  let content = `# Task: ${task.name}\n\n`;
  
  if (task.description) {
    content += `## Description\n${task.description}\n\n`;
  }
  
  content += `## Task Information\n`;
  content += `- Branch: ${task.branch}\n`;
  content += `- Created: ${new Date(task.created).toLocaleString()}\n`;
  content += `- Status: ${task.status}\n`;
  content += `- Main Repository: ${task.mainRepo}\n\n`;
  
  content += `## Guidelines\n`;
  content += `This is a git worktree for the task "${task.name}". `;
  content += `You are working on branch "${task.branch}".\n\n`;
  
  if (customContent) {
    content += `## Custom Instructions\n${customContent}\n\n`;
  }
  
  content += `## Common Commands\n`;
  content += `- Run tests: [Update with your test command]\n`;
  content += `- Build: [Update with your build command]\n`;
  content += `- Lint: [Update with your lint command]\n`;
  
  await Bun.write(claudeMdPath, content);
}

export async function readClaudeMd(taskPath: string): Promise<string | null> {
  const claudeMdPath = path.join(taskPath, 'CLAUDE.md');
  
  if (!existsSync(claudeMdPath)) {
    return null;
  }
  
  const file = Bun.file(claudeMdPath);
  return await file.text();
}

export async function updateClaudeMd(
  taskPath: string,
  updater: (content: string) => string
): Promise<void> {
  const content = await readClaudeMd(taskPath) || '';
  const updated = updater(content);
  const claudeMdPath = path.join(taskPath, 'CLAUDE.md');
  await Bun.write(claudeMdPath, updated);
}