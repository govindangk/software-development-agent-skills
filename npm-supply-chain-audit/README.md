# npm-supply-chain-audit

Audits npm, pnpm, and yarn projects against a known-bad package database. Detects compromised versions, banned packages, and malicious files in `node_modules`.

## Trigger

Use any of: "npm security", "supply chain audit", "check for compromised packages", mentions of Shai-Hulud or axios compromise

## Threat database

### Axios RAT (Mar 31, 2026) — CRITICAL

Maintainer account hijacked. Malicious versions inject `plain-crypto-js` which drops a cross-platform RAT.

| Package | Bad Version(s) | Safe Version |
|---|---|---|
| `axios` | `1.14.1` | `1.14.0` |
| `axios` | `0.30.4` | `0.30.3` |
| `plain-crypto-js` | any | REMOVE |
| `@shadanai/openclaw` | `2026.3.28-2`, `2026.3.28-3`, `2026.3.31-1`, `2026.3.31-2` | REMOVE |
| `@qqbrowser/openclaw-qbot` | `0.0.130` | REMOVE |

### Shai-Hulud v1/v2 (Sep + Nov 2025) — CRITICAL

Self-replicating worm that compromised 800+ packages via preinstall hooks.

Key affected packages include `@ctrl/tinycolor`, `ngx-bootstrap`, `koa2-swagger-ui`, and many others. See `SKILL.md` for the full list.

## Audit procedure

1. Ask the user for any additional packages to check and any advisory URLs (both in one message).
2. Read the project lockfile (`package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`).
3. Check every dependency against the known-bad list plus any session-scoped additions.
4. If `node_modules` is accessible, check for banned files (`setup_bun.js`, `bun_environment.js`, `plain-crypto-js/setup.js`).
5. Report findings inline using the standard markdown format.

## Extending the database

All threat data lives in `scripts/packages.json` — no code changes to `scan.js` needed.

- `knownBadPackages` — specific bad versions keyed as `"package@version"`
- `bannedPackages` — any version of a package is banned, keyed as `"package"`
- `bannedFiles` — filenames that must not appear anywhere under `node_modules/`
- `suspiciousScriptPatterns` — heuristic regex checks on install scripts

## Report format

```
## 🔍 npm Supply Chain Audit

**Project**: `<name>`
**Status**: 🚨 COMPROMISED | ⚠️ WARNINGS | ✅ CLEAN

### Findings

| Severity | Package | Version | Attack | Safe Version | Action |
|---|---|---|---|---|---|
```
