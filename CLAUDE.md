# CLAUDE.md

## Running dev servers / watch tasks

NEVER run long-lived processes in the foreground. `storybook dev` (`bun run storybook:dev`),
`vite dev`, and any `--watch` task run forever and will hang the turn until the Bash tool
times out (the "stuck at the end" symptom).

Always launch them detached:

- Prefer the Bash tool's `run_in_background: true`.
- Or `nohup <cmd> >/tmp/<name>.log 2>&1 &` and return immediately.

After launching, poll the log / port instead of blocking on the process. Kill any dev server
you started once you're done verifying.

---

## Best practices for this library

This is a Svelte 5 component library built on an **atom / bond / preset** architecture.
`CONTEXT.md` is the vocabulary glossary; `docs/adr/` records the binding decisions. This
section is the working "what to do / what not to do." When in doubt, copy the nearest
existing sibling component — consistency across the ~50 components matters more than local
cleverness.

### Component anatomy

Every multi-part component is a folder under `src/lib/components/<name>/` with a fixed layout:

- `bond.svelte.ts` — the `Bond` subclass (via `defineBond`), the `BondState` subclass, and
  the `BondAtom` classes (one per slot). This is the brain.
- `<name>-root.svelte` — the root component: constructs the bond and `share()`s it to context.
- `<name>-<part>.svelte` — one presentational component per slot (header, body, trigger, …).
- `types.ts`, `atoms.ts`, `index.ts`, optional `motion.svelte.ts` / `attachments.svelte.ts`.
- `<name>.stories.svelte` — Storybook stories.

**DO** mirror this layout when adding a component. **DON'T** invent a new file split.

### Presets: resolve in `<script>`, never inline in the template

Props for an atom/element are folded into a single `$derived` object in the script, then
spread. The two SSOT helpers live in `src/lib/components/atom/utils/props.ts`:

- **Bonded part** → `mergeAtomProps(atom, preset, restProps)` →
  `{ preset: preset ?? atom?.preset, ...atom?.spread, ...restProps }`.
  See `collapsible-header.svelte`.
- **Static/presentational part** (no bond atom) → `mergePresetProps(preset, 'fallbackKey', restProps)` →
  `{ preset: preset ?? 'fallbackKey', ...restProps }`. See `button.svelte`.

```svelte
const buttonProps = $derived(mergePresetProps(preset, 'button', { ...restProps, type }));
```

**DO** compute the merged props object in a `$derived` and spread it (`{...buttonProps}`).
**DON'T** compute `preset ?? …` inline in the markup, and **DON'T** hand-roll the
`{ preset, ...spread, ...rest }` spread — use the helper so the layering order (atom spread
base → restProps override → preset fallback) stays uniform.

### The `$preset` class sentinel

In the `class={[...]}` array on `<HtmlAtom>`, the literal string `'$preset'` is a sentinel
that the presentation kernel replaces with the resolved preset classes. Order is
`['base classes', '$preset', klass]` — base first, preset in the middle, the consumer's
`class` prop (`klass`) last so it wins. Keep that order.

### Bond / BondState split (ADR 0001, 0002)

- **State lives in `BondState`; mutations go through methods** — `open()`, `close()`,
  `toggle()`, `select()`. Atoms and components call `bond.state.toggle()`, they never write
  props directly.
- **Read state through predicates**: `is*`/`has*`/`can*` for booleans (`isOpen`, `isDisabled`),
  plain nouns otherwise (`value`, `count`). A getter must never shadow a verb (`isOpen`, not
  `get open()` — it would collide with the `open()` method).
- Props are **shared reactive cells** wired to the component's `$bindable` (ADR 0002) — not a
  value bag and not a mirror. Don't snapshot them into local copies.
- Cross-cutting effects (focus, animation, escape handling) are **state-reactive capabilities**,
  not imperative Bond methods. See below.

### Atoms

- Get a slot atom with `bond.atom('header')` — the queue **caches** the instance. **DON'T**
  `new FooAtom(...)` directly in a component.
