# Context — @svelte-atoms/core

Shared vocabulary for this codebase. Keep entries one-line where possible. New
terms get added here when they're load-bearing; stale terms get removed.

## Architectural vocabulary

See `~/.claude/skills/improve-codebase-architecture/LANGUAGE.md` for the full
glossary (module, interface, depth, seam, adapter, leverage, locality). Use
those terms exactly — don't substitute "component", "service", "boundary".

## Library concepts

**Bond** — a per-component class that owns shared reactive props, derived
values, mutation methods, context, capabilities, and the registry of rendered
Atoms. Implemented in `src/lib/shared/bond/bond.svelte.ts`. A compound component
family has one root Bond; nested families can have child Bonds.

**BondState** — an internal compatibility helper. Do not teach it as a public
authoring concept. New code puts shared state, derived values, mutation methods,
collections, and capability lookup on `Bond` itself. `bond.state` remains as a
compatibility alias for older internals while they migrate.

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
`this`, keyed off `CONTEXT_KEY`). A subclass only declares
`static CONTEXT_KEY = bondContextKey('<name>')` — it never re-implements the
trio. Keys are canonical (`@svelte-atoms/context/<name>`); don't hand-write the
string. The only bonds that legitimately _don't_ define their own key are the
overlay-family bonds (menu, dropdown-menu, select, combobox) that deliberately
share `popover`'s context slot by inheriting `PopoverBond.CONTEXT_KEY`.

**Atom Component** — the Svelte component that renders a part such as Root,
Trigger, Content, Item, Header, or Body.

**Atom** — the runtime object owned by an Atom Component. It owns one DOM element
ref, attrs, handlers, attachment lifecycle, role projection, and atom-local
capabilities. Rendered Svelte parts create Atoms with `createAtomInstance(...)`
and register them with their Bond. Generated part methods remain compatibility
adapters for older authoring code.

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
- `onmount` runs as an extra spread attachment alongside the atom's own; return a
  cleanup. `ClickTrigger` is proven to round-trip through this seam unchanged.

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
- `untrack` is legitimate **only** for one-shot snapshots: bond construction
  (`untrack(() => factory()).share()`) and mount-time reads in `onmount`. Those
  must _not_ become reactive dependencies.

**Node registry** — internal microtask-flushed `StagedMap` inside Bond.
`bond.register(node)` records rendered Atoms. `bond.node(key)` returns the first
registered Atom for a slot or role; `bond.nodes(key)` returns all matching
registered Atoms. Generated part methods and `bond.atom('key', ...)` are
compatibility adapters, not the preferred path for rendered components.

The microtask-flush is **load-bearing — do not "simplify" it away**:

- atoms register _during render_ (for example through `createAtomInstance(...)`); writing
  straight to a reactive map there throws `state_unsafe_mutation`, so writes are
  staged in a plain `#pending` Map and flushed in a microtask.
- the map must still be reactive because a `$derived` reading one
  atom's element via `bond.node('content')?.element` must re-run when _that_ atom
  registers later (cross-atom lookups: trigger→content, focus restore→trigger).
- hence `get()` reads `#atoms` first (to register the reactive dep) before
  falling back to `#pending`. Removing either half breaks one of these.

**Stable attachment keys** — every Atom mints attachment symbols once per
instance, not while computing `spread`. Svelte keys attachments by symbol
identity; reminting a symbol on every spread read would rerun mount/cleanup and
break lifecycle locality.

**Share** — the convention for setting a Bond into Svelte context. `share()` is
**inherited** from the base `Bond` (it sets context under the subclass's
`CONTEXT_KEY` via polymorphic `this`); a Bond no longer reimplements it.
Sub-components retrieve via `FooBond.get()` (also inherited). See §"Bond context
plumbing".

**`base` / `as` / preset cascade** — props on `HtmlAtom` that govern what
component renders and how variants/presets merge. Order: `fallback → preset →
variants → restProps` (last wins). This precedence is contract; tests in
`src/lib/components/atom/presentation.spec.ts` pin it. The eleven-stage
pipeline lives in `presentation.ts` as `presentationStages(input)` returning
thunks; `html-atom.svelte` wraps each in `$derived.by` to keep reactivity
granular.

**`Bond.namespace` vs `Bond.preset`** — two _distinct_ identities, kept
separate on purpose:

- **`namespace`** — DOM identity (`data-bond`, `kind`, element ids).
  Hyphenated for multi-word names (`accordion-item`, `dropdown-menu`). Defaults
  to `name`; compound bonds override it (`combobox`, `select`).
- **`preset`** (on the Bond) — the dotted preset _base path_. Source of truth
  for atom preset keys. Defaults to `namespace` (correct for single-level
  components: `popover.content`, `dropdown-menu.list`, `alert.close-button` —
  dots separate _hierarchy levels_, hyphens stay _inside_ a level). Genuinely
  **nested child bonds** override it because their preset depth exceeds their
  hyphenated namespace: `accordion-item` (namespace) → `accordion.item`
  (`bond.preset`).

**`Atom.preset`** — the atom's default preset key, from `bond.preset`:
the **root** atom maps to the bare base (`accordion`, `accordion.item`); every
other atom appends its `name` (`accordion.item.header`). (`bond.preset` is the
bond-level base; `atom.preset` is the atom-level full key — same name, two
layers.) A re-exported atom re-namespaces automatically (combobox reusing the
popover arrow → `combobox.arrow`).

Components consume this as the **default**, caller overrides:
`preset: preset ?? atom.preset`. Don't restate the literal key in the `.svelte`
— the atom owns it. The `preset` prop is typed `PresetKey`, which also accepts
an explicit fallback chain (`string[]`) resolved first-registered-wins by
`presentationStages.preset`. Collection-item atoms (`SelectItemAtom`,
dropdown-menu item) carry an instance-specific `name` (`item-<value>`), so they
read the shared `*.item` preset from the bond's canonical `item()` atom instead
of their own `.preset`.

## Overlay architecture

**Disclosure** — the WAI-ARIA term for any pattern where a trigger controls the
visibility of a content region. Dialog, Drawer, Popover, Tooltip, Context Menu,
Dropdown Menu, Select, and Combobox all use disclosure behavior.

**OverlayBond** — the shared base for overlay families. It owns the open/close
surface and common overlay props. Concrete overlays add their own capabilities,
part atoms, and positioning or modal behavior.

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

**Per-bond checklist** — each `bond.svelte.spec.ts` covers: (1) Bond method
mutates props; (2) `atom.spread` is reactive; (3) handlers transition state
when invoked; (4) atom identity is stable (cache); (5) strategy substitution
alters behavior.

**Adapter specs** — each strategy adapter (ClickTrigger, hoverTrigger,
CloseOnEscape, ClearThenClose, TrappedFocus, FocusOnOpen, NoFocus) has a spec
colocated next to its source file (e.g. `strategies/trigger.svelte.spec.ts`),
fully decoupled from any bond.

## Other deep modules

**Collection** — `Bond.collection<T>(kind)` returns a typed `Collection<T>`
with insertion-order reactive `values`, `get/has/indexOf/size`, and
`set(id, bond) → cleanup`.

**A Collection IS a capability** (ADR 0007, resolving 0006's deferred item).
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
`BondState.children()` was removed; call `collection()` directly on the Bond.

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
