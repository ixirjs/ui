# Iteration 4 — Theming, dark mode, variant system & docs site

_Date: 2026-06-22 · Focus: theming/multi-theme, dark-mode ergonomics, `defineVariants` vs cva/tailwind-variants, and the documentation site (shadcn's docs are a top adoption asset)._

## Theming & dark mode

| Aspect                     | shadcn-svelte                                                      | @svelte-atoms/core                                                                                                                                                             |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Token contract             | oklch CSS vars, `.dark` block                                      | **Identical vocabulary** (`root.css`) + small shadow/spacing extension                                                                                                         |
| Dark-mode util             | ships pointer to `mode-watcher`                                    | ⚠️ only a `colorScheme()` media-query rune is **exported**; the actual provider/persist/toggle (`Theme` class) is **demo code in `src/routes/theme.svelte.ts`, not in `$lib`** |
| Prebuilt themes            | multiple (Zinc/Slate/Rose/…)                                       | ❌ **one** light/dark set only                                                                                                                                                 |
| Theme generator/customizer | ✅ interactive "Themes" page (pick palette/radius → copy CSS vars) | ❌ none — `docs/preset/` only documents writing presets by hand                                                                                                                |
| Multi-theme switching      | ✅                                                                 | ❌                                                                                                                                                                             |

### shadcn STRENGTHS to adopt (theming)

1. **Ship a real dark-mode utility from `$lib`.** Promote the docs-only `Theme` class (system detection + `$state` override + `localStorage` persist + `.dark` toggle) into the exported package as a `<ThemeProvider>` / `useTheme()` + a ready `<ThemeToggle>` component. Right now every consumer must re-copy demo code — exactly the shadcn-vendoring friction you otherwise avoid. _Low effort, high DX._ ⭐
2. **A theme generator on the docs site.** shadcn's "pick colors + radius, copy the CSS variables" page is a massive adoption/marketing tool. Because your tokens are the same oklch contract, you can build the same generator that emits a `root.css` override or a preset block. _Medium, high differentiation._ ⭐
3. **Prebuilt theme presets.** Ship 2–4 alternate palettes (you already have the context-preset layering to make per-subtree themes trivial — lean into a strength shadcn lacks). _Medium._
4. **Document the CSS-var contract** as a first-class reference page (every token, light/dark value, what it controls). _Low._

## Variant system — `defineVariants` vs cva/tailwind-variants

`defineVariants` (`src/lib/utils/variant.ts`) ≈ cva/tailwind-variants but:

- `class` (base), `variants`, `compounds` (= `compoundVariants`), `defaults` (= `defaultVariants`).
- ❌ **No `slots`** — multi-part styling handled by dotted preset keys (`'card.title'`) instead. Different mental model, functionally equivalent.
- ✅ **Bond/state-reactive:** every variant value can be `(bond) => classes|{class,...attrs}`, and the whole config can be a factory `(bond) => def`. **cva/tailwind-variants cannot do state-reactive variants** — this is a genuine svelte-atoms advantage.
- ✅ Emits attributes, not just classes.
- ✅ Heavy memoization engine (`atom/utils/variants.ts`: WeakMap + LRU, reference-stable) — more caching than tailwind-variants.

### Takeaways (variants)

- **Adopt the `slots` mental model in docs**, even if implemented via preset keys — shadcn/tailwind-variants users expect "one variant def, many parts." Show the mapping (`slots: {trigger, content}` ≈ `'x.trigger'`, `'x.content'`) so migrants aren't lost.
- **Market state-reactive variants** — it's a real capability shadcn's static cva can't match (e.g. `row: (bond) => bond.state.isSelected ? ... : ...`).

## Docs site

**Strong already:** per-component pages (`content.svelte` → `DocComponentPage`) with **live preview + raw source** (`import.meta.glob('?raw')`), typed **props/API tables** (`DocPropsTabs` from `props.ts`), per-component preset/install snippets, **copy buttons**, ~41 component pages + ~17 concept pages, centralized previews. **`llms.txt` coverage is broader than shadcn** (~55 files + `llm-access` component) — a real edge.

| Docs feature                      | shadcn                | svelte-atoms                    | Gap                   |
| --------------------------------- | --------------------- | ------------------------------- | --------------------- |
| Live preview + code               | ✅                    | ✅                              | parity                |
| Props/API table                   | ✅                    | ✅                              | parity                |
| Copy buttons                      | ✅                    | ✅                              | parity                |
| `llms.txt`                        | partial               | ✅ broader                      | **svelte-atoms wins** |
| **Install snippet = CLI command** | ✅ `npx shadcn add x` | ⚠️ import snippet only (no CLI) | gap (tied to no-CLI)  |
| **Theme generator page**          | ✅                    | ❌                              | gap                   |
| **"Open in v0 / copy for LLM"**   | ✅ (v0)               | ⚠️ has `llm-access` (close)     | near-parity           |
| Coverage                          | full catalog          | 41/55 documented                | minor gap             |

### shadcn STRENGTHS to adopt (docs)

1. **Document the remaining ~14 components** to hit full-catalog coverage. _Low/ongoing._
2. **Per-component "how to install/import" that's copy-exact** — already have import snippets; once a CLI exists (iter 1 & 3 theme), make the docs show `npx @svelte-atoms/add x`. _Tied to CLI._
3. **Theme generator page** (repeat of theming §2). ⭐

### Where svelte-atoms already wins (docs)

- Broader `llms.txt` + `llm-access` (AI-consumption story ahead of shadcn).
- Live preview pulls **real source via `?raw`** so docs can never drift from runnable code.
- Concept pages (philosophy/atoms/bonds/capabilities/composition) — shadcn has almost no architectural docs because there's no architecture to explain.

## Consolidated action candidates this iteration (ranked)

1. **Export a `ThemeProvider` + `ThemeToggle` from `$lib`** (promote the docs `Theme` class). ⭐ low effort
2. **Theme generator page** on the docs site (emits CSS-var/preset override). ⭐ high marketing value
3. **Ship 2–4 prebuilt theme presets** (leans on your per-subtree preset strength). ⭐
4. **Document the CSS-var contract** + the `slots`↔preset-key mapping for cva migrants.
5. **Finish documenting the ~14 undocumented components.**

## Open threads for next iterations

- [ ] Realistic bundle-size slice: single `Button` import → tree-shake reality + dep cost (motion/date-fns/etc.).
- [ ] CLI/registry design sketch (recurring theme across iters 1, 3, 4 — worth a dedicated deep-dive).
- [ ] Migration path: how hard is it for a shadcn-svelte user to switch? (import-vs-vendor, token reuse).
- [ ] SSR / SvelteKit behavior (hydration, FOUC, server snapshots).
- [ ] Testing & stability story (svelte-atoms has Storybook + Playwright; what does shadcn rely on?).
