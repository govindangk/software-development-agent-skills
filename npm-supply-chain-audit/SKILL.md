# npm Supply Chain Audit — Copilot Instructions

When the user asks about npm security, supply chain attacks, dependency auditing,
compromised packages, or specifically mentions Shai-Hulud or axios compromise,
follow these instructions. This applies for pnpm or yarn projects as well, just adjust lockfile references accordingly.
Run the audit when the user explicitly requests it, or when they ask about npm security in a way that implies they want to check their project.

## Step 0 — Gather Additional Intel Before Scanning

Before running the audit, **always ask the user** the following two questions (ask both at once, do not split into separate turns):

> 1. Do you have any additional packages you'd like me to check for that aren't in the known-bad list? If so, provide them as **`package@version`** — the exact version is required. If you're unsure of the version, run `npm list <package>` or check your lockfile. Include the severity and reason if known.
> 2. Do you have a link to a security advisory, blog post, or npm audit report about a recent compromise? If so, paste the URL and I'll extract the affected packages from it.

If the user provides **neither**, proceed directly to the audit with the existing `packages.json` database.

### Handling user-provided packages (inline)

If the user supplies extra package entries directly in chat, treat them as
**session-scoped additions**: add them to the in-memory check for this audit run only.

**Version is mandatory.** If the user names a package without a version (e.g. `lodash`
instead of `lodash@4.17.20`), stop and ask:

> Which version of `<package>` should I flag? Run `npm list <package>` or check your
> lockfile if you're unsure. I need the exact version before I can add it to the scan.

Do not proceed with that entry until a version is provided. An `any-version` ban
(i.e. entry in `bannedPackages`) is only used when the user **explicitly** says
"flag all versions" or "ban the package entirely".

Once a version is confirmed, map the entry to the `knownBadPackages` schema:

```
severity: "HIGH"   (default unless the user specifies CRITICAL or MEDIUM)
family:   "user-reported"
safe:     null     (unless the user provides a safe version)
detail:   "User-reported as suspicious."
fix:      "Investigate and remove or pin as appropriate."
```

After the audit, ask the user: _"Would you like me to persist these to `packages.json` so future scans include them?"_ If yes, append them to the correct section of `scripts/packages.json`.

### Handling a URL (blog post / advisory / report)

If the user provides a URL:

1. Fetch the page content.
2. Extract every `package@version` pair (and any "any version" bans) mentioned as compromised or malicious.
3. Infer `severity` from language used: "critical"/"RCE"/"RAT"/"worm" → `CRITICAL`; "high"/"credential theft"/"data exfil" → `HIGH`; everything else → `MEDIUM`.
4. Use the article title or domain slug as the `family` value (e.g. `"socket-advisory-2026-04"`).
5. Extract the recommended safe/pinned version if stated; otherwise set `safe` to `null`.
6. Show the user a preview table of what was extracted before touching any files:

   | Package | Bad Version | Safe Version | Severity | Source |
   |---|---|---|---|---|
   | `pkg` | `1.2.3` | `1.2.2` | CRITICAL | `<url>` |

7. Ask: _"Should I add these to `packages.json`?"_
8. If confirmed, append to `knownBadPackages` (or `bannedPackages` for any-version bans) in `scripts/packages.json`.

## Audit Procedure

1. Read the project's lockfile (`package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`).
2. Check every dependency against the known-bad list below **plus any session-scoped additions from Step 0**.
3. If `node_modules` is accessible, check for banned files.
4. Report findings **inline in chat** using the markdown format below.

## Adding New Compromised Packages

All threat data lives in `scripts/packages.json` — no code changes to `scan.js` are needed.

### `knownBadPackages` — specific bad versions

Key format: `"<package>@<version>"`. Fields:

| Field | Required | Description |
|---|---|---|
| `severity` | yes | `"CRITICAL"`, `"HIGH"`, or `"MEDIUM"` |
| `family` | yes | Attack family slug, e.g. `"axios-rat"`, `"shai-hulud"` |
| `safe` | yes | Pinned safe version string, or `null` if package must be removed |
| `detail` | yes | One-line human-readable description of the threat |
| `fix` | yes | Remediation instruction shown in the report |

```json
"some-pkg@1.2.3": {
  "severity": "CRITICAL",
  "family": "my-attack-family",
  "safe": "1.2.2",
  "detail": "Maintainer account hijacked. Drops keylogger.",
  "fix": "Pin to `1.2.2`. Rotate all credentials."
}
```

### `bannedPackages` — any version is banned

Key format: `"<package>"` (no version). Same fields as above except no `safe`.

```json
"evil-package": {
  "severity": "CRITICAL",
  "family": "my-attack-family",
  "detail": "Typosquat. Backdoor on install.",
  "fix": "Remove entirely."
}
```

### `bannedFiles` — filenames that must not appear in node_modules

```json
"malicious.js": {
  "family": "my-attack-family",
  "detail": "Known payload dropper"
}
```

### `suspiciousScriptPatterns` — heuristic regex checks on install scripts

`pattern` is a standard JavaScript RegExp source string (no `/` delimiters).

```json
{ "pattern": "malicious\\.js", "description": "Possible my-attack-family payload" }
```

---

### Axios RAT (Mar 31, 2026) — CRITICAL

