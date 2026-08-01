# Iteration 2 — Accessibility depth & single-component customization DX

_Date: 2026-06-22 · Focus: how deep the a11y wiring goes (dialog + select/combobox) and what a consumer actually writes to restyle one slot. shadcn-svelte gets its behavior from **bits-ui**, so this is really "svelte-atoms capabilities vs bits-ui primitives"._

## A11y scorecard — Dialog

| Concern                                         | svelte-atoms                                                                  | bits-ui (shadcn)       | Verdict                |
| ----------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------- | ---------------------- |
| `role=dialog` + `aria-modal`                    | ✅ `modal.svelte.ts`                                                          | ✅                     | parity                 |
| `aria-labelledby` / `describedby` (conditional) | ✅ only when title/desc exist                                                 | ✅                     | parity                 |
| Focus trap                                      | ⚠️ soft query-based (`dom.svelte.ts` re-queries focusables, wraps first/last) | ✅ sentinel/inert trap | **bits-ui stronger**   |
| Initial focus on open                           | ✅ first focusable, `preventScroll`                                           | ✅                     | parity                 |
| Focus restore on close                          | ✅ `useFocusRestore` (snapshot/restore regardless of close path)              | ✅                     | parity                 |
| Escape + escape-stack gating                    | ✅ `isTopOverlay` gating, nested-aware                                        | ✅                     | parity                 |
| Backdrop/outside click                          | ✅                                                                            | ✅                     | parity                 |
| **Body scroll-lock**                            | ❌ **missing entirely**                                                       | ✅                     | **GAP — bits-ui wins** |

## A11y scorecard — Select / Combobox

| Concern                                        | svelte-atoms                                            | bits-ui (shadcn) | Verdict                |
| ---------------------------------------------- | ------------------------------------------------------- | ---------------- | ---------------------- |
| `aria-activedescendant` pattern                | ✅                                                      | ✅               | parity                 |
| listbox/option roles, `aria-selected`          | ✅                                                      | ✅               | parity                 |
| Arrow nav                                      | ✅                                                      | ✅               | parity                 |
| `aria-expanded`/`controls`/`haspopup`          | ✅                                                      | ✅               | parity                 |
| combobox `role=combobox` + `aria-autocomplete` | ✅                                                      | ✅               | parity                 |
| **Home/End**                                   | ⚠️ capability exists but **disabled** (`homeEnd:false`) | ✅ enabled       | **GAP (easy)**         |
| **Typeahead (first-letter jump)**              | ❌ **not implemented** on plain select                  | ✅               | **GAP — bits-ui wins** |

## shadcn-svelte / bits-ui STRENGTHS to adopt

1. **Body scroll-lock on modal open** — the single most visible a11y/UX gap. bits-ui locks `<body>` scroll (and compensates scrollbar width to avoid layout shift) when any modal opens. svelte-atoms has nothing in `dialog/` or `portal/`. → **Build a `scrollLock` capability/policy** in `portal/host/policies/`, activated by `modalCapabilities()`, ref-counted so nested overlays don't unlock early.
2. **First-letter typeahead on listboxes** — bits-ui lets users type "Ar…" to jump to "Argentina" in a closed/open select. svelte-atoms only filters via the _combobox_ free-text input; a plain `Select` has no typeahead. → **Add a typeahead model** in `shared/capability/models/` (buffer + timeout + match-from-active), wire into select's navigation.
3. **Enable Home/End for select/combobox** — the `navigation` model already implements it; it's just gated off (`homeEnd` defaults `false`). → One-line config flip in the select/combobox capability bundle. _Cheapest win available._
4. **Sentinel/inert focus trap** — bits-ui uses focus-guard sentinels so programmatic focus escapes are caught. svelte-atoms re-queries focusables and wraps literal first/last (misses programmatic moves, shadow DOM/iframe edges), partly backstopped by `inert` on the inactive root. → Consider hardening `focusTrap` with sentinel nodes for the long tail.

## Where svelte-atoms ALREADY wins on a11y

- **a11y as composable capabilities, not per-component code.** Focus/escape/focus-restore live once in `portal/host/policies/` and are shared by every overlay (`modalCapabilities()` bundle). bits-ui re-implements per primitive; svelte-atoms's version is DRY and uniformly correct across dialog/popover/menu/select.
- **Escape-stack with top-overlay gating** is first-class (`isTopOverlay`), so nested overlays close in the right order — a subtle thing bits-ui handles per-component but svelte-atoms centralizes.
- **Reactive ARIA from atoms** (`get attrs()` spreading `...super.attrs`) keeps cross-slot wiring (`labelledby`/`controls`) consistent and impossible to forget.

## Customization DX — the real differentiator

A consumer has **three clean granularities** (vs shadcn where you just edit the vendored file):

```ts
// 1. One-off override — class lands LAST in the cascade, twMerge resolves conflicts
<Dialog.Content class="max-w-md rounded-xl" />

// 2. App-wide re-skin — register the slot key; every <Dialog.Content> picks it up via context
export const preset: Partial<Preset> = {
  'dialog.content': () => ({ class: 'bg-card rounded-lg shadow-lg border p-0' }),
  'dialog.header':  () => ({ class: 'border-b px-6 py-4 flex items-center gap-4' }),
};

// 3. Per-instance preset swap
<Dialog.Content preset="my.dialog.content" />
```

Cascade order is `fallback → preset → variants → restProps/class`. Preset entries are **functions of the bond** (`(bond) => record`), so styles can be state-reactive (e.g. `datagrid.row` reads `bond.state.isSelected`) — bits-ui/shadcn can't express "style this slot based on component state" without writing JS in the vendored file.

**Strength to borrow despite this:** shadcn's customization is _immediately visible/greppable_ in your repo. svelte-atoms's preset keys are powerful but **discoverability is weaker** — a consumer must know `PresetModuleMap` exists. → Ship **typed autocomplete for slot keys** (already typed via `Partial<Preset>`) + a **generated catalog page listing every slot key** so the preset surface is as discoverable as an editable file.

## Action candidates (ranked, with effort)

1. **Enable Home/End** for select/combobox — _trivial config flip_. ⭐ do first
2. **Body scroll-lock capability** — _medium_, closes the most visible gap. ⭐
3. **Typeahead model** for select listbox — _medium_. ⭐
4. **Slot-key catalog/docs page** for preset discoverability — _low/medium_.
5. **Harden focus trap with sentinels** — _medium_, long-tail robustness.

## Open threads for next iterations

- [ ] Forms & validation story (svelte-atoms `form/` vs shadcn formsnap/superforms).
- [ ] Documentation site & examples breadth/quality.
- [ ] Realistic bundle-size slice (single Button import → tree-shake reality).
- [ ] Theming: dark mode + multi-theme switching ergonomics.
- [ ] Component coverage gaps (does shadcn have components svelte-atoms lacks, or vice versa?).
