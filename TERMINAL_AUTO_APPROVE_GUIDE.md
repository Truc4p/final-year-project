# VS Code Terminal Auto Approve Configuration

This guide explains how to configure automatic approval for terminal commands in VS Code using the `chat.tools.terminal.autoApprove` setting.

## How to Configure

1. Open VS Code Settings (Cmd+, on macOS)
2. Search for "chat.tools.terminal.autoApprove"
3. Click "Edit in settings.json"
4. Add the configuration below

## Configuration Examples

### Basic Configuration
```json
{
  "chat.tools.terminal.autoApprove": {
    "npm install": true,
    "npm start": true,
    "npm run build": true,
    "git status": true,
    "git pull": true,
    "docker ps": true,
    "ls": true,
    "pwd": true,
    "rm": false,
    "sudo": false
  }
}
```

### Advanced Configuration with Regular Expressions
```json
{
  "chat.tools.terminal.autoApprove": {
    "npm install": true,
    "npm start": true,
    "npm run": true,
    "npm test": true,
    "npm run build": true,
    "npm run dev": true,
    "yarn": true,
    "pnpm": true,
    
    "git status": true,
    "git log": true,
    "git diff": true,
    "git show": true,
    "git branch": true,
    "git checkout": true,
    "git pull": true,
    "git push": true,
    "git add": true,
    "git commit": true,
    
    "docker ps": true,
    "docker images": true,
    "docker logs": true,
    "docker compose up": true,
    "docker compose down": true,
    "docker compose restart": true,
    "docker build": true,
    
    "ls": true,
    "pwd": true,
    "cat": true,
    "head": true,
    "tail": true,
    "find": true,
    "grep": true,
    "mkdir": true,
    "touch": true,
    "cp": true,
    "mv": true,
    
    "code": true,
    "node": true,
    "python": true,
    "python3": true,
    "pip": true,
    "pip3": true,
    "curl": true,
    "wget": true,
    
    "ps": true,
    "top": true,
    "htop": true,
    "kill": false,
    
    "rm": false,
    "rmdir": false,
    "sudo": false,
    "chmod": false,
    "chown": false,
    "dd": false,
    "format": false,
    "fdisk": false,
    
    "/^git (status|log|diff|show|branch)$/": true,
    "/^npm (install|start|test|run)\\b/": true,
    "/^docker (ps|images|logs)$/": true,
    "/^ls\\b/": true,
    "/^cd\\b/": true
  }
}
```

## Project-Specific Configuration

For your current project structure, here's a recommended configuration:

```json
{
  "chat.tools.terminal.autoApprove": {
    "npm install": true,
    "npm start": true,
    "npm run dev": true,
    "npm run build": true,
    "npm test": true,
    
    "docker compose up": true,
    "docker compose down": true,
    "docker compose restart": true,
    "docker ps": true,
    "docker logs": true,
    
    "git status": true,
    "git add": true,
    "git commit": true,
    "git pull": true,
    "git push": true,
    
    "cd backend": true,
    "cd frontend": true,
    "cd mobile-app-admin": true,
    "cd mobile-app-customer": true,
    
    "ls": true,
    "pwd": true,
    "cat": true,
    "grep": true,
    "find": true,
    
    "node": true,
    "python": true,
    "python3": true,
    
    "rm": false,
    "sudo": false,
    "chmod": false,
    
    "/^npm run\\b/": true,
    "/^git (status|log|diff|show|branch)$/": true,
    "/^docker compose (up|down|restart)$/": true,
    "/^cd (backend|frontend|mobile-app-admin|mobile-app-customer)$/": true
  }
}
```

## Security Considerations

### Safe Commands (auto-approve)
- Read-only operations: `ls`, `cat`, `head`, `tail`, `grep`, `find`
- Git read operations: `git status`, `git log`, `git diff`, `git show`
- Package manager operations: `npm install`, `npm start`, `npm run`
- Docker inspect operations: `docker ps`, `docker images`, `docker logs`

### Dangerous Commands (require approval)
- File deletion: `rm`, `rmdir`
- Permission changes: `chmod`, `chown`, `sudo`
- System operations: `dd`, `format`, `fdisk`
- Process termination: `kill`, `killall`

## Regular Expression Examples

- `/^git (status|log|diff|show)$/`: Allows specific git commands
- `/^npm run\\b/`: Allows any npm run command
- `/^docker (ps|images|logs)$/`: Allows specific docker commands
- `/^ls\\b/`: Allows ls with any arguments
- `/.*/`: Allows ALL commands (not recommended)

## Command Line vs Sub-command Matching

By default, commands are matched against sub-commands. For example, `foo && bar` needs both `foo` and `bar` to be approved.

To match the entire command line instead:
```json
{
  "chat.tools.terminal.autoApprove": {
    "npm install && npm start": { "approve": true, "matchCommandLine": true }
  }
}
```

## Steps to Apply Configuration

1. Copy the desired configuration from above
2. Open VS Code Settings (Cmd+, on macOS or Ctrl+, on Windows/Linux)
3. Search for "chat.tools.terminal.autoApprove"
4. Click "Edit in settings.json" link
5. Paste the configuration into your settings.json file
6. Save the file

The configuration will take effect immediately for new terminal commands.