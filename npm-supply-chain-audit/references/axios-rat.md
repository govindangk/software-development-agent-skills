# Axios RAT Compromise — Reference

## Timeline

- **Mar 31, 2026, 00:21 UTC**: `axios@1.14.1` published via compromised account.
- **Mar 31, 2026, ~00:30 UTC**: `axios@0.30.4` also published.
- **Mar 31, 2026, 01:38 UTC**: `DigitalBrainJS` detects, opens PR #10591, contacts npm.
- **Mar 31, 2026, 03:29 UTC**: npm removes malicious versions. ~3hr window.
- **Mar 31, 2026, ~04:00 UTC**: `jasonsaayman` confirms compromise. 2FA was enabled; suspected recovery code theft.
- **Mar 31, 2026**: Google TAG attributes activity to DPRK-linked actors.

## Mechanics

1. Attacker compromises npm account `jasonsaayman` (primary axios maintainer).
2. Publishes malicious versions directly, bypassing GitHub Actions OIDC trusted publishing.
3. Malicious versions add dep: `plain-crypto-js@4.2.1` (typosquat of `crypto-js@4.2.0`).
4. `postinstall` hook runs `setup.js` → contacts `sfrclak[.]com:8000` → drops platform RAT.
5. Dropper self-deletes + replaces its `package.json` with clean stub.

### Platform Payloads

| Platform | Artifact | Persistence |
|---|---|---|
| macOS | `/Library/Caches/com.apple.act.mond` | None (no reboot survival) |
| Windows | `%PROGRAMDATA%\wt.exe` + `system.bat` | Registry Run key |
| Linux | `/tmp/ld.py` | None (crashes in containers) |

### RAT Capabilities

- Arbitrary command/binary execution
- File + directory enumeration with metadata
- In-memory DLL injection (Windows)
- PowerShell execution (Windows)
- Self-termination

## Affected Packages

| Package | Version | Notes |
|---|---|---|
| `axios` | `1.14.1` | Primary target |
| `axios` | `0.30.4` | Primary target |
| `plain-crypto-js` | `4.2.1` | Malicious transitive dep |
| `@shadanai/openclaw` | 2026.3.28-2/3, 2026.3.31-1/2 | Vendors plain-crypto-js directly |
| `@qqbrowser/openclaw-qbot` | `0.0.130` | Ships tampered axios@1.14.1 |

### Safe Versions

- `axios` → `1.14.0` (1.x line) or `0.30.3` (0.x line)

## Detection

### CLI Checks

```bash
# Lockfile
grep -E "1\.14\.1|0\.30\.4" package-lock.json
grep "plain-crypto-js" package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null

# node_modules
ls node_modules/plain-crypto-js 2>/dev/null && echo "AFFECTED"
npm list axios 2>/dev/null | grep -E "1\.14\.1|0\.30\.4"
```

### Host Artifact Check

```bash
# macOS
ls /Library/Caches/com.apple.act.mond 2>/dev/null && echo "RAT FOUND"

# Linux
ls /tmp/ld.py 2>/dev/null && echo "RAT FOUND"

# Windows (PowerShell)
# Test-Path "$env:PROGRAMDATA\wt.exe"
# Test-Path "$env:PROGRAMDATA\system.bat"
```

### Network IOCs

| IOC | Type |
|---|---|
| `sfrclak[.]com` | C2 domain |
| `sfrclak[.]com:8000` | Dropper download |
| `142.11.206.73` | C2 IP |

### CI/CD Log Audit

Search build logs from Mar 31 2026, 00:00–04:00 UTC for:
`plain-crypto-js`, `axios@1.14.1`, `axios@0.30.4`, `sfrclak.com`

## Remediation

### Confirmed Compromise (artifacts found)

1. **Do not clean — rebuild from known-good image.**
2. Rotate ALL creds: npm, GitHub, AWS, GCP, Azure, SSH, CI secrets, `.env`.
3. Audit for lateral movement (outbound to `sfrclak.com` / `142.11.206.73`).
4. Block C2 egress at firewall.

### Suspected Exposure (installed during window)

1. Pin axios: `"overrides": { "axios": "1.14.0" }` in `package.json`.
2. Remove `plain-crypto-js` from `node_modules`.
3. Run `npm ci --ignore-scripts`.
4. Rotate all accessible credentials as a precaution.

### Key Insight

No axios source files were modified. The attack lives entirely in a transitive
dependency triggered by npm's postinstall lifecycle. Diff-based code review
would not catch this.

## References

- Snyk: https://snyk.io/blog/axios-npm-package-compromised-supply-chain-attack-delivers-cross-platform/
- Datadog: https://securitylabs.datadoghq.com/articles/axios-npm-supply-chain-compromise/
- Aikido: https://www.aikido.dev/blog/axios-npm-compromised-maintainer-hijacked-rat
- Socket: https://socket.dev/blog/axios-npm-package-compromised
- StepSecurity: https://www.stepsecurity.io/blog/axios-compromised-on-npm-malicious-versions-drop-remote-access-trojan
- GitHub Issue: https://github.com/axios/axios/issues/10604