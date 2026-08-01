# Context — @ixirjs/ui

Shared vocabulary for this codebase. Keep entries one-line where possible. New
terms get added here when they're load-bearing; stale terms get removed.

## Architectural vocabulary

See the `codebase-design` skill for the full glossary (module, interface, depth,
seam, adapter, leverage, locality). Use those terms exactly — don't substitute
"component", "service", "boundary".

## Library concepts

**Bond** — a per-component class that owns shared reactive props, derived
values, mutation methods, context, capabilities, and the registry of rendered
Atoms. Implemented in `src/lib/shared/bond/bond.svelte.ts`. A compound component
family has one root Bond; nested families can have child Bonds.

**BondState** — removed. It was a separate state host accepted by Bond constructors and by
`defineBond({ state })`, whose members were forwarded onto the Bond. Shared state, derived values,
mutation methods, collections, and capability lookup now live on `Bond` itself; a family that wants
them on a reusable class puts them on a `Bond` subclass and names it as the definition's `base`.
There is no instance-level `bond.state` facade.

**State-surface naming.** The **verb namespace is reserved for imperative
methods** that mutate — `open()`, `close()`, `toggle()`, `select()`. State is
**read through predicates**: `is*`/`has*`/`can*` for booleans (`isOpen`,
`isDisabled`, `hasValue`), plain nouns otherwise (`value`, `count`). A getter
must **never shadow a verb** — `isOpen`, never `open()` — both because it should
read as a question, not a command, and because `get open()` would literally
collide with the `open()` method. This only forces `is*` when the state's natural
name is verb-shaped; noun state stays plain (`value` coexists with `select()`).
`props.*` keeps raw DOM/contract names (`disabled`, written only by Bond methods,
read only when mapping straight to a DOM attribute); the `is*` getters are the
normalized surface consumers read.

**Bond context plumbing** — a bond family is published to Svelte context via the
inherited `share()` / `static get()` / `static set()` on `Bond` (polymorphic
`this`, keyed off `CONTEXT_KEY`). `defineBond(...)` generates a canonical key
(`@ixirjs/context/<name>`) for an ordinary definition; `extends:` inherits its
parent key. A raw Bond class declares `static CONTEXT_KEY = bondContextKey('<name>')`
but never re-implements the trio. Don't hand-write the string.

**Atom Component** — the Svelte component that renders a part such as Root,
Trigger, Content, Item, Header, or Body.

**Atom** — the runtime object owned by an Atom Component. It owns one DOM element
ref, attrs, handlers, attachment lifecycle, role projection, and atom-local
capabilities. Rendered Svelte parts create Atoms with `createAtomInstance(...)`
and register them with their Bond. Definitions retain atom metadata only; there are no generated detached-Atom constructors. Rendered
parts use `createAtomInstance(...)`/`usePart(...)`, and mounted consumers use registry queries.

**Capability** — a reusable behavior unit installed on a Bond or an Atom. Bond
capabilities own shared state, cross-atom coordination, role projection, and
whole-bond effects. Atom capabilities own one node's local DOM behavior,
presentation, and lifecycle. "Particle" is the docs metaphor; `Capability` is
the API name.

**Identity vocabulary** — five identifiers, each distinct. Don't conflate:

| id            | what it is                          | set by / formula                     | example (accordion item header) |
| ------------- | ----------------------------------- | ------------------------------------ | ------------------------------- |
| `key`/`name`  | atom slot id (`name` returns `key`) | `super(bond, 'header')` arg          | `header`                        |
| `namespace`   | bond's DOM family                   | `super(state, '…')` / override       | `accordion-item`                |
| `kind`        | qualified DOM `data-kind`           | `` `${namespace}-${name}` ``         | `accordion-item-header`         |
| `bond.preset` | dotted preset base path             | defaults to `namespace`; overridable | `accordion.item`                |
| `atom.preset` | atom's theme key                    | root → `bond.preset`, else `.name`   | `accordion.item.header`         |

`namespace` is hyphenated (DOM); `preset` is dotted (theme hierarchy) — they are
deliberately different (see §preset). `kind` is computed; **don't hardcode a
`data-kind` that diverges from it** (the old `accordion-header` override was
removed for this reason).

