import { Config } from '../types.ts';
import * as path from 'path';
import { existsSync } from 'fs';

const CONFIG_FILE = 'config.json';

export function getConfigPath(): string {
  return path.join(process.cwd(), CONFIG_FILE);
}

export async function loadConfig(): Promise<Config | null> {
  const configPath = getConfigPath();
  
  if (!existsSync(configPath)) {
    return null;
  }
  
  try {
    const file = Bun.file(configPath);
    const config = await file.json();
    return config as Config;
  } catch (error) {
    console.error('Error loading config:', error);
    return null;
  }
}

export async function saveConfig(config: Config): Promise<void> {
  const configPath = getConfigPath();
  await Bun.write(configPath, JSON.stringify(config, null, 2));
}

export async function requireConfig(): Promise<Config> {
  const config = await loadConfig();
  
  if (!config) {
    throw new Error('No configuration found. Please run "mcc init <repo-path>" first.');
  }
  
  return config;
}