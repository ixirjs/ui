# Iteration 6 — SSR/FOUC, testing story & shadcn→svelte-atoms migration

_Date: 2026-06-22 · Focus: SSR/hydration safety, the FOUC story, test infrastructure, and how hard it is for a shadcn-svelte user to migrate._

## Part A — SSR / hydration

**Verdict: solid.** One central gate `isBrowser()` (`utils/dom.svelte.ts:5`), imported by 7 modules. Every browser API (`document.` ×11, `window.`, `matchMedia` ×2, `instanceof HTMLButtonElement`) is behind a runtime handler, `$effect`, or `isBrowser()` guard — **no module-scope browser access that would crash SSR**. `localStorage` has **zero** uses in `src/lib`. The `colorScheme()` rune and floating-ui are both SSR-safe. There's even a dedicated `lifecycle-ssr.spec.ts` asserting no lifecycle phases fire server-side.

**Portal/Teleport SSR:** renders **in place** server-side (not detached to `<body>`), then re-parents client-side via a `{@attach teleport}` attachment (attachments only run after mount). Defends the unmount race. Clean.

### The one real gap — FOUC helper is docs-site-only

|                        | shadcn-svelte                               | svelte-atoms                                                                   |
| ---------------------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| Anti-flash dark script | documented `<head>` snippet consumers paste | ⚠️ exists **only in `src/app.html`** (docs shell), **not shipped from `$lib`** |

`src/app.html:16-25` has a blocking inline `<head>` script that reads `localStorage('color-scheme')` + `matchMedia` and sets `.dark` before body render → docs site has no FOUC. **But a consumer importing the package gets no anti-FOUC helper.** Combined with iter-4's finding that the `Theme` provider is also docs-only, this is the same gap twice: **the theming runtime lives in the demo app, not the package.**

### shadcn strength to adopt

- **Ship the FOUC-prevention snippet as a documented, copy-paste `<head>` script** (and/or a tiny `@svelte-atoms/core/theme-script` export). Pair it with the exported `ThemeProvider` from iter 4. _Low effort, removes a real flash-of-wrong-theme bug for every consumer._ ⭐

## Part B — Testing story

