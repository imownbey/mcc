import { Task, TaskRegistry } from '../types.ts';
import * as path from 'path';
import { existsSync } from 'fs';
import { nanoid } from 'nanoid';

const TASKS_FILE = 'tasks.json';

export function getTasksPath(): string {
  return path.join(process.cwd(), TASKS_FILE);
}

export async function loadTasks(): Promise<TaskRegistry> {
  const tasksPath = getTasksPath();
  
  if (!existsSync(tasksPath)) {
    return {
      version: '1.0.0',
      tasks: {}
    };
  }
  
  try {
    const file = Bun.file(tasksPath);
    const registry = await file.json();
    return registry as TaskRegistry;
  } catch (error) {
    console.error('Error loading tasks:', error);
    return {
      version: '1.0.0',
      tasks: {}
    };
  }
}

export async function saveTasks(registry: TaskRegistry): Promise<void> {
  const tasksPath = getTasksPath();
  await Bun.write(tasksPath, JSON.stringify(registry, null, 2));
}

export async function createTask(
  name: string,
  branch: string,
  mainRepo: string,
  description?: string
): Promise<Task> {
  const now = new Date().toISOString();
  
  const task: Task = {
    id: generateTaskId(),
    name,
    branch,
    mainRepo,
    created: now,
    lastAccessed: now,
    description,
    status: 'active'
  };
  
  const registry = await loadTasks();
  
  if (registry.tasks[name]) {
    throw new Error(`Task '${name}' already exists`);
  }
  
  registry.tasks[name] = task;
  await saveTasks(registry);
  
  return task;
}

export async function getTask(name: string): Promise<Task | null> {
  const registry = await loadTasks();
  return registry.tasks[name] || null;
}

export async function updateTask(name: string, updates: Partial<Task>): Promise<void> {
  const registry = await loadTasks();
  const task = registry.tasks[name];
  
  if (!task) {
    throw new Error(`Task '${name}' not found`);
  }
  
  registry.tasks[name] = { ...task, ...updates };
  await saveTasks(registry);
}

export async function deleteTask(name: string): Promise<void> {
  const registry = await loadTasks();
  
  if (!registry.tasks[name]) {
    throw new Error(`Task '${name}' not found`);
  }
  
  delete registry.tasks[name];
  await saveTasks(registry);
}

export async function listTasks(filter?: { status?: Task['status'] }): Promise<Task[]> {
  const registry = await loadTasks();
  let tasks = Object.values(registry.tasks);
  
  if (filter?.status) {
    tasks = tasks.filter(task => task.status === filter.status);
  }
  
  return tasks.sort((a, b) => 
    new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
  );
}

export function getTaskPath(taskName: string): string {
  return path.join(process.cwd(), 'tasks', taskName);
}

export function generateTaskId(): string {
  return nanoid(10);
}