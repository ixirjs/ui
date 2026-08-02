# AGENTS.md

Canonical agent instructions for `@ixirjs/ui`. Tool-specific instruction files symlink here
(`CLAUDE.md`, `.github/copilot-instructions.md`) — never duplicate guidance into them.

A Svelte 5 + TypeScript component library built on an **atom / bond / preset** architecture.

## Orientation

| Read this                    | For                                                            |
| ---------------------------- | -------------------------------------------------------------- |
| `CONTEXT.md`                 | Vocabulary: Bond, Atom, capability, preset, portal, testing.   |
| `INDEX.md`                   | Repository map — where anything lives.                         |
| `docs/adr/0008-*.md`         | Public contract, package layers, authoring seams.              |
| `src/lib/shared/*/README.md` | Runtime binding decisions for bond / capability / authoring.   |
| `.github/svelte.txt`         | Svelte 5 + SvelteKit reference. Use it when generating Svelte. |

Copy the canonical exemplar rather than inventing a shape: **Button** for static modules,
**Collapsible** for bonded modules. Older siblings may intentionally retain compatibility APIs.

Better than copying, for a **new** family: `bun run scaffold <name> --slots root,header:trigger,body`
emits that shape directly — barrel, atom namespace, per-slot prop types and extension interfaces,
one component per slot, the `defineBond` map — and registers the family's preset keys in
`src/lib/preset/manifest.ts` (without which the generated code does not compile). Add `--static` for
the Button shape, `--dry` to print instead of write. What it cannot write is the 30% worth writing:
capabilities, ARIA and keyboard logic, Bond methods, markup. Those are marked `TODO`.

## Commands

```
bun run check         # svelte-check — the fast correctness gate
bun run lint          # prettier --check + eslint
bun run format        # prettier --write
bun run test:unit     # vitest (append -- --run for one shot)
bun run test:e2e      # playwright
```

**Never run long-lived processes in the foreground** (`vite dev`, `storybook dev`, any
`--watch`) — they hang the turn. Launch detached (Bash `run_in_background: true`, or
`nohup <cmd> >/tmp/<name>.log 2>&1 &`), poll the log/port, then kill the process.

## Conventions

- Files, components, directories: kebab-case. Variables/functions: camelCase.
- Commit messages: short, present tense, no filenames.
- **Conditionals dispatch a snippet; they do not open an `{#if}` block.**

  ```
  {@render (children ?? fallback)(arg)}       consumer-or-default
  {@render (cond ? branchA : branchB)()}      two outcomes
  {@render (cond ? branch : undefined)?.()}   optional — compiles to `?? noop`
  ```

  An `{#if}` block emits two hydration anchors (live comment nodes at runtime), a render tag
  emits one, and a snippet branch is `EFFECT_TRANSPARENT` so consumer content keeps reacting to
  an outer block's enter/exit — an `{#if}` branch is transparent only as an `{:else if}`.
  `{#if children}{@render children()}{/if}` is just `{@render children?.()}`. Rationale and the
  measured per-construct cost table: `docs/research/hydration-anchor-diet-2026-08.md`.

  Four things that bite when writing them: TypeScript narrowing does **not** cross into a snippet
  body (assert, and name the dispatch that proves it); a snippet written among a component's
  children is passed to it as a **prop**, not defined locally; `{@const}` does not survive its
  block (hoist to `$derived`); a snippet used inside `{#each}` takes the item as a parameter.

- **Snippets are declared at the bottom of the template**, after the markup and before any
  `<style>`, ordered by first use (a snippet only another snippet dispatches follows its
  referrer). Snippets that are component props stay where they are passed — they are arguments,
  not declarations.

---

## Component anatomy

A multi-part component is a folder `src/lib/components/<name>/`:

- `bond.svelte.ts` — the `Bond` subclass (via `defineBond`) plus each slot's `Atom`. The brain.
- `<name>-root.svelte` — binds props, shares the Bond, creates the root Atom.
- `<name>-<part>.svelte` — one presentational component per slot; descendants use `usePart(...)`.
- `types.ts`, `atoms.ts`, `index.ts`, `stories/<name>.stories.svelte`, optional
  `motion.svelte.ts` / `attachments.svelte.ts`.
- Colocated `*.svelte.spec.ts` for Bond behavior.

Static modules (Button) use the smaller layout: component + `types.ts` + `index.ts`. Mirror the
appropriate layout; don't invent a new file split.

## Bond state surface