| Layer                                | svelte-atoms                                                                                                   | shadcn-svelte                                        |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Unit/integration                     | ✅ **43 spec files** in `src/lib` (Vitest, client+server projects, `expect.requireAssertions`)                 | minimal (relies on **bits-ui's** tests for behavior) |
| Real-browser component tests         | ✅ `vitest-browser-svelte` + chromium (`combobox`/`input` specs, visual `__screenshots__/`)                    | ❌ (none in vendored output)                         |
| Kernel/capability coverage           | ✅ deep — fold/preset/variants/lifecycle/resolvers + 8 capability specs + 7 portal-host specs                  | n/a                                                  |
| Explicit SSR spec                    | ✅ `lifecycle-ssr.spec.ts` (`svelte/server`)                                                                   | n/a                                                  |
| E2E                                  | ⚠️ thin — single `e2e/demo.test.ts`                                                                            | n/a                                                  |
| **Storybook play/interaction tests** | ❌ **none** — 50 `.stories.svelte` but zero `play:`/`@storybook/test`/`userEvent`; addons installed but unused | n/a                                                  |

**This is a clear svelte-atoms WIN over shadcn** — shadcn ships no tests with vendored components and leans entirely on bits-ui upstream. svelte-atoms owns + tests its behavior. Two gaps to close _internally_ (not from shadcn, but worth noting):

1. **Add Storybook play functions** — the addons (`@storybook/addon-vitest`, `addon-a11y`) are already installed but no story has interaction assertions. Free a11y + interaction coverage on top of existing stories. ⭐
2. **Broaden E2E** beyond the single demo test.

## Part C — shadcn→svelte-atoms migration path

The two share the **exact oklch token contract** (`root.css` ≈ shadcn's), so the visual/theming migration is nearly free. The mental-model shift is the cost.

| Migration dimension     | Friction  | Notes                                                                                                                             |
| ----------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| CSS tokens / colors     | 🟢 ~none  | same `--background/--primary/--ring/--radius` vars; paste your existing theme                                                     |
| Tailwind setup          | 🟢 low    | both Tailwind; svelte-atoms is v4                                                                                                 |
| Component imports       | 🟡 medium | shadcn: vendored local paths → svelte-atoms: `@svelte-atoms/core` imports                                                         |
| **Customization model** | 🔴 high   | shadcn: edit the component's `cva` + JSX → svelte-atoms: override **preset entries** by slot key. Totally different mental model. |
| Variant names           | 🟡 medium | map shadcn's `variant`/`size` to your preset `variants`/`defaults`                                                                |
| Form code               | 🟡 medium | formsnap+superforms → svelte-atoms Field set (iter 3)                                                                             |

### shadcn strengths to adopt for migration

1. **Write a "Coming from shadcn-svelte" migration guide** — token reuse (paste your vars), the import change, and crucially a **side-by-side "edit the cva" → "override the preset" example**. This directly attacks the 🔴 customization mental-model cost and is the single highest-leverage doc you could add for adoption. ⭐⭐
2. **A token-import shim** — since the contracts match, document/ship a path to drop an existing shadcn `globals.css` straight in. _Trivial._
3. **Map table of shadcn component name → svelte-atoms equivalent** (Separator→Divider, Sheet→Drawer, Scroll Area→Scrollable, Sonner→Toast, Table→Datagrid — from iter 3). _Low._

## Part D — The customization ladder vs. the fork

The 🔴 "Customization model" row above is the single biggest migration cost, but framing it as "edit cva vs. override presets" undersells the real distinction. It isn't two equivalent techniques at the same altitude — it's **one seam vs. a ladder of seams**.

**shadcn:** customization has exactly one entry point — the source file you vendored into your repo. You own the copy, so any change means editing the `cva()` variants and the JSX. Powerful and unconstrained, but all-or-nothing at one altitude: you fork the whole component and now you maintain it forever. There is no "just retint the variant" that costs less than "own the markup." Every change, however cosmetic, pays the full fork tax.

**svelte-atoms:** customization is _layered_, and you enter at the altitude that matches the change. The cost scales with how deep the change actually goes:

| Rung               | Entry point                                                       | When                                                | Ownership cost                                              |
| ------------------ | ----------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| 1. **Preset**      | override preset entries by slot key                               | pure look / variant changes                         | none — component stays ours, you only swap resolved classes |
| 2. **Declaration** | `defineBond` / atom overrides (`attrs`, `handlers`, capabilities) | re-wire behavior of a slot without touching markup  | low — you own one slot's wiring                             |
| 3. **Wrapper**     | compose existing root + parts into your own component             | impose your own opinionated API, reuse bond + atoms | medium — you own the composition, not the internals         |
| 4. **Bottom-up**   | build on `Bond` / `BondState` / capabilities directly             | nothing existing fits                               | full — but only when you genuinely need it                  |

**The takeaway:** shadcn makes you pay the fork cost for _any_ change because it exposes a single seam; svelte-atoms lets the cost scale with the depth of the change because it exposes a ladder of seams. A retint is rung 1 (zero maintenance burden); a full rebuild is rung 4 — and you only descend as far as the change demands.

This reframes the migration guidance: the side-by-side example (action #2 below) shouldn't just show "edit the cva → override the preset." It should show the **ladder** — that the shadcn habit of forking-for-everything is replaced by _choosing an altitude_, and that most changes that felt heavy in shadcn (a fork + ongoing maintenance) collapse to a rung-1 preset override here.

## Consolidated actions this iteration (ranked)

1. **Ship FOUC `<head>` script** (export + docs) alongside the exported `ThemeProvider`. ⭐ closes a real flash bug
2. **"Coming from shadcn" migration guide** (token reuse + the customization-ladder side-by-side from Part D, not just a flat cva→preset swap). ⭐⭐ top adoption lever
3. **Add Storybook play functions** — addons already installed, free interaction/a11y coverage. ⭐
4. **Component name-mapping table** for migrants. low
5. **Broaden E2E** beyond the single demo test. low/medium

## Cross-iteration pattern emerging

The **theming runtime keeps living in the docs app, not the package** (Theme provider — iter 4; FOUC script — iter 6). Bundling these into `$lib` is a recurring, cheap, high-DX win.

## Open threads for next iterations

- [ ] Performance: is the heavy variant-memoization engine justified vs cva's simplicity? (benchmark the trade-off)
- [ ] API stability / semver discipline as a marketed advantage over shadcn's vendored drift.
- [ ] Composition/`base`-prop polymorphism vs shadcn's `asChild` — DX comparison.
- [ ] Icon strategy: lucide-svelte (stories-only) vs shadcn's icon approach — what should consumers use?
- [ ] **Synthesis pass**: consolidate all iterations into a single prioritized roadmap.