**Spread** — the merged object an atom exposes for `<div {...atom.spread}>`.
Equals `{ ...attrs, ...handlers, ...attachments }`. The atom's interface is the
spread; that's the test surface.

**Behavior** — the low-level projection shape (`{ attrs?, handlers?, onmount? }`)
that an Atom folds into its `spread`. Most authoring should wrap behavior in a
Bond or Atom capability so it can be named, registered, replaced, and explained.
Merge rules:

- `attrs` merge **after** the atom's own (last wins), like presets.
- `handlers` are **chained** on key collision (atom first, then each behavior) —
  behavior augments rather than clobbers; both run.
- `onmount` joins the Atom's single stable attachment transaction. Own, Bond-projected,
  and Atom-capability hooks mount in dependency order and clean up in reverse order.

**Channel-B reactivity invariant** — Atoms read Bond state **live and tracked**;
the _component_ owns the reactivity boundary by reading `atom.spread` inside a
`$derived`. Concretely:

- `get attrs()` reads `this.bond.*` or `this.bond.props.*` directly. **Never `untrack` a Bond
  read in `attrs`** — it freezes the attribute (the class of bug where
  `aria-disabled` stops updating). The component's `$derived(atom.spread)`
  re-runs because the getter is tracked.
- `get handlers()` returns closures only. Read state **inside the handler body**
  (event-time), never above the `return` (derive-time) — a derive-time read
  captures a stale value into the closure.
- `untrack` is legitimate **only** for one-shot snapshots: bond construction inside
  `bindBond(...)` and mount-time reads in `onmount`. Those must _not_ become reactive
  dependencies.

**Node registry** — Bond's indexed, render-safe Atom registry. `bond.register(node)` updates
plain insertion/part indexes synchronously so sibling queries work during render. In the browser,
one module-level microtask publishes a reactive membership revision for every registry touched in
the turn; SSR needs no reactive publication. Read through `nodeByPart(name)`,
`nodesByPart(name)`, or `nodeByRole(role)`.

The deferred reactive publication is **load-bearing — do not "simplify" it away**:

- atoms register during render, where mutating reactive state directly throws
  `state_unsafe_mutation`;
- plain indexes must update immediately for same-render sibling lookup;
- tracked queries must read the registry revision so later registration/mount changes re-run;
- one batched microtask, rather than one staging-map flush per Bond, owns that publication.

**Stable attachment keys** — every Atom mints attachment symbols once per
instance, not while computing `spread`. Svelte keys attachments by symbol
identity; reminting a symbol on every spread read would rerun mount/cleanup and
break lifecycle locality.

**Share** — the low-level operation that sets a Bond into Svelte context. Roots use `useRoot(...)`,
which constructs, activates, publishes and destroys the Bond (delegating to the experimental `bindBond(...)`, still
the exported primitive, for the construction and lifecycle half). A root that renders no element of
its own passes `atom: false`. Sub-components retrieve via `FooBond.get()` or `usePart(...)`.
See §"Bond context plumbing".

**Preset record** — the closed presentation contract `{ class, attrs, variants,
compounds, defaults, render? }`, authored with `definePreset(...)`. Presets do not own
attachments or lifecycle; that behavior belongs in capabilities.

**`base` / `as` / preset cascade** — props on `HtmlAtom` that govern what
component renders and how variants/presets merge. Order: `defaults → preset →
variants → restProps` (last wins). This precedence is contract; tests in
`src/lib/components/atom/resolvers.spec.ts` and `utils/fold.spec.ts` pin it. The
resolver pipeline lives in `atom/resolvers.ts` (`resolvePreset`, `resolveLocalVariants`,
`resolveVariants`, `foldLayers`, `resolveClass`, `resolveBase`, `resolveAs`).
`presentation.svelte.ts` evaluates it into one tracked snapshot. `HtmlAtom` renders the ordinary
native path directly; only custom renderers, snippets, motion, or renderer lifecycle hooks enter
the richer `HtmlElement` adapter. Current binding notes live in `src/lib/shared/README.md` and child
READMEs.