- **State lives on the Bond** — shared props, derived values, mutation methods, collections,
  capability lookup.
- **Mutate through methods** (`open()`, `toggle()`, `select()`). Atoms and components call these;
  they never write props directly outside the Bond's own wiring.
- **Read through predicates**: `is*`/`has*`/`can*` for booleans, plain nouns otherwise (`value`,
  `count`). A getter must never shadow a verb — `isOpen`, not `get open()`.
- **Props are shared reactive cells** wired to `$bindable`. Not a value bag, not a mirror — don't
  snapshot them.

## Atoms

- Rendered parts create their atom via `createAtomInstance(...)` — it owns teardown and
  `bond.register(node)`.
- Override `get attrs()` / `get handlers()` on the `Atom` subclass, **always spreading
  `...super.attrs` first** (see `CardRootAtom`). Cross-slot ARIA (`aria-expanded`,
  `aria-controls`, `aria-labelledby`) comes from relationship capabilities, never hand-written
  per atom.
- **NEVER** call `createAttachmentKey()` inside `Atom.spread` or any `$derived` — mint the key
  once per atom. Minting on every read remounts the element and re-fires `onmount`/`ondestroy`.

## Capabilities, not per-root effects

Compose cross-cutting behavior (focus restore, escape stack, disclosure) onto the Bond with
`this.capability(...)` in the constructor — see `CollapsibleBondBase`. Every root that owns a Bond
uses `useRoot(...)`, which owns props assembly, capability activation and teardown, context
publication, controlled-prop adoption, and the root Atom. A root that renders no element of its own
(`Select.Root`, `Popover.Root`, `Form.Root`) passes `atom: false` and gets back the Bond, its props
and the binding — one seam, one option, rather than two functions split by a prose rule.
`bindBond(...)` remains the underlying primitive, exported from `@ixirjs/ui/experimental`; `useRoot` delegates to it.
Open/close components use `createDisclosure(...)` + `disclosureCapability(...)`.

Never sprinkle per-root `$effect`s in `*-root.svelte` for focus, escape, or animation — that
pattern was deliberately removed.

## Bond identity

Every root seeds its Bond from `$props.id()` — declare `const ID = $props.id();` above the props
destructure and pass `{ id: () => ID }` in `useRoot`'s options (see
`collapsible-root.svelte`). That seed is SSR-deterministic and survives hydration; a random id would
make server output irreproducible. It is **not** a DOM id: Atoms derive element ids from it via
`getElementId` (`collapsible-header-<seed>`), so the binding defines it non-enumerable and it never
reaches the element through the props spread. A consumer's own `id` prop still flows through restProps
and wins on the element it was passed to. Outside a component (tests, programmatic construction)
`generateId()` fills in — never render its output as a bare id.

`root-identity-audit.spec.ts` enforces this mechanically over every `*-root.svelte`. It keys off the
binding seam, so an unlisted seam would drop every root using it out of the audit while the suite
kept reporting green. The list is therefore checked against the authoring barrel's own exports: add
an export there and the spec fails until the new symbol is classified as a binding seam or not.

## defineBond & context keys

- New bonds use `defineBond({ name, base, atoms })`, declaring `role: 'trigger'` / `'content'`
  where a relationship applies (see `CollapsibleBond`). Type alias: `BondOf<typeof X>`.
- `defineBond(...)` generates the context key; `extends:` inherits the parent's. A raw Bond class
  declares `static CONTEXT_KEY = bondContextKey('<name>')` but never re-implements
  `share()`/`get()`/`set()`. Keys are canonical (`@ixirjs/context/<name>`) — don't hand-write the
  string.

## Consumer prop typing — the library ships the seam, not the union

Preset-driven props (`variant`, `size`, …) are **never declared in the library**. A preset is
swappable, so only the application knows which values its own preset defines; a union here would
wrongly reject them. Consumers declare them by declaration merging, via one of two routes:

- **Interface-shaped props** (`ButtonProps`, `CardRootProps`) — augment the props interface itself.
- **Type-alias props** (`TreeRootProps`, `FormRootProps`, every `ContextMenu*Props`) — a type alias
  cannot be merged, so the family exports an empty `<Family><Slot>ExtendProps` interface and
  intersects it into the alias. Augment that.