Maintainer account hijacked. Malicious versions inject `plain-crypto-js` which
drops a cross-platform RAT.

| Package | Bad Version(s) | Safe Version |
|---|---|---|
| `axios` | `1.14.1` | `1.14.0` |
| `axios` | `0.30.4` | `0.30.3` |
| `plain-crypto-js` | any | REMOVE — should not exist |
| `@shadanai/openclaw` | `2026.3.28-2`, `2026.3.28-3`, `2026.3.31-1`, `2026.3.31-2` | REMOVE |
| `@qqbrowser/openclaw-qbot` | `0.0.130` | REMOVE |

**Indicators**: `plain-crypto-js` in lockfile or node_modules; outbound to `sfrclak[.]com`.
**Artifacts**: `/Library/Caches/com.apple.act.mond` (macOS), `%PROGRAMDATA%\wt.exe` (Win), `/tmp/ld.py` (Linux).

### Shai-Hulud v1/v2 (Sep + Nov 2025) — CRITICAL

Self-replicating worm. Compromised 800+ packages via preinstall hooks.

| Package | Bad Version(s) | Safe Version |
|---|---|---|
| `@ctrl/tinycolor` | `4.1.1`, `4.1.2` | `4.0.0` |
| `ngx-bootstrap` | `14.1.2` | `14.1.1` |
| `angulartics2` | `14.1.2` | `14.1.1` |
| `koa2-swagger-ui` | `5.11.1`, `5.11.2` | `5.10.0` |
| `json-rules-engine-simplified` | `0.2.1`, `0.2.4` | `0.1.0` |
| `@ctrl/deluge` | `7.2.2` | `7.2.1` |
| `@ctrl/golang-template` | `1.4.3` | `1.4.2` |
| `@ctrl/ngx-codemirror` | `7.0.2` | `7.0.1` |
| `@ctrl/qbittorrent` | `9.7.2` | `9.7.1` |
| `@ctrl/react-adsense` | `2.0.2` | `2.0.1` |
| `@ctrl/ngx-csv` | `6.0.2` | `6.0.1` |
| `@ctrl/ngx-emoji-mart` | `9.2.2` | `9.2.1` |
| `@ctrl/ngx-rightclick` | `4.0.2` | `4.0.1` |
| `@ctrl/shared-torrent` | `6.3.2` | `6.3.1` |
| `@ctrl/torrent-file` | `4.1.2` | `4.1.1` |
| `@ctrl/transmission` | `7.3.1` | `7.3.0` |
| `@ctrl/ts-base32` | `4.0.2` | `4.0.1` |
| `@ctrl/magnet-link` | `4.0.4` | `4.0.3` |

Full list: https://socket.dev/blog/shai-hulud-strikes-again-v2

**Indicators**: `setup_bun.js` or `bun_environment.js` in any package directory.

## Banned Files

These files should **never** appear anywhere under `node_modules/`:

- `setup_bun.js` — Shai-Hulud v2 payload installer
- `bun_environment.js` — Shai-Hulud v2 obfuscated payload
- `plain-crypto-js/setup.js` — Axios RAT dropper

## Reporting Format

Always report findings inline using this markdown structure:

```
## 🔍 npm Supply Chain Audit

**Project**: `<project name from package.json>`
**Status**: 🚨 COMPROMISED | ⚠️ WARNINGS | ✅ CLEAN

### Findings

| Severity | Package | Version | Attack | Safe Version | Action |
|---|---|---|---|---|---|
| 🚨 CRITICAL | `<pkg>` | `<ver>` | <family> | `<safe>` | <action> |

### Next Steps

1. <remediation steps based on attack family>
```

If the project is clean, report:

```
## 🔍 npm Supply Chain Audit

**Project**: `<name>`
**Status**: ✅ CLEAN

No known compromised packages detected. Checked against Shai-Hulud (Sep/Nov 2025)
and Axios RAT (Mar 2026) indicators.
```

## Remediation by Attack Family

### Axios RAT

1. Pin axios to `1.14.0` (or `0.30.3` for 0.x). Add overrides:
   ```json
   { "overrides": { "axios": "1.14.0" }, "resolutions": { "axios": "1.14.0" } }
   ```
2. Remove `plain-crypto-js` from `node_modules` and lockfile.
3. Rotate all credentials accessible on affected machines.
4. Check for RAT artifacts by platform (see indicators above).
5. If artifacts found: **do not clean — rebuild from known-good image.**

### Shai-Hulud

1. Pin affected packages to safe versions listed above.
2. Purge npm cache: `npm cache clean --force`
3. Rotate npm tokens, GitHub PATs, AWS/GCP/Azure keys.
4. Search your GitHub org for repos with "Shai-Hulud" in description.
5. Audit npm publishes under your org for unauthorized versions.
6. Rebuild CI/CD agents from clean images.

## Quick Detection Commands

Suggest these to the user if they want CLI verification:

```bash
# Axios RAT
grep -E "1\.14\.1|0\.30\.4" package-lock.json
grep "plain-crypto-js" package-lock.json
ls node_modules/plain-crypto-js 2>/dev/null && echo "⚠️ AFFECTED"

# Shai-Hulud
find node_modules -name "setup_bun.js" -o -name "bun_environment.js" 2>/dev/null

# Both — full audit via scanner (if available)
node .github/scripts/scan.js .
```