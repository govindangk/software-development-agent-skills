# Installing in OpenCode

## Option 1 — Plugin (recommended)

Add this repo as a plugin in your `opencode.json` (global at `~/.config/opencode/opencode.json` or project-level):

```json
{
  "plugin": ["skills@git+https://github.com/govindg/skills.git"]
}
```

Restart OpenCode. All skills are auto-discovered and available via the `skill` tool.

> **Note:** Replace the URL with this repo's actual GitHub URL once it is published.

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

OpenCode also recognises `.agents/skills/` and `.claude/skills/` if you prefer those paths.
