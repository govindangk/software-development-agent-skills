#!/usr/bin/env bash
# install.sh — print per-harness install commands and optionally generate
# a GitHub Copilot instructions file from all skills in this repo.
#
# Usage:
#   ./install.sh                        # print install commands for all harnesses
#   ./install.sh --copilot              # generate .github/copilot-instructions.md in cwd
#   ./install.sh --copilot /path/to/project  # generate in a specific project

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_URL="https://github.com/govindg/skills"  # update once repo is published

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

bold()  { printf '\033[1m%s\033[0m' "$*"; }
dim()   { printf '\033[2m%s\033[0m' "$*"; }
green() { printf '\033[32m%s\033[0m' "$*"; }
nl()    { echo; }

section() {
  nl
  echo "$(bold "──── $1 ────")"
  nl
}

# ─────────────────────────────────────────────────────────────────────────────
# Copilot instructions generator
# ─────────────────────────────────────────────────────────────────────────────

generate_copilot_instructions() {
  local target_dir="${1:-.}"
  local output_file="$target_dir/.github/copilot-instructions.md"

  mkdir -p "$target_dir/.github"

  python3 - "$SCRIPT_DIR" "$output_file" <<'PYEOF'
import re, os, sys

skills_dir = sys.argv[1]
output_file = sys.argv[2]

# Dirs to skip (non-skill directories)
SKIP = {'.git', '.claude-plugin', '.codex-plugin', '.opencode', '.github', '.pi', 'node_modules'}

def parse_frontmatter(content):
    m = re.match(r'^---\n(.*?)\n---\n', content, re.DOTALL)
    if not m:
        return {}

    fm = m.group(1)
    result = {}

    name_m = re.search(r'^name:\s*(.+)$', fm, re.MULTILINE)
    if name_m:
        result['name'] = name_m.group(1).strip().strip('"\'')

    # Handle description: with optional > or | block scalar
    desc_m = re.search(
        r'^description:\s*(?:>-?|[|][+-]?)?\n((?:[ \t]+.+\n?)+)',
        fm, re.MULTILINE
    )
    if desc_m:
        lines = [l.strip() for l in desc_m.group(1).split('\n') if l.strip()]
        result['description'] = ' '.join(lines)
    else:
        desc_m2 = re.search(r'^description:\s*(.+)$', fm, re.MULTILINE)
        if desc_m2:
            result['description'] = desc_m2.group(1).strip().strip('"\'')

    return result

skills = []
for entry in sorted(os.listdir(skills_dir)):
    if entry in SKIP or entry.startswith('.'):
        continue
    skill_path = os.path.join(skills_dir, entry, 'SKILL.md')
    if not os.path.isfile(skill_path):
        continue
    with open(skill_path, encoding='utf-8') as f:
        content = f.read()
    fm = parse_frontmatter(content)
    if fm.get('name') and fm.get('description'):
        skills.append(fm)

lines = [
    '# Agent Skills',
    '',
    'The following skills are available. When a request matches a skill\'s description or',
    'trigger phrases, invoke that skill by name.',
    '',
]

for s in skills:
    lines.append(f"## {s['name']}")
    lines.append('')
    lines.append(s['description'])
    lines.append('')

with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f"Generated {output_file} with {len(skills)} skills.")
PYEOF

  echo "$(green "✓") Generated $output_file"
}

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

# Handle --copilot flag
if [[ "${1:-}" == "--copilot" ]]; then
  target="${2:-.}"
  echo "Generating GitHub Copilot instructions in: $target"
  generate_copilot_instructions "$target"
  exit 0
fi

# Default: print install commands for all harnesses
echo
echo "$(bold "Skills — installation commands")"
echo "$(dim "Update REPO_URL in this script once the repo is published to GitHub.")"

section "Claude Code"
cat <<EOF
/plugin install skills@$(basename "$SCRIPT_DIR")

  Or, if published to a marketplace:
  /plugin marketplace add $REPO_URL
  /plugin install skills
EOF

section "OpenCode"
cat <<EOF
Add to opencode.json (global: ~/.config/opencode/opencode.json, or project-level):

  {
    "plugin": ["skills@git+$REPO_URL.git"]
  }

Then restart OpenCode. Skills are auto-discovered via the plugin.
EOF

section "pi.dev"
cat <<EOF
pi install git:$REPO_URL
EOF

section "Codex"
cat <<EOF
In Codex App: Plugins sidebar → Coding section → find "Skills" → click +

  Or via CLI:
  /plugins
  Search: skills → Install Plugin
EOF

section "GitHub Copilot"
cat <<EOF
Copilot does not have a native skills system. Run this to generate a
.github/copilot-instructions.md file in your project:

  bash $SCRIPT_DIR/install.sh --copilot /path/to/your/project

  Or for the current directory:
  bash $SCRIPT_DIR/install.sh --copilot
EOF

nl
