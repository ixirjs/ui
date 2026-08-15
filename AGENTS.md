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
- **Import internals through `$ixirjs/ui/…`, never `@ixirjs/ui/…`.** The `$` alias resolves to
  `src/lib`; the package specifier resolves to `src/lib/public` — the hand-curated published
  surface, a strict subset. Four families had drifted onto it and were authoring themselves through
  their own public barrel. `no-restricted-imports` now enforces this under `components/`, `shared/`
  and `preset/`; `src/lib/test/**` is exempt, since exercising the published surface is its job.
- **An element generic is constrained on `HtmlElementTagName`** (exported from
  `$ixirjs/ui/components/atom`), not on a re-spelled `keyof HTMLElementTagNameMap`. Same type; one
  place to widen it if `ElementTagName` ever has to cover SVG too, which is why the alias exists.
- **A long list windows through `createVirtual`, never a hand-rolled one.** The rune
  (`src/lib/runes/virtual.svelte.ts`, exported from `@ixirjs/ui`) owns the scrolling, measuring and
  positioning and returns three spreads — `viewport(style?)`, `content(style?)`, `item(item, style?)`
  — while the markup stays yours. Each takes your own style as an argument rather than as a separate
  attribute: a `style` attribute cannot be combined with a spread in either order, so passing it
  merges instead of choosing. Virtualization is opt-in at the call site — there is no windowed
  component to reach for, by design: a capability needs a Bond, a Bond needs a root, and the root
  then owns the markup a caller wanted to write. Rationale and the rejected designs:
  `docs/research/virtualization-decision-2026-07.md`.
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
- `<name>-<part>.svelte` — one presentational component per slot; descendants use `definePart(...)`,
  or a module-scoped `Kernel.part(...)` plus instance-scoped `Kernel.node(...)` when the part has
  logic of its own.
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
- **A presentation-free slot declares no `atom`** — `title: { role: 'label' }`, `header: {}` — and
  `defineBond` synthesizes `defineAtom({ key: slot, namespace: name })` for it, once per definition.
  That is what a family's own `const slot = (key) => defineAtom({ key, namespace })` helper was
  producing, with the slot name written three times (const, `defineAtom` key, map key) for one fact.
  Declare `atom:` when the part carries attrs, handlers, or its own element type (`HTMLElement`).
- `defineBond(...)` generates the context key; `parts:` also answers to each part's key. A raw Bond class
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

- **Bonded descendant that only names itself** → `definePart`, which is the two calls below
  collapsed. Thirty-six parts were the same thirty-four lines with a class string swapped — five
  imports, and a destructure that pulled `class`/`preset`/`as`/`children` out only to hand all four
  straight back. Five facts carried twenty-nine lines of ceremony each. See `card-title.svelte`:

```svelte
const props: CardTitleProps<E, B> & BasePropsOf<B> = $props();
const el = definePart(CardBond, 'title', () => props, {
	as: 'h3',
	class: 'card-title …',
	context: 'optional'
});
```

```svelte
{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	props.children,
	undefined,
	el.motion(),
	el
)}
```

`el.bond` carries the Bond for a part whose children take a snippet argument; pass the argument in
`Kernel.render`'s fifth slot. The destructure is what goes, not the props: `Kernel.element` already
splits rich render props from element attributes, so handing it the whole props object yields the
same attrs `...restProps` did. Props arrive as a
thunk for the usual reason: read inside the helper's tracked boundary, never captured at init.
A part with logic of its own — a `$derived`, a handler, a `{#snippet}`, motion, a `$bindable` —
keeps the two calls below; `definePart` covers only the ones with none.

- **Bonded descendant, everything else** → compile `Kernel.part` once in module scope, bind the
  instance with `Kernel.node`, then render it with `Kernel.element`. The node owns the lazy semantic
  Atom, Bond, slot, preset and per-slot layer. Pass `rest: () => restProps` to `Kernel.node` **only**
  for a part that reads the merged `part.props` packet. See `dialog-close.svelte`:

```svelte
<script module lang="ts">
	const PART = Kernel.part(DialogBond, 'closeButton', { class: '' });
</script>

<script lang="ts">
	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
	const el = Kernel.element(part, () => ({
		as,
		class: ['dialog-close …', '$preset', klass],
		...restProps
	}));
</script>
```

Render with the same direct `Kernel.render(el)(...)` call shown above.

