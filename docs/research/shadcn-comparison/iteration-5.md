# Iteration 5 — Bundle/dependency cost + CLI/registry design sketch

_Date: 2026-06-22 · Focus: the real cost of svelte-atoms's dependency surface (shadcn ships ~zero runtime deps), tree-shaking reality, and a concrete design for the recurring "missing CLI/registry" theme._

## Part A — Dependency diet (the concrete numbers)

`dist/` is **4.9M**. Runtime `dependencies` (11) vs shadcn's near-zero. Audit of who actually imports each (src/lib only):

| Dep                                              | src/lib import sites                           | Verdict                                                                                                                                |
| ------------------------------------------------ | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `@modelcontextprotocol/sdk`                      | **0**                                          | 🔴 **misplaced** — only used by `src/routes/api/[transport]/+server.ts` (docs-site MCP route, NOT published). Move to devDependencies. |
| `mcp-handler`                                    | **0**                                          | 🔴 **misplaced** — same as above. Move to devDependencies.                                                                             |
| `lucide-svelte`                                  | **0 non-story** (2 story hits)                 | 🔴 **stories only** — move to devDependencies.                                                                                         |
| `@qrcode-js/browser`                             | 2 (qr-code only)                               | 🟠 single-component → optionalDependency + lazy `import()`                                                                             |
| `date-fns`                                       | 7 (calendar + date-picker only)                | 🟠 two families → candidate peer/optional                                                                                              |
| `motion`                                         | 17 (8+ families' `motion.svelte.ts`)           | 🟡 heavy but gated + opt-in; bare `from 'motion'` already pulls only `animate`/easings                                                 |
| `@floating-ui/dom`                               | 1 runtime value import (popover) + 5 type-only | 🟢 keep (gates whole overlay family)                                                                                                   |
| `clsx`, `tailwind-merge`, `nanoid`, `es-toolkit` | core path                                      | 🟢 keep (small)                                                                                                                        |

### Biggest free wins

1. **Move `@modelcontextprotocol/sdk` + `mcp-handler` + `lucide-svelte` to devDependencies.** They are **shipped as runtime deps but have zero `src/lib` usage** — every consumer currently resolves two large server-only packages they never load. _Trivial, pure win._ ⭐⭐
2. **`@qrcode-js/browser` → optionalDependency + lazy `import()`** inside `qr-code.svelte`. _Low._
3. **`date-fns` → consider peerDependency** (only calendar/date-picker users pay). _Medium (API contract change)._

### Tree-shaking verdict (better than feared)

- `src/lib/index.ts` is a **flat `export *` barrel** of all 54 components → the root barrel statically references everything.
- **BUT** `"sideEffects": ["**/*.css"]` is set correctly, so modern bundlers (Vite/Rollup/esbuild) DCE unused re-exports. Traced: `import { Button }` pulls only `clsx + tailwind-merge + nanoid` — **does NOT reach motion/date-fns/floating-ui/qrcode.**
- **Bulletproof path:** `import { Button } from '@svelte-atoms/core/button'` (per-component subpath export) bypasses the barrel entirely.

**shadcn comparison:** shadcn's "zero runtime deps" is structurally why a vendored Button is tiny. svelte-atoms can't hit zero (it owns behavior via runtime classes), but the diet above + documenting the deep-import path closes most of the perceived gap. **Action: add a docs note recommending `/<component>` deep imports for bundle-sensitive consumers.**

## Part B — CLI / registry design sketch

The missing CLI surfaced in iterations 1, 3, and 4. It's the single most-cited shadcn strength. svelte-atoms should NOT copy shadcn's "vendor the source" model (that throws away the upgrade-path advantage). Instead: **a CLI that scaffolds _configuration_, not source.**

### What `npx @svelte-atoms/add` should do

```
npx @svelte-atoms/init        # creates components.json-style config + imports root.css + sets up preset module
npx @svelte-atoms/add button  # appends a typed preset stub for 'button' + 'button.*' slots to the consumer's preset file
npx @svelte-atoms/add dialog  # adds dialog + dialog.content/header/body/footer/title/... preset stubs
npx @svelte-atoms/theme       # interactive: pick palette/radius → writes CSS-var overrides (ties to iter-4 theme generator)
```

### Why config-not-source fits svelte-atoms

- The component still comes from the installed package (upgrade path preserved).
- What the consumer "owns" is the **preset entry** — the exact thing they want to customize — pre-stubbed with the right slot keys and typed against `Partial<Preset>`.
- Solves the **discoverability gap** flagged in iter 2 & 4: instead of needing to know `PresetModuleMap`, the CLI writes the correct keys for them.

### Registry shape

- A `registry.json` mapping each component → its slot keys + default preset + dep notes (e.g. `qr-code` warns it needs `@qrcode-js`). Drives both the CLI and the docs "install" snippet.
- Generate it from the existing `PresetModuleMap` so it never drifts.

### Effort/impact

- **High impact** (closes the #1 adoption objection) / **medium effort** (the data already exists in `PresetModuleMap` + per-component `props.ts`).
- Sequence: registry.json generator → `init`/`add` (preset stubs) → `theme` (generator) → docs integration.

## Consolidated actions this iteration (ranked)

1. **devDependencies move** for MCP SDK + mcp-handler + lucide-svelte. ⭐⭐ trivial, ships smaller install today
2. **Deep-import docs note** + recommend `/<component>` for bundle-sensitive users. ⭐ low
3. **`@qrcode-js` optional + lazy import.** 🟠
4. **CLI/registry** (config-not-source) — generate `registry.json` from `PresetModuleMap`, then `init`/`add`/`theme`. ⭐ flagship adoption feature
5. **Evaluate `date-fns` → peer** for calendar/date-picker. 🟠 (API change, weigh later)

## Open threads for next iterations

- [ ] Migration path: shadcn-svelte user → svelte-atoms (token reuse, import-vs-vendor mental shift).
- [ ] SSR / SvelteKit behavior (hydration, FOUC on theme, server snapshots).
- [ ] Testing & stability story (Storybook + Playwright here; shadcn relies on bits-ui's tests).
- [ ] Performance: the heavy variant memoization engine — is it justified vs cva's simplicity?
- [ ] API stability / semver discipline as a marketed advantage over shadcn's vendored drift.
