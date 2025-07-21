import { $ } from 'bun';
import { WorktreeInfo } from '../types.ts';
import * as path from 'path';

export async function isGitRepo(repoPath: string): Promise<boolean> {
  try {
    await $`cd ${repoPath} && git rev-parse --git-dir`.quiet();
    return true;
  } catch {
    return false;
  }
}

export async function createWorktree(
  mainRepo: string,
  worktreePath: string,
  branch: string
): Promise<void> {
  try {
    await $`cd ${mainRepo} && git worktree add ${worktreePath} -b ${branch}`.quiet();
  } catch (error: any) {
    if (error.stderr?.includes('already exists')) {
      throw new Error(`Branch '${branch}' already exists. Use a different branch name or checkout the existing branch.`);
    }
    throw error;
  }
}

export async function createWorktreeFromExisting(
  mainRepo: string,
  worktreePath: string,
  branch: string
): Promise<void> {
  try {
    await $`cd ${mainRepo} && git worktree add ${worktreePath} ${branch}`.quiet();
  } catch (error: any) {
    if (error.stderr?.includes('already exists')) {
      throw new Error(`Worktree path '${worktreePath}' already exists. Delete it first with 'mcc delete ${path.basename(worktreePath)}'`);
    } else if (error.stderr?.includes('is already checked out')) {
      throw new Error(`Branch '${branch}' is already checked out in another worktree`);
    }
    throw new Error(`Failed to create worktree: ${error.stderr || error.message}`);
  }
}

export async function removeWorktree(worktreePath: string): Promise<void> {
  await $`git worktree remove ${worktreePath} --force`.quiet();
}

export async function listWorktrees(mainRepo: string): Promise<WorktreeInfo[]> {
  const result = await $`cd ${mainRepo} && git worktree list --porcelain`.quiet();
  const output = result.stdout.toString();
  
  const worktrees: WorktreeInfo[] = [];
  const lines = output.trim().split('\n');
  
  let currentWorktree: Partial<WorktreeInfo> = {};
  
  for (const line of lines) {
    if (line.startsWith('worktree ')) {
      if (currentWorktree.worktree) {
        worktrees.push(currentWorktree as WorktreeInfo);
      }
      currentWorktree = { worktree: line.substring(9) };
    } else if (line === 'bare') {
      currentWorktree.bare = true;
    } else if (line.startsWith('HEAD ')) {
      currentWorktree.HEAD = line.substring(5);
    } else if (line.startsWith('branch ')) {
      currentWorktree.branch = line.substring(7);
    } else if (line === 'detached') {
      currentWorktree.detached = true;
    }
  }
  
  if (currentWorktree.worktree) {
    worktrees.push(currentWorktree as WorktreeInfo);
  }
  
  return worktrees;
}

export async function getGitStatus(worktreePath: string): Promise<string> {
  const result = await $`cd ${worktreePath} && git status --short`.quiet();
  return result.stdout.toString();
}

export async function getCurrentBranch(worktreePath: string): Promise<string> {
  const result = await $`cd ${worktreePath} && git branch --show-current`.quiet();
  return result.stdout.toString().trim();
}

export async function branchExists(mainRepo: string, branchName: string): Promise<boolean> {
  try {
    await $`cd ${mainRepo} && git show-ref --verify --quiet refs/heads/${branchName}`.quiet();
    return true;
  } catch {
    return false;
  }
}

export async function fetchBranch(mainRepo: string, branchName: string): Promise<void> {
  await $`cd ${mainRepo} && git fetch origin ${branchName}:${branchName}`.quiet();
}