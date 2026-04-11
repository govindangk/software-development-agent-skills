#!/usr/bin/env node
/**
 * npm Supply Chain Audit Scanner
 *
 * Scans a Node.js project for known compromised packages and outputs a
 * markdown report to stdout for inline rendering in chat (Claude, Copilot, etc).
 *
 * Zero dependencies — uses only Node builtins. Runs on Node 14+.
 *
 * Usage:
 *   node scan.js <project-path>           # markdown to stdout
 *   node scan.js <project-path> --json    # structured JSON to stdout
 *   node scan.js <project-path> --strict  # exit 1 on any finding
 *
 * Exit codes:
 *   0 = CLEAN (or WARNINGS without --strict)
 *   1 = WARNINGS (--strict) or COMPROMISED
 *   2 = COMPROMISED
 *   3 = ERROR
 */

'use strict';

const { readFileSync, existsSync, readdirSync } = require('fs');
const { resolve, join, relative } = require('path');

// =============================================================================
// THREAT INTELLIGENCE — loaded from packages.json
// To add a new compromised package or attack family, edit packages.json.
// No code changes required.
// =============================================================================

function loadThreatIntel() {
  const intelPath = join(__dirname, 'packages.json');
  if (!existsSync(intelPath)) {
    console.error(
      '<!-- warn: packages.json not found; running with empty threat database -->',
    );
    return {
      knownBadPackages: {},
      bannedPackages: {},
      bannedFiles: {},
      suspiciousScriptPatterns: [],
    };
  }
  try {
    const data = JSON.parse(readFileSync(intelPath, 'utf-8'));
    // Convert stored regex strings back to RegExp objects
    const suspiciousScriptPatterns = (data.suspiciousScriptPatterns || []).map(
      (entry) => [new RegExp(entry.pattern), entry.description],
    );
    return {
      knownBadPackages: data.knownBadPackages || {},
      bannedPackages: data.bannedPackages || {},
      bannedFiles: data.bannedFiles || {},
      suspiciousScriptPatterns,
    };
  } catch (e) {
    console.error(`<!-- warn: failed to parse packages.json: ${e} -->`);
    return {
      knownBadPackages: {},
      bannedPackages: {},
      bannedFiles: {},
      suspiciousScriptPatterns: [],
    };
  }
}

const {
  knownBadPackages: KNOWN_BAD_PACKAGES,
  bannedPackages: BANNED_PACKAGES,
  bannedFiles: BANNED_FILES,
  suspiciousScriptPatterns: SUSPICIOUS_SCRIPT_PATTERNS,
} = loadThreatIntel();

// =============================================================================
// LOCKFILE PARSERS
// =============================================================================

function parsePackageLock(filepath) {
  const pkgs = new Map();
  try {
    const data = JSON.parse(readFileSync(filepath, 'utf-8'));
    if (data.packages) {
      for (const [key, info] of Object.entries(data.packages)) {
        if (!key) continue;
        const name = info.name || key.split('node_modules/').pop();
        const ver = info.version || '';
        if (name && ver) pkgs.set(`${name}@${ver}`, ver);
      }
    } else if (data.dependencies) {
      const walk = (deps) => {
        for (const [name, info] of Object.entries(deps)) {
          const ver = info.version || '';
          if (ver) pkgs.set(`${name}@${ver}`, ver);
          if (info.dependencies) walk(info.dependencies);
        }
      };
      walk(data.dependencies);
    }
  } catch (e) {
    console.error(`<!-- warn: failed to parse ${filepath}: ${e} -->`);
  }
  return pkgs;
}

function parseYarnLock(filepath) {
  const pkgs = new Map();
  try {
    const lines = readFileSync(filepath, 'utf-8').split('\n');
    let current = null;
    for (const line of lines) {
      const header = line.match(/^"?([^@\s]+)@/);
      if (header && !line.startsWith(' ')) current = header[1];
      const ver = line.match(/^\s+version:?\s+"?([^"]+)"?/);
      if (ver && current) {
        pkgs.set(`${current}@${ver[1]}`, ver[1]);
        current = null;
      }
    }
  } catch (e) {
    console.error(`<!-- warn: failed to parse ${filepath}: ${e} -->`);
  }
  return pkgs;
}

function parsePnpmLock(filepath) {
  const pkgs = new Map();
  try {
    const lines = readFileSync(filepath, 'utf-8').split('\n');
    for (const line of lines) {
      const m = line.match(/^\s*\/?'?([^:]+)@(\d[^:' ]*)'?:/);
      if (m) {
        const name = m[1].replace(/^\//, '');
        pkgs.set(`${name}@${m[2]}`, m[2]);
      }
    }
  } catch (e) {
    console.error(`<!-- warn: failed to parse ${filepath}: ${e} -->`);
  }
  return pkgs;
}

