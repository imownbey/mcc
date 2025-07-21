# MCC - Multi-Claude Code Project

## Overview

This is the MCC (Multi-Claude Code) project - a CLI tool for managing multiple Claude Code instances using git worktrees. The tool allows users to work on multiple tasks in parallel, each in its own isolated environment with its own git branch.

## Architecture

- **TypeScript/Bun**: The entire project is written in TypeScript and runs on Bun
- **Git Worktrees**: Each task is a git worktree from the user's main repository
- **Task Management**: Tasks are tracked in `tasks.json` with metadata
- **Cross-Platform**: Supports macOS and Linux with terminal auto-detection

## Project Structure

```
src/
├── index.ts           # CLI entry point
├── types.ts           # TypeScript interfaces
├── commands/          # CLI command implementations
│   ├── init.ts       # Initialize MCC with main repo
│   ├── new.ts        # Create new task
│   ├── list.ts       # List tasks
│   ├── open.ts       # Open task in terminal
│   ├── resume.ts     # Resume task (recreate worktree)
│   ├── delete.ts     # Delete task
│   ├── status.ts     # Show git status
│   └── sync.ts       # Sync task metadata
└── lib/              # Core functionality
    ├── git.ts        # Git worktree operations
    ├── terminal.ts   # Terminal spawning
    ├── tasks.ts      # Task CRUD operations
    ├── config.ts     # Config management
    └── claude.ts     # CLAUDE.md generation
```

## Key Design Decisions

1. **Git Worktrees**: Using worktrees instead of clones to save disk space and share git objects
2. **Task Metadata**: Stored in `tasks.json` for easy syncing between machines
3. **No Branch Deletion**: When deleting tasks, branches are preserved in git
4. **Auto Terminal Opening**: Tasks automatically open in new terminal tabs
5. **CLAUDE.md Generation**: Each task gets context about its purpose

## Development Commands

```bash
# Install dependencies
bun install

# Run in development
bun run dev <command>

# Build standalone binary
bun run build

# Install globally for development
bun link
```

## Testing

To test the tool:
1. Initialize with a test repository
2. Create a few tasks
3. Test resume functionality by removing and recreating worktrees
4. Test sync functionality with a remote repository

## Common Issues

- **Terminal Detection**: The tool tries to detect the terminal automatically but can be configured
- **Branch Conflicts**: Tasks check if branches exist before creating
- **Missing Worktrees**: Resume command recreates worktrees if they're missing

## Future Enhancements

- Windows native support (currently WSL only)
- Task templates
- Integration with issue tracking systems
- Task archiving instead of deletion
- Better conflict resolution for task metadata