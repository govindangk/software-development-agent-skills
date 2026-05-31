#!/usr/bin/env bash
# install.sh — generate a GitHub Copilot instructions file from all skills in this repo.
#
# Usage:
#   ./install.sh                        # generate .github/copilot-instructions.md in cwd
#   ./install.sh /path/to/project       # generate in a specific project

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
target="${1:-.}"
output_file="$target/.github/copilot-instructions.md"

mkdir -p "$target/.github"

python3 - "$SCRIPT_DIR" "$output_file" <<'PYEOF'
import re, os, sys

skills_dir = sys.argv[1]
output_file = sys.argv[2]

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

echo "✓ Generated $output_file"
