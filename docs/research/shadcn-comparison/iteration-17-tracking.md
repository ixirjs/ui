# Iteration 17 — Implementation tracking snapshot #1

_Date: 2026-06-22 · Mode shift: the investigative study is complete (iters 1–16). This and subsequent runs **track which roadmap items have landed** in `src/lib` rather than re-treading covered ground._

## ✅ Movement detected since the study began

**Tier 0.1 (dependency diet) — DONE in the working tree (snapshot #2).**
`package.json` is modified (uncommitted, ` M package.json`). Comparing HEAD vs working tree:

| Dep                         | HEAD              | Working tree                  | Status  |
| --------------------------- | ----------------- | ----------------------------- | ------- |
| `@modelcontextprotocol/sdk` | in `dependencies` | **moved → `devDependencies`** | ✅ done |
| `mcp-handler`               | in `dependencies` | **moved → `devDependencies`** | ✅ done |
| `lucide-svelte`             | in `dependencies` | **moved → `devDependencies`** | ✅ done |

→ All three shipped-but-unused runtime deps (the iter-5 / iter-16 Tier-0 recommendation) have been moved to `devDependencies`. Each had **zero non-story `src/lib` usage**: the MCP pair is used only by the docs-site route `src/routes/api/[transport]/+server.ts`, and `lucide-svelte` only by `*.stories.svelte` files (excluded from publish via the `files` glob). `bun install` re-resolved with no version changes — pure recategorization. **Tier 0.1 closed; consider committing.**

**Framing correction (motion).** A working-tree note overstated `motion` as a non-tree-shakeable "bundled" dep based on a raw 50-file grep. Iter-5's traced analysis stands: `motion` is **gated per-component** (only families with a `motion.svelte.ts` reach it) and `import { Button }` does **not** pull it — `"sideEffects": ["**/*.css"]` lets modern bundlers DCE it. svelte-atoms can't hit shadcn's literal zero (it owns behavior via runtime classes), but only `clsx + tailwind-merge + nanoid` are effectively always-on; everything else is pay-per-component.

## ⬜ Not yet started (re-verified this run)

| Roadmap item                                 | Tier | Current state                                           |
| -------------------------------------------- | ---- | ------------------------------------------------------- |
| Home/End enabled (select/combobox/menu)      | 0    | no `homeEnd:true` found — still gated off               |
| Demote memo-engine internals from `./utils`  | 0    | unchanged                                               |
| `data-state` on disclosure/overlay content   | 1    | none on collapsible/accordion/dialog/popover            |
| `Field.Error` component                      | 1    | no `field-error.*` in `form/field/`                     |
| Wire keyboard into tabs/tree/accordion       | 1    | still zero `onkeydown`/`navigationCapability`           |
| `ThemeProvider`/`ThemeToggle` in `$lib`      | 1    | still docs-only                                         |
| Exports-snapshot + `.changeset/` + CHANGELOG | 1    | none present                                            |
| Narrow `ElementProps` index signature        | 1    | `[key: string]: unknown` still at `element/types.ts:70` |

## Notes

- No new commits since study start (`git log` top = `7f9da8ac`), so the dep change is an in-progress working edit, not yet a recorded decision.
- This snapshot is point-in-time; the table is the cheap re-checkable contract for future tracking runs.

## Loop guidance for the next run

The deliverable ([iteration-16-final.md](iteration-16-final.md)) is complete and Tier 0.1 (dependency diet) is now fully landed in the working tree. Options the next fire should pick from, in order:

1. If more roadmap items have landed → record them here (append a snapshot #2).
2. If nothing has moved → the loop has saturated; **pause it** (`CronDelete eacd6c82`) rather than emit a redundant summary. The user was offered this in iter 16.
3. If the user redirects → follow the new angle.
