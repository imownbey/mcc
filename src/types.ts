export interface Task {
  id: string;
  name: string;
  branch: string;
  mainRepo: string;
  created: string;
  lastAccessed: string;
  description?: string;
  status: 'active' | 'paused' | 'completed';
  customClaudeMd?: string;
}

export interface TaskRegistry {
  version: string;
  tasks: Record<string, Task>;
}

export interface Config {
  mainRepo: string;
  terminal?: 'auto' | 'ghostty' | 'iterm' | 'terminal' | 'gnome-terminal' | 'konsole' | 'xterm';
  defaultBranchPrefix?: string;
  autoGenerateClaudeMd?: boolean;
}

export interface WorktreeInfo {
  worktree: string;
  bare?: boolean;
  HEAD: string;
  branch?: string;
  detached?: boolean;
}