**Part element seam** — `usePartElement(...)` + the `partElement` snippet render a bonded part's
element without an `HtmlAtom` component boundary, running the same presentation cascade inside the
part's own init. Its config thunk returns an `HtmlAtom` props object, so precedence stays ordinary
object-literal order. Parts needing the rich path (`base`, motion, lifecycle hooks) route back to
`<HtmlAtom>`, which remains the single lifecycle handler. See AGENTS.md → "the element seam".

**`Bond.namespace` vs `Bond.preset`** — two _distinct_ identities, kept
separate on purpose:

- **`namespace`** — DOM identity (`data-bond`, `kind`, element ids).
  Hyphenated for multi-word names (`accordion-item`, `dropdown-menu`). Defaults
  to `name`; compound bonds override it (`combobox`, `select`).
- **`preset`** (on the Bond) — the dotted preset _base path_. Source of truth
  for atom preset keys. Defaults to `namespace` (correct for single-level
  components: `popover.content`, `dropdown-menu.list`, `alert.close` — dots
  separate _hierarchy levels_, hyphens stay _inside_ a level). Genuinely
  **nested child bonds** override it because their preset depth exceeds their
  hyphenated namespace: `accordion-item` (namespace) → `accordion.item`
  (`bond.preset`).

**`Atom.preset`** — the atom's default preset key, from `bond.preset`:
the **root** atom maps to the bare base (`accordion`, `accordion.item`); every
other atom appends its `name` (`accordion.item.header`). (`bond.preset` is the
bond-level base; `atom.preset` is the atom-level full key — same name, two
layers.) A re-exported atom re-namespaces automatically (combobox reusing the
popover tail → `combobox.tail`).

Components consume this as the **default**, caller overrides:
`preset: preset ?? atom.preset`. Don't restate the literal key in the `.svelte`
— the atom owns it. The `preset` prop is typed `PresetKey`, which also accepts
an explicit fallback chain from `fallbackPreset(...)`, resolved first-registered-wins by
`presentationStages.preset`. Collection-item components pass the canonical shared item
preset explicitly rather than calling deprecated generated Atom methods.

## Overlay architecture

**Disclosure** — the WAI-ARIA term for any pattern where a trigger controls the
visibility of a content region. Dialog, Drawer, Popover, Tooltip, Context Menu,
Dropdown Menu, Select, and Combobox all use disclosure behavior.

**OverlayBond** — the shared base for overlay families. It owns the open/close
surface and common overlay props. Concrete overlays add their own capabilities,
part atoms, and positioning or modal behavior.

**Portal** — an in-place containment scope and mount target, not a body-detached escape hatch. A portal owns the DOM place where teleported content paints; host portals keep nested overlays scrolling, clipping, and stacking with their host.

**Port** — the low-level synchronous DOM re-parenting primitive (`port(node, target)`). It moves a node into a target element and returns cleanup; higher-level components own target resolution and diagnostics.

**Teleport** — the current component that ports content into a portal target. Target precedence is explicit `portal` prop → ambient portal from context → root portal (`root.l0`). It renders nothing until a target element exists.

**Portal host / sink** — the host is the in-flow relative wrapper; the sink is the absolute portal element inside it. The sink is also the floating-ui boundary, so positioning and containment use one DOM element.

**Containment scope** — the DOM and stacking context a portal keeps overlays inside. A popover opened inside a dialog should target the dialog's host portal by default, not the document body.

**ZLayer / band** — the current elevation model. Built-in bands are `base`, `positioned`, `modal`, and `ambient`; `ZLayer.value` computes the natural z-index from the band, parent layer, relation, and offset.

**Layer anchor / relation** — a named z reference registered with `ZLayer.anchor(...)`; a relation (`{ below }` or `{ above }`) pins a layer just below or above that anchor. Use it for sticky-under/sticky-over cases instead of magic z constants.

**Portal host capabilities** — reusable overlay policies in
`src/lib/components/portal/host/capabilities` and
`src/lib/components/portal/host/policies`. They cover escape, trigger behavior,
dismissal, focus, focus restore, outside press, backdrop press, layer state, and
modal/positioned surface concerns. Prefer adding or decorating a capability over
copying `$effect` blocks into each overlay root.

**Overlay view helpers** — narrow helpers such as `overlayIsOpen`,
`overlayIsDisabled`, and `closeOverlay` let capabilities read or mutate an
overlay-shaped Bond without casting to one concrete component family.

