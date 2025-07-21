# MCC - Multi-Claude Code

A command-line tool for managing multiple Claude Code instances using git worktrees. MCC allows you to work on multiple tasks in parallel, each in its own isolated environment with its own git branch.

## Features

- **Git Worktree Integration**: Each task gets its own worktree, allowing parallel work on different branches
- **Task Management**: Create, list, resume, and delete tasks with ease
- **Cross-Machine Sync**: Share task metadata between machines using git
- **Automatic CLAUDE.md Generation**: Each task gets a customized CLAUDE.md with context
- **Terminal Integration**: Automatically opens tasks in new terminal tabs

## Installation

### Prerequisites

- [Bun](https://bun.sh) runtime
- Git
- macOS or Linux (Windows WSL supported)

### Install from source

```bash
# Clone this repository
git clone <your-mcc-repo>
cd mcc

# Install dependencies
bun install

# Link globally
bun link
```

### Build standalone binary

```bash
bun run build
# This creates a standalone 'mcc' executable
```

## Usage

### Initialize MCC with your project

```bash
# Set up MCC to work with your main repository
mcc init ~/projects/my-app
```

### Create a new task

```bash
# Create a task with default branch name (mcc/task-name)
mcc new auth-feature -d "Add user authentication"

# Create a task with custom branch name
mcc new auth-feature -b feature/authentication
```

### List tasks

```bash
# List all active tasks
mcc list

# List all tasks including completed ones
mcc list --all
```

### Open a task

```bash
# Open task in a new terminal tab
mcc open auth-feature
```

### Resume a task on another machine

```bash
# First, sync to get the latest task metadata
mcc sync

# Resume the task (creates worktree from existing branch)
mcc resume auth-feature
```

### Check task status

```bash
# Show git status for all active tasks
mcc status

# Show status for a specific task
mcc status auth-feature
```

### Delete a task

```bash
# Delete task and its worktree (branch remains in git)
mcc delete auth-feature

# Skip confirmation
mcc delete auth-feature --force
```

### Sync task metadata

```bash
# Push/pull task metadata to share between machines
mcc sync
```

## How it works

1. **Task Creation**: When you create a task, MCC:
   - Creates a new git worktree in `tasks/<task-name>`
   - Creates a new branch for the task
   - Generates a CLAUDE.md file with task context
   - Opens Claude Code in a new terminal

2. **Task Storage**: Task metadata is stored in `tasks.json` which can be synced via git

3. **Cross-Machine Workflow**:
   - Work on a task on machine A
   - Push your branch: `git push`
   - Run `mcc sync` to push task metadata
   - On machine B: `mcc sync` then `mcc resume <task-name>`

## Configuration

MCC stores configuration in `config.json`:

```json
{
  "mainRepo": "/path/to/your/repo",
  "terminal": "auto",
  "defaultBranchPrefix": "mcc/",
  "autoGenerateClaudeMd": true
}
```

Terminal options:
- `auto`: Automatically detect terminal
- `ghostty`: Use Ghostty (macOS)
- `iterm`: Use iTerm2 (macOS)
- `terminal`: Use Terminal.app (macOS)
- `gnome-terminal`: Use GNOME Terminal (Linux)
- `konsole`: Use Konsole (Linux)
- `xterm`: Use xterm (Linux)

## Two-Repository Setup (Recommended)

For privacy and separation of concerns, you can use two repositories:

1. **MCC Source Code** (public): Fork or clone this repository for the tool itself
2. **Task Metadata** (private): Create a separate private repository for your `tasks.json`

### Setting up task syncing with a private repo:

```bash
# Option 1: Two separate remotes in the same repository
cd ~/code/mcc

# Add a private remote for task metadata
git remote add private git@github.com:yourusername/mcc-tasks-private.git

# Sync tasks to the private remote
mcc sync --remote private

# Option 2: Separate git repository for tasks (more complex but cleaner)
cd ~/code/mcc
mkdir .tasks-repo
cd .tasks-repo
git init

# Create symlink to tasks.json
ln -s ../tasks.json tasks.json

# Add private remote
git remote add origin git@github.com:yourusername/mcc-tasks-private.git

# Commit and push
git add tasks.json
git commit -m "Initial tasks"
git push -u origin main
```

This way:
- Your MCC tool code can be public and shared
- Your task metadata remains private
- Your actual project code (in worktrees) is never committed to either repo

## Tips

- Keep task names short and descriptive
- Use the description field to add context
- Regularly sync to share tasks between machines
- The main repository's `.git` is shared across all worktrees

## License

MIT