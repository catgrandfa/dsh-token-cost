# dsh-token-cost

> A **token spend panel** for DSH (DeepSeek Harness): what you spent today, where it went,
> how much prompt caching saved, and how much budget is left.
> Compatible with DSH 0.2.x, **zero external dependencies** (bundled multi-frame zstd decoder —
> no `zstd` binary or Homebrew required).

[中文](README.md) | English

> This is a community plugin, not an official DeepSeek plugin. Amounts are **local estimates**,
> not an official invoice; refer to the [official pricing page](https://api-docs.deepseek.com/quick_start/pricing).

---

## What it is

Derived from the community plugin [`dsh-token-meter-panel`](https://github.com/olimc2016/dsh-token-meter-panel)
(MIT, 0.6.7), this project keeps its collection / pricing / official-usage core but **rebuilds the
panel UI** and adds daily-cost projection, a monthly budget, per-model breakdown, CSV/JSON export
and a standalone CLI report. It also prices domestic third-party models such as **GLM (Zhipu)**
and **Kimi (Moonshot)** from official per-model rates.

DSH records token usage in session logs but **does not price it**. This plugin turns usage into money:

- **Today / last 7 days / last 30 days / this month** spend, plus account balance
- **Budget progress**: daily budget, monthly budget, and a "projected today" figure
- **Where the money went**: cached input / uncached input / output, with per-model, per-session
  and per-provider rankings
- **What caching saved**: cached-input price is 1/50–1/30 of the uncached price
- **Portable**: one-click CSV / JSON export; `node tools/report.mjs` works without DSH

![Overview](docs/preview-overview.png)

<table>
<tr>
<td width="50%"><img src="docs/preview-detail.png" alt="Breakdown: by model, by session"></td>
<td width="50%"><img src="docs/preview-export.png" alt="Export: CSV/JSON, CLI and HTTP API"></td>
</tr>
<tr>
<td align="center"><sub>Breakdown: model / session / provider</sub></td>
<td align="center"><sub>Export: download + CLI + HTTP API</sub></td>
</tr>
</table>

> Screenshots are rendered from **synthetic data** via `node tools/preview.mjs --demo`;
> they contain no real sessions, paths or balances.

---

## Features

| View | Content |
|---|---|
| **Overview** | Today's spend (official vs mixed badge), vs yesterday, projection, daily / monthly budget, balance, 7/30-day and **month / quarter / year** totals, channel split (official / third-party), four token stats, hit rate, cost per call, peak/off-peak prices, 30-day **line trend**, hourly distribution, live session usage |
| **Breakdown** | Today / 7d / 30d / month / quarter / year switch; per-model (including GLM / Kimi) spend and share, per-session table (search, subagent tag), per-provider totals, cost composition, **daily history** |
| **Export** | Daily / sessions / models × today / 7d / 30d / month / quarter / year / all × CSV / JSON, one-click download; CLI and HTTP examples |

More:

- **GLM / Kimi support**: third-party routes (pi-ai etc.) are included by default and priced by model id from official GLM / Kimi rates; unknown models are counted but never guessed
- **No-budget mode**: budget defaults to `0` — record spend without progress bars or alerts; click to set one
- **Sidebar preview**: the entry shows `Token · ¥9.87` (expanded text and collapsed tooltip)
- **Peak / off-peak pricing**: Beijing time Mon–Fri 09:00–12:00 and 14:00–18:00, computed per tier then summed
- **Official cross-check**: optional DeepSeek account session or `platform.deepseek.com` web login
- **Balance**: DSH account or `DEEPSEEK_API_KEY`; the account path also exposes lifetime spend
- **Edit settings in the panel**: click the budget / low-balance hint to write the value back
- **Skins**: `default` (follows DSH theme) / `glass`
- **Zero-config**: no API key and no external decompressor needed

---

## Install

### GitHub (recommended, pinned)

```bash
dsh plugin --profile desktop add github:catgrandfa/dsh-token-cost#v0.3.5
```

Use `--profile web` for the web profile.

### One-liner scripts

**macOS / Linux**

```bash
curl -fsSL https://raw.githubusercontent.com/catgrandfa/dsh-token-cost/main/install.sh | bash
```

**Windows (PowerShell)**

```powershell
powershell -ExecutionPolicy Bypass -Command "iwr -UseBasicParsing https://raw.githubusercontent.com/catgrandfa/dsh-token-cost/main/install.ps1 | iex"
```

### From source

```bash
git clone https://github.com/catgrandfa/dsh-token-cost.git
cd dsh-token-cost
npm install --cache /tmp/dsh-npm-cache
npm run setup
npm test
dsh plugin --profile desktop add .
```

> Fully quit and restart DSH after installing. A "Token" entry appears at the bottom of the sidebar.

**Coexistence**: package name, route prefix (`/token-cost`), settings namespace (`token-cost`) and
sidebar slot id (`tokencost`) are all independent from the upstream plugin, so both can be installed
side by side.

---

## Pricing model

Costs are estimated from **official DeepSeek CNY prices**:

- Models: `deepseek-flash`, `deepseek-v4-pro` (legacy `deepseek-v4-flash` is billed as Flash)
- **Two tiers**, off-peak = half of peak
- Peak: Beijing time Mon–Fri 09:00–12:00 and 14:00–18:00 (public holidays not detected)
- `reasoningTokens` are already part of `outputTokens`
- **Unknown models are never priced**: tokens are counted, money is not guessed
- Price source: <https://api-docs.deepseek.com/quick_start/pricing> (captured 2026-09-19)

### Third-party models (GLM / Kimi)

Provider routes added through pi-ai or similar adapters can have arbitrary names; pricing is keyed by
**model id**, not by provider name:

| Family | Models | Input / cache hit / output (CNY per 1M tokens) | Source |
|---|---|---|---|
| GLM | `glm-5.3`, `glm-5.2` | 8 / 2 / 28 | [Zhipu pricing](https://open.bigmodel.cn/pricing) (2026-10-28) |
| GLM | `glm-5.1` (base tier) | 6 / 1.3 / 24 | same |
| GLM | `glm-5.3-flash` | 0.8 / 0.23 / 2.8 | same |
| GLM | `glm-5.3-flashx` | 2 / 0.57 / 7 | same |
| GLM | `glm-4.7-flash` | free | same |
| Kimi | `kimi-k3.1-pro` | 13 / 1.3 / 68 (cache write 13) | [Kimi pricing](https://platform.kimi.com/docs/pricing/chat) (2026-10-28) |
| Kimi | `kimi-k3` | 20 / 2 / 100 (cache write 20) | same |
| Kimi | `kimi-k3.1-pro-highspeed` | 26 / 1.3 / 136 | same |
| Kimi | `kimi-k2.7-code` / `kimi-k2.6` | 6.5 / 1.3–1.1 / 27 | same |

- Long-context tiers, limited-time discounts and subscription plans cannot be reconstructed from
  aggregated tokens; the built-in rates use the standard base tier
- Models without a built-in rate are counted as tokens only (`unpricedCalls`)
- Model-name case and `provider/model` prefixes are normalized
- Third-party **balance / plan quota** is not integrated yet; the balance card still queries DeepSeek only

### Custom channel rates (optional)

The same model can be served through different channels with different prices (for example DeepSeek
models behind a third-party relay). You can price a **channel × model** explicitly; a hit is billed at
that flat rate (CNY per 1M tokens, **no peak/off-peak split**):

```json
{
  "channelRates": {
    "<provider name>": {
      "<model name / normalized key / *>": { "cacheHit": 1, "cacheMiss": 2, "output": 3, "cacheWrite": 0 }
    },
    "*": { "*": { "cacheHit": 0.5, "cacheMiss": 1, "output": 2 } }
  }
}
```

- `*` works as a fallback for both provider and model; a channel rate wins over built-in / official rates
- Entries missing `cacheHit` / `cacheMiss` / `output` are ignored and fall back to built-in rates
- Put it in the profile's config patch (`$DSH_HOME/profiles/<profile>/cordis.patch.yml`, under the
  `token-cost` row as `config.channelRates`) and restart DSH
- The overview's **Channel split** card shows official vs third-party spend for today / last 30 days

All rates, budgets, alert thresholds and refresh intervals are editable under
**Settings → Plugins → token-cost**.

**Budgets default to `0` (record-only)**: no progress bar and no alerts until you set a daily / monthly
budget above zero. The sidebar entry also shows today's spend as `Token · ¥x.xx`.

**Third-party providers are included by default** (GLM / Kimi etc.). Set `officialOnly` (or pass
`--official-only` to the CLI) to restrict the report to DeepSeek.

---

## Data sources

1. **Local session logs** (the only source for per-session / per-model detail)
   `$DSH_HOME/sessions/<workspace>/<session>/session[.vN].jsonl[.zstd]`, aggregated by Beijing day.
   Multi-frame zstd is decoded in pure JS (`src/zstd.mjs`).
2. **Official usage** (optional; preferred for daily totals)
   DSH account session when signed in, otherwise the browser `userToken` of `platform.deepseek.com`.
3. **Third-party providers (GLM / Kimi etc.)**: from local logs; priced when a built-in rate matches
4. **Balance / lifetime spend**: account service or `api.deepseek.com/user/balance` (DeepSeek only).

The official usage API only covers the last 30 days of DeepSeek; the plugin merges it with local
third-party usage per day (badge: "official + 3rd-party") while keeping provider/model detail separate.

### Known gaps

- Session-title generation and web-search calls do not persist `usage`
- Active sessions are still appending, so "today" is a lower bound (noted in the panel footer)
- **Month / quarter / year use local logs**: the official usage API only returns the last 30 days;
  the scan window defaults to 365 days and may backfill in stages (the footer shows scan progress)
- Local estimates may differ from the official bill by a few cents
- GLM / Kimi tiered pricing, discounts and subscription plans are not recoverable; third-party balance is not integrated

---

## Export & CLI

### Panel export

Pick **dataset × scope × format** in the Export view and download. Exports contain token counts,
costs and session metadata only — **no prompts, file paths or credentials**.

HTTP endpoints (same origin, DSH auth):

```bash
GET /token-cost/export?dataset=daily&scope=7d&format=csv
GET /token-cost/export?dataset=sessions&scope=month&format=json
GET /token-cost/export?dataset=models&scope=year&format=csv
```

### CLI

Works without DSH running (Node built-ins only):

```bash
node tools/report.mjs --days 7 --top 5        # readable: summary + daily + models + sessions
node tools/report.mjs --json
node tools/report.mjs --csv daily             # daily | sessions | models
node tools/report.mjs --budget 5
node tools/report.mjs --official-only         # DeepSeek only
node tools/report.mjs --sessions-root ~/.dsh/sessions
```

---

## Privacy

- Reads `$DSH_HOME/sessions/**` only; writes no business files; spawns no commands
  (the single exception is the optional background auto-update, which runs `dsh plugin add`
  only after 60 s uptime when a new release is found, and can be disabled)
- Credentials are resolved by **reference name** through DSH and stay in the host process
- Browser-session reading copies `Local Storage/leveldb` to a temp dir, extracts only the
  `platform.deepseek.com` entry, then deletes the copy
- Network is limited to official usage / balance (optional) and the GitHub release check (optional)

---

## Compatibility

- DSH 0.2.x (tested on 0.2.0-rc.2); Node ≥ 22.19
- macOS tested; Windows / Linux covered by CI
- No npm release yet; install via GitHub

---

## Development

```bash
npm install --cache /tmp/dsh-npm-cache
npm run setup
npm run build          # rebuild lib/client.js after editing src/client/**
npm test               # verify-* / smoke-* / report
node tools/preview.mjs --demo --view overview   # synthetic preview (no real logs)
```

---

## License

MIT — see [LICENSE](LICENSE). Derived from
[`dsh-token-meter-panel`](https://github.com/olimc2016/dsh-token-meter-panel)
(MIT, `Copyright (c) 2026 oli20`); `src/zstd.mjs` adapts DSH's
`@deepseek-ai/dsh-session-persistence-jsonl` (MIT, `Copyright (c) 2026 DeepSeek`).
See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

## Credits

- [oli20](https://github.com/olimc2016) for the upstream collection core, pricing model and
  official-usage plumbing
- The DeepSeek Harness team for the plugin system and session-log format