When adding a family, give every type-alias prop type a seam; interface-shaped ones need none and
should not get a redundant second route. `scaffold` emits the seams for new families, and
`props-augmentation.type-test.ts` proves both routes still reach the component and still reject an
out-of-union value. Note aliases that merely re-point at another family's interface
(`CardContentProps = CardBodyProps`) inherit that interface's augmentability and need no seam.

## Presets: resolve in `<script>`, never inline

Fold props into one `$derived` in the script, then spread it. Helpers live in
`src/lib/shared/bond/presentation-props.ts` (re-exported from `$ixirjs/ui/components/atom`):

- **Bonded descendant** → `usePart(Bond, slot, () => restProps, { preset: () => preset })`, then
  render it with `usePartElement`. `usePart` already owns the Atom, the Bond, the slot name, the
  preset key, and the per-slot layer, so handing it to the seam carries all five and the slot string
  exists in exactly one place. See `card-title.svelte`:

```svelte
const part = usePart(CardBond, 'title', () => restProps, { preset: () => preset });
const el = usePartElement(part, () => ({
	as,
	class: ['card-title …', '$preset', klass],
	...restProps
}));
```

```svelte
{@render partElement(el, children)}
```

Never re-derive the slot: `presetLayer={bond.presetLayer('title')}` duplicates a string `usePart`
already holds and silently degrades to no layer when one copy is renamed.

- **Root** → `useRoot(Bond, propsSpec, { id: () => ID, preset: () => preset, factory })`, then pass
  the result through the same seam. It resolves the root Atom's constructor, registration key and
  role from `defineBond`'s `atoms.root`, so none of the three is restated in the component. See
  `card-root.svelte`:

```svelte
const root = useRoot(CardBond, { disabled: [() => disabled, (v) => (disabled = v ?? false)] }, {
	id: () => ID,
	preset: () => preset,
	factory
});
const el = usePartElement(root, () => ({
	class: ['card …', '$preset', klass],
	...root.props,
	...restProps
}));
```

Spread `root.props` before `restProps` when the Bond's props select preset variants. Pass
`presetLayer: true` only if that family already resolved `presets.root` for itself — six do, the
rest ignore it, and the default preserves each one's rendered output.

A controlled `$bindable` prop is declared with `controlledProp(...)` and placed **directly** in the
props spec — `open: openProp`, not `open: openCell.cell`. It carries its own owner adoption and
`useRoot` discharges it after the Bond is shared and before the root Atom is created, so no root
writes a `connect` for one. The exception is a spec entry that _composes_ a controlled prop rather
than being it (`popover-root.svelte` gates `open` on an owning overlay): the composed tuple is no
longer the `ControlledProp`, so that root declares `connect` explicitly and says why. `connect`
itself remains for any other late wiring — `calendar-root.svelte` binds a callback state with it.

A root that owns a Bond but **no** root Atom (`Select.Root`, `Form.Root`, `Popover.Root`, …) passes
`atom: false` to the same `useRoot`.

### `usePartElement` — the element seam

`usePartElement(partOrRoot, () => props)` + `{@render partElement(el, body)}` renders the element
**without** an `HtmlAtom` component boundary. That second boundary — renderer traversal,
`spread_props`, a context scope, ondestroy collection — was ~a quarter of SSR cost and bought
nothing on the common path; removing it took Card from 45 µs to 29 µs per card. It lives in
`src/lib/components/atom/use-part-element.svelte.ts` and is a library authoring internal, never
exported from the barrel.

**The config thunk returns an `HtmlAtom` props object.** Named props (`class`, `as`, `base`,
`defaults`, `variants`, `motion`, `oninit`, `preset`, `presetLayer`, `bond`, `atom`, `part`) are
interpreted; everything else is an element attribute. Precedence is therefore plain object-literal
order — write the keys in the order the markup had them and the output is unchanged. Do not
reintroduce per-axis thunks; one object is the contract.

`native()` decides per render. Anything `HtmlAtom` treats specially — `base`, `oninit`, consumer or
preset motion, symbol lifecycle callbacks, a Root-installed renderer, lifecycle attrs — routes the
part to the real `<HtmlAtom>` with the same object, so **`HtmlAtom` remains the single lifecycle
handler**. A part that always trips that check should just keep using `<HtmlAtom>` directly; the
seam would only add indirection. Every bonded part that can take the seam already does, so the
remaining direct users are exactly the ones with a reason visible in the file: a declared `base`
(`alert-icon`, `field-control`), motion (`collapsible-indicator`, `accordion-item-indicator`,
`accordion-item-body`, `drawer-content`, `select-selection`), an inline `{@attach}`
(`scrollable-container`), or no Atom to hand the seam (`form-root`). Adding a tenth means naming
which of those it is. Static components with no Bond (Button, Badge, Icon, …) are not in this set —
they have no part and `<HtmlAtom>` is their normal shape. Motion supplied as an attachment stays on the fast path: mint the key
once at init (`createAttachmentKey()`) and put it in the returned object.

