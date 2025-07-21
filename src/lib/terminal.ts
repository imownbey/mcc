import { $ } from 'bun';
import chalk from 'chalk';
import { Config } from '../types.ts';

export async function openInTerminal(
  path: string,
  taskName: string,
  config?: Config
): Promise<void> {
  const platform = process.platform;
  const terminal = config?.terminal || 'auto';
  
  if (platform === 'darwin') {
    await openMacTerminal(path, taskName, terminal);
  } else if (platform === 'linux') {
    await openLinuxTerminal(path, taskName, terminal);
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }
}

async function openMacTerminal(
  path: string,
  taskName: string,
  terminal: string
): Promise<void> {
  const command = `cd ${path} && claude`;
  
  if (terminal === 'ghostty' || (terminal === 'auto' && await isGhosttyInstalled())) {
    // Use open with -n (new instance) and -e with shell: prefix to run claude
    // shell: prefix allows us to use shell features like cd
    await $`open -n -a Ghostty --args --working-directory=${path} -e "shell:claude"`;
  } else if (terminal === 'iterm' || (terminal === 'auto' && await isITermInstalled())) {
    // Fixed AppleScript syntax
    await $`osascript -e 'tell application "iTerm" to create window with default profile'`;
    await $`osascript -e 'tell application "iTerm" to tell current session of current window to write text "cd ${path} && claude"'`;
  } else {
    // Fixed Terminal.app AppleScript
    await $`osascript -e 'tell application "Terminal" to do script "cd ${path} && claude"'`;
    await $`osascript -e 'tell application "Terminal" to activate'`;
  }
}

async function openLinuxTerminal(
  path: string,
  taskName: string,
  terminal: string
): Promise<void> {
  const terminals = terminal === 'auto' 
    ? ['gnome-terminal', 'konsole', 'xfce4-terminal', 'xterm']
    : [terminal];
  
  for (const term of terminals) {
    try {
      switch (term) {
        case 'gnome-terminal':
          await $`gnome-terminal --tab --working-directory=${path} -- bash -c "claude; exec bash"`;
          return;
        
        case 'konsole':
          await $`konsole --workdir ${path} -e bash -c "claude; exec bash"`;
          return;
        
        case 'xfce4-terminal':
          await $`xfce4-terminal --working-directory=${path} -x bash -c "claude; exec bash"`;
          return;
        
        case 'xterm':
          await $`xterm -e "cd ${path} && claude; bash"`;
          return;
      }
    } catch (error) {
      if (terminal !== 'auto') {
        throw error;
      }
    }
  }
  
  throw new Error('No supported terminal emulator found');
}

async function isITermInstalled(): Promise<boolean> {
  try {
    await $`osascript -e 'tell application "System Events" to return exists application process "iTerm"'`.quiet();
    return true;
  } catch {
    return false;
  }
}

async function isGhosttyInstalled(): Promise<boolean> {
  try {
    await $`test -d /Applications/Ghostty.app`.quiet();
    return true;
  } catch {
    return false;
  }
}