**Queryable** — narrow interface (`clearQuery(): boolean`) for overlays that
have typeable query input, such as Combobox and Select. Escape and clear policies
depend on this small contract instead of the whole concrete Bond.

## Testing posture

The Bond's interface is the test surface — Bond methods, `atom.spread`,
atom identity, strategy substitution. Don't render DOM to assert ARIA; assert
on the spread object directly.

**Spec convention** — `*.svelte.spec.ts` colocated next to `bond.svelte.ts`.
The Svelte-prefixed suffix lands in Vitest's browser project (Playwright +
Chromium), where `$state` runes work. Pure (no-rune) specs use `*.spec.ts` and
run in the node project.

**Per-bond checklist** — each colocated browser Bond spec covers: (1) Bond method
mutates props; (2) `atom.spread` is reactive; (3) handlers transition state
when invoked; (4) rendered Atom identity/registration is stable; (5) capability
or strategy substitution alters behavior; (6) teardown unregisters; (7) a required
descendant fails outside root context; and (8) relationship projection is asserted through
spread attrs. Collapsible is the canonical example.

**Adapter specs** — each strategy adapter (ClickTrigger, hoverTrigger,
CloseOnEscape, ClearThenClose, TrappedFocus, FocusOnOpen, NoFocus) has a spec
colocated next to its source file (e.g. `strategies/trigger.svelte.spec.ts`),
fully decoupled from any bond.

## Other deep modules

**Collection** — `Bond.collection<T>(kind)` returns a typed `Collection<T>`
with insertion-order reactive `values`, `get/has/indexOf/size`, and
`set(id, bond) → cleanup`.

**A Collection IS a capability.**
`collection(kind)` lazily registers a `collectionCapability<T>(kind)` at slot
`collection:<kind>` in the single `#capabilities` home — there is **no** parallel
`#collections` map. The `Collection` is the capability's `surface`, exactly as
`SelectionModel` is the `selection` capability's surface. This is a _structural_
unification: surface-only by default, so runtime behavior is byte-for-byte the old
children registry. What's new is that a collection is now **addressable** by
`capability('collection:<kind>')`, **overridable** by spec last-wins through the same
machinery as `selection`/`focus`, and can project **positional ARIA**
(`aria-posinset`/`aria-setsize`/`data-index` from `indexOf`) onto
`role('item')`/`role('container')` — opt in per component with
`collectionCapability(kind, { positional: true })`, default off (emits nothing).
Call `collection()` directly on the Bond.

Adopted by every family that holds a children registry: accordion (`item`), datagrid
(`row`/`column`), form (`field`), tabs (`item`), stepper (`step`), dropdown-menu
(`item`). Items register their **real bond** from the child root atom's `onmount` via
`parent.attachItem(id, bond)` (returns the unregister cleanup).

Conventions:

- Insertion order only; sorting is a `$derived` view on the parent.
- Selection / highlight state lives on the parent, not the collection.
- Duplicate-id set throws in dev, replaces in prod.
- Many collections per bond namespace by slot: `collection:item`, `collection:row`, …

**Child→parent seam** — a child Bond or Atom should depend on a **narrow
parent-facing interface**, not the whole parent Bond. The parent Bond exposes
only what children need, such as ids, values, open/close/toggle methods,
collection registration, or a specific capability surface. The child stores that
small interface, which keeps tests simple and avoids reaching through
`parent.parent.parent` chains.

**RovingTabindex** — adapter `rovingTabindex(collection, highlightedIdState)`
returning handlers (Arrow keys, Home/End) + `aria-activedescendant` attrs.
Composes with `Collection<T>`; lives next to overlay strategies. Also reaches
data-driven atom sets cached by data identity (see Calendar) via a thin
`rovingCalendarGrid(bond)` variant that iterates cached day atoms in display
order.

**Data-driven atoms** — Atoms keyed by data identity, not only by slot name.
Used when a component renders a fixed-shape collection driven by data, such as
Calendar days keyed by `day.id` or weekday headers keyed by index. Prefer
creating these Atoms in the rendered part with `createAtomInstance(key, ...)`
and registering many nodes with `register: { cardinality: 'many' }`. Caller
responsibility: keep the data identity stable across renders.
