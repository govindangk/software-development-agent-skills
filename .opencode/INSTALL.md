# Installing in OpenCode

## Option 1 — Plugin via git (recommended)

Add this repo as a plugin in your `opencode.json` (global at `~/.config/opencode/opencode.json` or project-level):

```json
{
  "plugin": ["@govindangk/software-development-agent-skills@git+https://github.com/govindangk/software-development-agent-skills.git"]
}
```

OpenCode installs the plugin via Bun on startup. All skills are auto-discovered and available via the `skill` tool.

## Option 2 — Local plugin

If you have this repo cloned locally, add it as a local plugin instead:

```json
{
  "plugin": ["/absolute/path/to/this/repo/.opencode/plugins/skills.js"]
}
```

## Option 3 — Manual copy

Copy individual skill directories to your project's `.opencode/skills/` folder:

```bash
cp -r brainstorming writing-plans executing-plans /your/project/.opencode/skills/
```

OpenCode also recognises `~/.config/opencode/skills/` for global (user-level) skills.