- Override `get attrs()` / `get handlers()` on the `BondAtom` subclass and **always spread
  `...super.attrs`** first (see `CollapsibleHeaderAtom`). ARIA wiring that crosses slots
  (`aria-expanded`/`aria-controls`/`aria-labelledby`) comes from the trigger↔content
  _relationship capability_, not hand-written per atom.
- **NEVER** call `createAttachmentKey()` inside the `BondAtom.spread` getter or any `$derived`.
  Mint the key **once per atom** — minting it on every reactive read remounts the element and
  re-fires `onmount`/`ondestroy`. (`spread-attachment-key-invariant` is a real bug class here.)

### Capabilities, not per-root effects

Cross-cutting behavior (focus restore, escape-stack, disclosure, choreography) is composed onto
the state via the **capability seam**: `this.capability(triggerContentLink(...))` in the
`BondState` constructor (see `CollapsibleState`), and activated whole-bond via
`useCapabilities(bond)` + `setup()`.

**DO** add behavior as a capability and activate it once through `setup()`. **DON'T** sprinkle
per-root `$effect`s in `*-root.svelte` for focus/escape/animation — that pattern was
deliberately removed. Reuse `DisclosureState` (in `shared/capabilities/`) for open/close
components rather than re-implementing `isOpen/open/close/toggle`.

### Svelte 5 runes traps (these have bitten us)

- **Lazy collection inside a `$derived`** poisons tracking. If a class lazily creates a
  `collection()` on first access, eagerly touch it in the constructor (`void this.rows`) so the
  dependency is established outside the derived. (`collection-getter-in-derived-trap`)
- **Never spread a rest-props proxy inside a `$derived`** — it collapses fine-grained
  reactivity. The rest object is a pass-through or a stable filtering Proxy, not a copy.
  (`lifecycle-fast-path`)
- **`HtmlAtom` is the single lifecycle handler.** Two symbol-keyed phases via `createLifecycleKey`:
  `mount` via `$effect.pre` (reactive, re-runs on bond change) and `destroy` via `$effect` teardown.
  Don't add competing lifecycle `$effect`s in part components.
- **Init is the `oninit` prop, not a symbol phase.** The symbol-keyed `init` phase was dropped —
  symbol props can't survive SSR (Svelte's server `rest_props` copies `Object.keys()` only, so
  symbols are dropped). `HtmlAtom`'s string-keyed **`oninit`** prop is the sole init hook: it
  survives server `rest_props` and fires synchronously before mount on the server AND again on the
  client during hydration. Keep it idempotent; returned cleanup runs on client teardown only. For
  plain once-per-bond SSR logic the `BondState` constructor is still the natural seam.

### defineBond & context keys

- New bonds use `defineBond({ name, base, atoms })` with the atom map declaring `role: 'trigger'`
  / `'content'` where a relationship applies (see `CollapsibleBond`). Type aliases:
  `BondOf<typeof X>`, `ViewOf<State>`, `StateOf<C>` — use these instead of `InstanceType<...>`.
- A subclass only declares `static CONTEXT_KEY = bondContextKey('<name>')`; it never re-implements
  `share()`/`get()`/`set()`. Keys are canonical (`@svelte-atoms/context/<name>`) — don't
  hand-write the string. Overlay-family bonds (menu, dropdown-menu, select, combobox)
  intentionally share `PopoverBond`'s context slot.

### Filtering / derived views

Use the `createFilter` rune (`src/lib/runes/filter.svelte.ts`) plus a keyed `{#each}` with
Svelte transitions. **Derive the view; never mutate the source array.**

### Stories

House style (see `story-interactivity-convention`): a live readout `<code>` line, an inline
why-comment, design tokens, `{#key}` for round-trip demos. **Never `console.log`** in a story.
If Storybook throws "component annotation is missing from the default export" after you add a
`<Story>`, the build is fine — it's a stale dev server; restart with cache cleared.

### Don't churn known-dead code

Some code is intentionally vestigial or pending removal — leave it unless the task is
specifically to migrate it: the `virtual/` component (unfinished, may be dropped), alert/card
prop-builder `this.elements.X = node` write-only captures, and a handful of element-less roots'
vestigial `rest`. Flag real bugs you find out of scope rather than fixing them mid-pass.