function findLockfile(root) {
  const parsers = [
    ['package-lock.json', parsePackageLock],
    ['yarn.lock', parseYarnLock],
    ['pnpm-lock.yaml', parsePnpmLock],
  ];
  for (const [name, parser] of parsers) {
    const p = join(root, name);
    if (existsSync(p)) return { packages: parser(p), name };
  }
  return { packages: new Map(), name: '' };
}

// =============================================================================
// CHECKS
// =============================================================================

function checkKnownBad(pkgs) {
  const findings = [];
  for (const [pv, ver] of pkgs) {
    const entry = KNOWN_BAD_PACKAGES[pv];
    if (entry) {
      const name = pv.slice(0, pv.lastIndexOf('@'));
      findings.push({
        severity: entry.severity,
        family: entry.family,
        package: name,
        version: ver,
        safe: entry.safe,
        detail: entry.detail,
        fix: entry.fix,
      });
    }
  }
  return findings;
}

function checkBanned(pkgs) {
  const findings = [];
  for (const [pv, ver] of pkgs) {
    const name = pv.slice(0, pv.lastIndexOf('@'));
    const entry = BANNED_PACKAGES[name];
    if (entry) {
      findings.push({
        severity: entry.severity,
        family: entry.family,
        package: name,
        version: ver,
        safe: null,
        detail: entry.detail,
        fix: entry.fix,
      });
    }
  }
  return findings;
}

function walkDir(dir, cb) {
  if (!existsSync(dir)) return;
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(full, cb);
      } else if (entry.isFile()) {
        cb(full, entry.name);
      }
    }
  } catch {
    // permission errors, symlink loops
  }
}

function checkFiles(root) {
  const findings = [];
  const nm = join(root, 'node_modules');
  walkDir(nm, (filepath, name) => {
    const entry = BANNED_FILES[name];
    if (entry) {
      const rel = relative(root, filepath);
      findings.push({
        severity: 'CRITICAL',
        family: entry.family,
        package: rel,
        version: null,
        safe: null,
        detail: `${entry.detail} at \`${rel}\``,
        fix: 'Delete. Rebuild from clean state.',
      });
    }
  });
  return findings;
}

