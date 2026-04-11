# Shai-Hulud npm Worm — Reference

## Timeline

- **Sep 15, 2025**: v1 discovered by ReversingLabs. Postinstall worm harvesting creds.
- **Sep 18, 2025**: 500+ packages confirmed compromised including CrowdStrike pkgs.
- **Nov 21–23, 2025**: v2 ("Sha1-Hulud: The Second Coming"). Preinstall execution, obfuscation, destructive fallback.
- **Nov 24, 2025**: Wiz reports 25k+ malicious GitHub repos, ~1000 new repos/30min.
- **Dec 2025**: Microsoft, Datadog, JFrog, Trend Micro publish analyses. 800+ total packages.

## Mechanics

### v1 (Sep 2025)

1. Phished npm maintainer account.
2. Injected `postinstall` script into victim's published packages.
3. Harvests: `GITHUB_TOKEN`, `NPM_TOKEN`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, cloud metadata.
4. Exfiltrates to `webhook.site` endpoint.
5. Creates public GitHub repo "Shai-Hulud" with stolen creds.
6. Uses stolen npm token to backdoor up to 100 of victim's packages.

### v2 (Nov 2025)

- **Preinstall** execution (not postinstall) — runs before security checks.
- Payload disguised as Bun installer: `setup_bun.js`, `bun_environment.js`.
- Uses TruffleHog for active secret hunting.
- Queries cloud metadata (AWS IMDSv1/v2, GCP, Azure).
- Creates GitHub Actions workflows for persistent C2.
- Cross-victim exfil: uses one victim's creds to store another's secrets.
- **Destructive fallback**: overwrites + deletes entire home directory if exfil fails.

## Known Compromised Packages (Partial)

Full live list: https://socket.dev/blog/shai-hulud-strikes-again-v2

### High-Profile

| Package | Bad Versions | Safe | Weekly DLs |
|---|---|---|---|
| `@ctrl/tinycolor` | 4.1.1, 4.1.2 | 4.0.0 | 2.2M |
| `ngx-bootstrap` | 14.1.2 | 14.1.1 | 300k |
| `ng2-file-upload` | (check list) | — | 100k |
| `koa2-swagger-ui` | 5.11.1, 5.11.2 | 5.10.0 | — |
| `angulartics2` | 14.1.2 | 14.1.1 | — |
| `json-rules-engine-simplified` | 0.2.1, 0.2.4 | 0.1.0 | — |

### @ctrl Scope

All at one patch version above safe:
`@ctrl/deluge`, `@ctrl/golang-template`, `@ctrl/magnet-link`, `@ctrl/ngx-codemirror`,
`@ctrl/ngx-csv`, `@ctrl/ngx-emoji-mart`, `@ctrl/ngx-rightclick`, `@ctrl/qbittorrent`,
`@ctrl/react-adsense`, `@ctrl/shared-torrent`, `@ctrl/torrent-file`, `@ctrl/transmission`,
`@ctrl/ts-base32`

Also includes packages from Zapier, Posthog, Postman, ENS domains, NativeScript orgs.

## IOCs

### Files

| Indicator | Context |
|---|---|
| `setup_bun.js` | In any `node_modules/<pkg>/` |
| `bun_environment.js` | In any `node_modules/<pkg>/` |
| `preinstall` → `setup_bun.js` | In compromised `package.json` |

### Network

| Indicator | Type |
|---|---|
| `webhook.site/bb8ca5f6-4175-45d2-b042-fc9ebb8170b7` | Exfil (v1) |
| `169.254.169.254` | Cloud metadata theft |

### GitHub

- Repos with "Shai-Hulud" or "Sha1-Hulud: The Second Coming" in description
- Unauthorized GitHub Actions workflows
- Commits referencing "hulud"

### SHA-256 (v1 bundle.js)

```
de0e25a3e6c1e1e5998b306b7141b3dc4c0088da9d7bb47c1c00c91e6e4f85d6
81d2a004a1bca6ef87a1caf7d0e0b355ad1764238e40ff6d1b1cb77ad4f595c3
83a650ce44b2a9854802a7fb4c202877815274c129af49e6c2d1d5d5d55c501e
4b2399646573bb737c4969563303d8ee2e9ddbd1b271f1ca9e35ea78062538db
dc67467a39b70d1cd4c1f7f7a459b35058163592f4a9e8fb4dffcbba98ef210c
46faab8ab153fae6e80e7cca38eab363075bb524edd79e42269217a083628f09
b74caeaa75e077c99f7d44f46daaf9796a3be43ecf24f2a1fd381844669da777
```

## References

- Datadog: https://securitylabs.datadoghq.com/articles/shai-hulud-2.0-npm-worm/
- Wiz: https://www.wiz.io/blog/shai-hulud-2-0-ongoing-supply-chain-attack
- Unit 42: https://unit42.paloaltonetworks.com/npm-supply-chain-attack/
- JFrog: https://jfrog.com/blog/shai-hulud-npm-supply-chain-attack-new-compromised-packages-detected/
- Microsoft: https://www.microsoft.com/en-us/security/blog/2025/12/09/shai-hulud-2-0-guidance-for-detecting-investigating-and-defending-against-the-supply-chain-attack/
- ReversingLabs: https://www.reversinglabs.com/blog/shai-hulud-worm-npm
- Socket (live list): https://socket.dev/blog/shai-hulud-strikes-again-v2