Never re-derive the slot: `presetLayer={bond.presetLayer('title')}` duplicates the slot already held
by the Kernel plan and silently degrades to no layer when one copy is renamed.

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
const el = Kernel.element(root, () => ({
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

A root re-exports the Bond accessor `useRoot` already returns — `export const getBond = root.getBond;`,
not `() => bond`. It is a plain arrow over the shared Bond with no `this`, so assigning it out is
safe, and `const bond = root.bond` then stays only where the snippet argument needs it.

### `Kernel` — the element seam

`Kernel` is the sole internal rendering interface. `Kernel.part`/`root` compile immutable metadata,
`Kernel.node` binds a first-party Bond part, `Kernel.element` resolves the complete presentation
contract, and `Kernel.render(handle)` returns the exact snippet the caller dispatches once. Keep
literal first-party leaves in Kernel (`div`, `h3`) rather than reopening component-local dispatch.
See `src/lib/components/atom/kernel/README.md`.

**The config thunk returns rich render props.** Named props (`class`, `as`, `base`, `defaults`,
`variants`, `motion`, `oninit`, `preset`, `presetLayer`, `bond`, `atom`, `part`) are interpreted;
everything else is an element attribute. Precedence is ordinary object-literal order.

`Kernel.render` decides per render from `render/render-mode.ts`: literal/dynamic leaf, transition
leaf, `HtmlElement`, or a custom renderer. `oninit` and symbol lifecycle remain Kernel-owned and
must never be forwarded into a rich renderer.

Kernel and `HtmlElement` share the same predicate and transition leaves. Two rules are easy to
undo by accident:

- The dispatch must read **`presentation.base`**, not the destructured `base` prop. A preset can name
  a renderer through `render.base`, and the raw prop is `undefined` for it — such an atom then renders
  as a plain `div` carrying the preset's classes, which looks entirely correct.
  `custom-renderer.svelte.spec.ts` covers it.
- The rune gate must read **raw props**, never `presentation.motion`, or the presentation resolves
  eagerly for every atom. `resolve-count.svelte.spec.ts` will not catch that — it counts recomputes,
  and an init-time read of a `$derived` neither adds a count nor establishes a dependency.

`html-element.svelte` keeps its own `bareDiv`/`bareElement`: the shared bare pair deliberately ignores
motion and attaches nothing, where a bare `HtmlElement` still needs `attach` to drive `animate`,
`onmount` and `ondestroy`. Sharing that pair needs two more leaves nothing can reach yet.

**The migration is finished.** Every first-party component that renders an element authors directly
through Kernel — bonded parts through `Kernel.element(part, ...)`, static leaves (Button, Badge,
Icon, …) through `Kernel.element(Kernel.static, ...)`, and the form controls.

- **Inline `{@attach}`** — mint the key once at init (`createAttachmentKey()`) and put it in the
  returned object. Once, not per config evaluation: a fresh key each time tears the attachment down
  and rebuilds it on every invalidation. `container`, `scrollable-container`, `teleport`,
  `portal-surface`, `qr-code` all do this.
- **No Atom to hand the seam** — pass the seam literally,
  `{ atom: undefined, bond, preset: undefined, presetLayer: undefined }` (`form-root`,
  `stepper-content`), or `Kernel.static` when there is no bond either.
- **`animate` without a transition** — the `element` branch renders `HtmlElement` directly, so this
  no longer costs two boundaries (`drawer-content`, `popover-content`).
- **A conditionally-rendered element** — create it with `Kernel.element` in `<script>` and render it
  from the snippet. Kernel owns effects and must be initialized during component init; a snippet body
  is not init. `checkbox`, `radio`, `date-picker-months`, `date-picker-years` are this shape.

A **declared `base`** still escalates, and going through the seam to escalate costs one extra
hydration anchor (the dispatch `{@render}`). That is worth paying when the `base` is a _prop_ the
consumer can leave unset — `field-control`, `select-selection`, `teleport`, `portal-surface` all
reach a leaf when nobody passes one, and `alert-icon` pays the +1 to keep `base={null}` working.
A hardcoded `base`, such as `date-picker-calendar`'s renderer slots, still authors through
`Kernel.element` and reaches Kernel's custom-renderer branch directly. Do not add another
component boundary around it.

### Don't re-skin a leaf by mounting it

A part that needs another part's presentation **renders the element itself** through the seam; it does
not mount that component and spread into it. `Select.Item` and `DropdownMenu.Item` used to render
`<List.Item {...itemAttrs}>`, which cost two things per item: a second component boundary, and a
`spread_props` proxy. Measured on the `menu` bench layer, collapsing both took an item from **12.51 to
8.07 µs (−35%)**, **73 to 51 scavenges (−30%)**, **445 to 422 bytes** and **12 to 9 hydration
anchors** — the three anchors being the component invocation, the implicit `children` snippet handed
to it, and the inner `{@render children?.(arg)}`. `docs/research/nesting-component-vs-snippet-2026-08.md`
has the per-construct model; the short version is that `{...spread}` into a component costs +165% on
SSR and +451% on a targeted client update against explicit props.

The shared presentation moves into a helper both sides call — `components/list/item-class.ts` exports
`LIST_ITEM_AS` and `listItemClass(own, klass)` — so the class string still exists once. Two rules when
doing this:

- **Keep the same seam the inner part used.** `List.Item` uses `Kernel.static`, so the bond was
  never visible to preset resolution; a function-form preset entry is invoked as `entry({ bond })`, and
  handing it a bond it never used to see changes what it resolves.
- **Keep the preset expression verbatim.** `mergeAtomProps` always supplies a truthy `preset`, so
  `List.Item`'s own `'list.item'` fallback was already dead for these parts — and waking it up is a
  silent restyle, `list.item` being `px-4 py-3` against `select.item`'s `px-2 py-1.5`.

This applies only where the inner component is a `Kernel.element` leaf with no Bond, context read,
`$props.id()` or exported function. It does **not** apply to the prop-defaulting wrappers
(`Tooltip.Content` → popover `Content`, `Tabs.Body` → `Stack.Root`, `Combobox.Control` →
`Input.Control`, …): those inner components own real state, several take `bind:` props that cannot
cross a snippet seam, and they are one-per-overlay rather than one-per-item. `menu-ssr.spec.ts` and
the `menu item` case in `anchor-budget.spec.ts` are the gates.

The individual `atom`/`bond`/`preset`/`presetLayer` props remain accepted as an escape hatch, and
explicit props win over the seam. A root that hands its props to **another component**
(`Dialog.Root` → `PortalSurface`) still builds the packet with
`mergeAtomProps(root.atom, preset, { ...root.props, ...restProps }, root.presetLayer)`.

`part` is also the CSS shadow-parts HTML attribute. Kernel treats a string as the HTML attribute and
forwards it unchanged. Note that `Omit<…, 'part'>` does **not** work on element props:
`ElementProps extends Record<string, unknown>`, so `keyof` is `string | number` and `Omit` collapses
every named prop to the index signature. Removing that index signature is roadmap item 1.7.

`{...part.props}` is the shape for handing a part's props to **another component** — `Input.Control`,
`PortalHost`, `Stack.Root` — which has no renderer seam to pass the part through. Rendering an
element uses `Kernel.element`. The packet allocates a merged object and a signal that Kernel's
direct seam avoids.

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

**The `$preset` sentinel:** in a Kernel element config, `'$preset'` inside `class={[...]}` is
replaced with resolved preset classes. Order is `['base', '$preset', klass]` — base first, the
consumer's `class` last so it wins.

## Svelte 5 runes traps (these have bitten us)

- **A lazy collection inside a `$derived` poisons tracking.** If a class lazily creates a
  `collection()`, touch it eagerly in the constructor (`void this.rows`) so the dependency is
  established outside the derived.
- **Never spread a rest-props proxy into a new object inside `$derived`.** Hand rest props to a
  helper as `() => restProps` (`Kernel.element`'s config thunk, `Kernel.node`'s `rest` option) so it
  reads them within its own tracked boundary.
- **Lifecycle has one owner** — `Kernel.element` runs `mount` via `$effect.pre` (re-runs on bond
  change) and `destroy` via `$effect` teardown. Kernel strips `oninit` and lifecycle symbols before
  rich-renderer escalation; otherwise a renderer could fire
  them twice. `render/lifecycle-seam.svelte.spec.ts` pins this. Don't add competing lifecycle
  `$effect`s in parts.
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

Some code is intentionally vestigial or pending removal (e.g. element-less roots' vestigial
`rest`). Confirm before deleting anything that merely looks dead, and flag out-of-scope bugs
rather than fixing them mid-pass.