function checkScripts(root) {
  const findings = [];
  const nm = join(root, 'node_modules');
  if (!existsSync(nm)) return findings;

  const scanPkgDir = (dir) => {
    const pjPath = join(dir, 'package.json');
    if (!existsSync(pjPath)) return;
    try {
      const data = JSON.parse(readFileSync(pjPath, 'utf-8'));
      const scripts = data.scripts || {};
      for (const hook of ['preinstall', 'postinstall', 'install']) {
        const val = scripts[hook] || '';
        if (!val) continue;
        for (const [pattern, desc] of SUSPICIOUS_SCRIPT_PATTERNS) {
          if (pattern.test(val)) {
            findings.push({
              severity: 'HIGH',
              family: 'heuristic',
              package: data.name || dir.split('/').pop() || 'unknown',
              version: data.version || null,
              safe: null,
              detail: `${desc} in \`${hook}\`: \`${val.slice(0, 80)}\``,
              fix: 'Investigate immediately.',
            });
          }
        }
      }
    } catch {
      // malformed package.json
    }
  };

  for (const entry of readdirSync(nm, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = join(nm, entry.name);
    if (entry.name.startsWith('@')) {
      for (const sub of readdirSync(full, { withFileTypes: true })) {
        if (sub.isDirectory()) scanPkgDir(join(full, sub.name));
      }
    } else {
      scanPkgDir(full);
    }
  }
  return findings;
}

// =============================================================================
// OUTPUT FORMATTERS
// =============================================================================

function getProjectName(root) {
  try {
    return (
      JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8')).name ||
      root.split('/').pop()
    );
  } catch {
    return root.split('/').pop() || 'unknown';
  }
}

function sevIcon(s) {
  return { CRITICAL: '🚨', HIGH: '⚠️', MEDIUM: 'ℹ️' }[s] || '❓';
}

function dedup(findings) {
  const seen = new Set();
  return findings.filter((f) => {
    const key = `${f.package}|${f.version}|${f.family}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatMarkdown(root, lockfile, pkgCount, findings) {
  const name = getProjectName(root);
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const hasCrit = findings.some((f) => f.severity === 'CRITICAL');
  const status = hasCrit
    ? '🚨 COMPROMISED'
    : findings.length
      ? '⚠️ WARNINGS'
      : '✅ CLEAN';

  const lines = [
    `## 🔍 npm Supply Chain Audit`,
    ``,
    `**Project**: \`${name}\`  `,
    `**Scanned**: ${now}  `,
    `**Lockfile**: \`${lockfile || 'none found'}\`  (${pkgCount} packages)  `,
    `**Status**: ${status}`,
    ``,
  ];

  if (!findings.length) {
    lines.push(
      'No known compromised packages detected. Checked against ' +
        'Shai-Hulud (Sep/Nov 2025) and Axios RAT (Mar 2026) indicators.',
    );
    return lines.join('\n');
  }

  lines.push('### Findings', '');
  lines.push('| Sev | Package | Version | Attack | Safe | Action |');
  lines.push('|---|---|---|---|---|---|');
  for (const f of findings) {
    const safe = f.safe ? `\`${f.safe}\`` : '—';
    lines.push(
      `| ${sevIcon(f.severity)} ${f.severity} | \`${f.package}\` | \`${f.version || '—'}\` | ${f.family} | ${safe} | ${f.fix} |`,
    );
  }
  lines.push('');

  const families = [
    ...new Set(
      findings.filter((f) => f.severity === 'CRITICAL').map((f) => f.family),
    ),
  ].sort();

  if (families.length) lines.push('### Remediation', '');

  if (families.includes('axios-rat')) {
    lines.push(
      '**Axios RAT**',
      '',
      '1. Pin axios: add `"overrides": { "axios": "1.14.0" }` to `package.json`.',
      '2. Remove `plain-crypto-js` from `node_modules` and lockfile.',
      '3. Rotate **all** credentials on affected machines (npm, GitHub, AWS, GCP, Azure, SSH, `.env`).',
      '4. Check for RAT artifacts:',
      '   - macOS: `ls /Library/Caches/com.apple.act.mond`',
      '   - Windows: `dir %PROGRAMDATA%\\wt.exe` and `%PROGRAMDATA%\\system.bat`',
      '   - Linux: `ls /tmp/ld.py`',
      '5. If artifacts found → **rebuild from clean image, do not attempt to clean.**',
      '6. Block egress to `sfrclak[.]com` / `142.11.206.73`.',
      '',
    );
  }

  if (families.includes('shai-hulud')) {
    lines.push(
      '**Shai-Hulud**',
      '',
      '1. Pin affected packages to safe versions listed above.',
      '2. Purge npm cache: `npm cache clean --force`',
      '3. Rotate npm tokens, GitHub PATs, AWS/GCP/Azure keys.',
      '4. Search GitHub for repos with "Shai-Hulud" in description under your org.',
      '5. Audit npm publishes under your org for unauthorized versions.',
      '6. Rebuild CI/CD agents from clean images.',
      '',
    );
  }

  if (families.length) {
    lines.push(
      '### Prevention',
      '',
      '- Run `npm ci --ignore-scripts` in all CI/CD pipelines.',
      '- Enable 2FA (WebAuthn) on all npm accounts.',
      '- Pin deps to exact versions. Enforce lockfiles.',
      '- Adopt a supply chain firewall (Socket, Snyk, Datadog SCFW).',
      '- Enforce minimum 48h package age before allowing new versions.',
    );
  }

  return lines.join('\n');
}

function formatJSON(root, lockfile, pkgCount, findings) {
  const hasCrit = findings.some((f) => f.severity === 'CRITICAL');
  const report = {
    scan_date: new Date().toISOString(),
    project_path: root,
    project_name: getProjectName(root),
    lockfile: lockfile || null,
    packages_scanned: pkgCount,
    status: hasCrit ? 'COMPROMISED' : findings.length ? 'WARNINGS' : 'CLEAN',
    findings: findings.map((f) => ({
      severity: f.severity,
      attack_family: f.family,
      package: f.package,
      installed_version: f.version,
      safe_version: f.safe,
      detail: f.detail,
      remediation: f.fix,
    })),
  };
  return JSON.stringify(report, null, 2);
}

// =============================================================================
// MAIN
// =============================================================================

function scan(projectPath, asJson, strict) {
  const root = resolve(projectPath);

  if (!existsSync(root) || !existsSync(join(root, 'package.json'))) {
    console.error(`Error: no package.json in ${root}`);
    return 3;
  }

  const { packages: pkgs, name: lockfile } = findLockfile(root);

  const raw = [
    ...checkKnownBad(pkgs),
    ...checkBanned(pkgs),
    ...checkFiles(root),
    ...checkScripts(root),
  ];

  const sevOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
  const findings = dedup(raw).sort(
    (a, b) => (sevOrder[a.severity] ?? 9) - (sevOrder[b.severity] ?? 9),
  );

  if (asJson) {
    console.log(formatJSON(root, lockfile, pkgs.size, findings));
  } else {
    console.log(formatMarkdown(root, lockfile, pkgs.size, findings));
  }

  const hasCrit = findings.some((f) => f.severity === 'CRITICAL');
  if (hasCrit) return 2;
  if (findings.length && strict) return 1;
  return 0;
}

// CLI
const args = process.argv.slice(2);
const projectArg = args.find((a) => !a.startsWith('--'));

if (!projectArg) {
  console.error('Usage: node scan.js <project-path> [--json] [--strict]');
  process.exit(3);
}

process.exit(
  scan(projectArg, args.includes('--json'), args.includes('--strict')),
);