The individual `atom`/`bond`/`preset`/`presetLayer` props remain accepted as an escape hatch, and
explicit props win over `part`. A root that hands its props to **another component** rather than to
`HtmlAtom` (`Dialog.Root` → `PortalSurface`) still builds the packet with
`mergeAtomProps(root.atom, preset, { ...root.props, ...restProps }, root.presetLayer)`.

`part` is also the CSS shadow-parts HTML attribute. `HtmlAtom` discriminates by type — an object is
the seam, a string is the attribute and is forwarded to the element unchanged — so `part="card"`
still works on any atom. Note this means `Omit<…, 'part'>` does **not** work on element props:
`ElementProps extends Record<string, unknown>`, so `keyof` is `string | number` and `Omit` collapses
every named prop to the index signature. `html-atom.svelte` uses a homomorphic mapped type with an
`as` clause instead. Removing that index signature is roadmap item 1.7.

`{...part.props}` is the shape for handing a part's props to **another component** — `Input.Control`,
`PortalHost`, `Stack.Root` — which has no renderer seam to pass the part through. Rendering an
element uses `usePartElement`, and a part still on `<HtmlAtom>` passes `{part}`; the packet
allocates a merged object and a signal that both seams avoid.

Do not re-invoke a merged handler by hand. The seam composes the consumer's handler and the atom's
(consumer first, atom skipped when default is prevented), so a part that stages state before the
atom acts just declares its handler and returns — calling `part.props.onclick` as well fires the
atom twice. See `dialog-close.svelte`.

- **Static part** (no Atom) → `mergePresetProps(preset, 'fallbackKey', restProps)`. See
  `button.svelte`:

```svelte
const buttonProps = $derived(mergePresetProps(preset, 'button', restProps));
```

Keep the rest-props proxy intact. Pass semantic props (e.g. `type`) separately after the spread
when they must beat the preset. Never inline `preset ?? …` in markup or hand-roll the merge.

**The `$preset` sentinel:** on `<HtmlAtom>`, `'$preset'` inside `class={[...]}` is replaced by the
kernel with resolved preset classes. Order is `['base', '$preset', klass]` — base first, the
consumer's `class` last so it wins.

## Svelte 5 runes traps (these have bitten us)

- **A lazy collection inside a `$derived` poisons tracking.** If a class lazily creates a
  `collection()`, touch it eagerly in the constructor (`void this.rows`) so the dependency is
  established outside the derived.
- **Never spread a rest-props proxy into a new object inside `$derived`.** For `usePart(...)` pass
  `() => restProps` so the helper reads it within its own tracked boundary.
- **`HtmlAtom` is the single lifecycle handler** — `mount` via `$effect.pre` (re-runs on bond
  change), `destroy` via `$effect` teardown. Don't add competing lifecycle `$effect`s in parts.
- **Init is the `oninit` prop**, not a symbol — symbols don't survive server `rest_props`. It fires
  synchronously pre-mount on the server and again on client hydration, so keep it idempotent; the
  returned cleanup runs on client teardown only. Once-per-bond SSR logic belongs in the `Bond`
  constructor.

## Tests and stories

- **Hard rule:** any `.svelte` used only by tests lives under `src/lib/test/<domain>/`, named
  `*.test.svelte`, imported via `$ixirjs/ui/test/...`. Never colocate test-only Svelte in
  `src/lib/components/**` or `src/lib/shared/**`; never move product, docs, demo, or Storybook
  `.svelte` files into `src/lib/test/`.
- Story house style: a live readout `<code>` line, an inline why-comment, design tokens, `{#key}`
  for round-trip demos. **Never `console.log`** in a story. "component annotation is missing from
  the default export" after adding a `<Story>` means a stale dev server — restart with the cache
  cleared.

## Don't churn known-dead code

Some code is intentionally vestigial or pending removal (e.g. `src/lib/components/virtual/`,
element-less roots' vestigial `rest`). Confirm before deleting anything that merely looks dead, and
flag out-of-scope bugs rather than fixing them mid-pass.
