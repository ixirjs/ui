# Context — @ixirjs/ui

Shared vocabulary for this codebase. Keep entries one-line where possible. New
terms get added here when they're load-bearing; stale terms get removed.

## Architectural vocabulary

See the `codebase-design` skill for the full glossary (module, interface, depth,
seam, adapter, leverage, locality). Use those terms exactly — don't substitute
"component", "service", "boundary".

## Library concepts

**Bond** — a family's shared object: a **plain state class** (`CardBond`, `AccordionItemBond`) that
owns the shared reactive props, derived values, mutation methods and element ids, published to
context by the root. It has no base class, no registry and no capability host — those went with the
Bond/Atom runtime on 2026-08-27. A compound family has one root Bond; nested families have child
Bonds that take their parent from context at construction. The name "Bond" is kept for the role, not
for a type.

**Live props** — the object of getters a root builds and hands its Bond (`get open() { return open; }`),
so the Bond reads a prop where it is read rather than snapshotting it. `bindCommit(...)` is the
other half: the Bond decides a new value, the root writes the `$bindable`, and the semantic callback
fires after the write with `{ bond }` plus the staged `event`/`reason`.

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

**Bond context plumbing** — `XContext = Kernel.context<XBond>('bond/<name>')` gives a family one
key (`@ixirjs/context/bond/<name>`) and four operations: `share`, `get`, `getOptional`,
`getOrThrow`. The root shares; every part reads. A fused family shares under each ancestor's key as
well, which is what lets `PopoverDialog.Trigger` be `Popover.Trigger`. Don't hand-write the string.

**Part** — the Svelte component that renders one slot (Root, Trigger, Content, Item, Header, Body).
It reads its Bond from context, builds `Kernel.element(() => props, spec)`, and either spreads
`el.attrs` on a literal tag or binds one leaf (`Kernel.render(el)`) when it has a reason to dispatch
— a transition, a `base` renderer, a polymorphic `as`, or a preset that retags it. There is no
runtime object between the component and its element: what an Atom used to project is written
literally in the part's `attrs`.

**Capability** — historical. Behaviour is composed from **models** — `createDisclosure`,
`createSelection`, `createRovingFocus`, `createTypeahead`, `createInput`, `createSort`,
`createPagination`, `createValidation`, `createStatus`, `createGeometry` — plain functions a Bond
calls in its constructor, exported for consumers from `@ixirjs/ui/shared`. Their ARIA and `data-*` projections
are written by the parts that own those elements. The registration protocol (`defineBondCapability`,
`defineAtomCapability`, slot keys, the host) was deleted with the runtime.

**Identity vocabulary** — three identifiers, each distinct. Don't conflate:

| id         | what it is                | set by / formula                                      | example (accordion item header) |
| ---------- | ------------------------- | ----------------------------------------------------- | ------------------------------- |
| seed       | the family's identity     | the root's `$props.id()`, or `value` where one exists | `s1`                            |
| element id | what a part renders       | `Kernel.id(seed, '<family>-<part>')`                  | `accordion-item-header-s1`      |
| preset key | the theme key a part uses | dotted path in the part's Kernel spec                 | `accordion.item.header`         |

Element ids are hyphenated (DOM); preset keys are dotted (theme hierarchy) — deliberately different
(see §preset). A part a consumer may render twice claims its id with `Kernel.claimId(bond, seed,
part)`: the first keeps the canonical one, later ones take the lowest free suffix, released on
teardown.

**Spread** — the merged attribute object a part renders: `<div {...el.attrs}>`.
Equals `{ ...attrs, ...handlers, ...attachments }`. The part's interface is the
spread; that's the test surface.

**Attribute merge order** — one order, owned by `Kernel.element`: `class` first, then the preset's
attributes, the variant's, the layer's, the part's own (`spec.attrs`), then the consumer's props.
Handlers compose rather than replace — the consumer's runs first and the part's is skipped when the
default was prevented — so a part's own handler must ALSO gate on `event.defaultPrevented`, for a
consumer who prevents from their own listener and passes no prop.

**Reactivity invariant** — a part reads Bond state **live and tracked**, inside the `attrs` thunk
that `Kernel.element` evaluates within its own memo. Concretely:

- `attrs: () => ({ 'aria-disabled': bond.isDisabled })` reads the Bond directly. **Never `untrack` a
  Bond read in `attrs`** — it freezes the attribute (the class of bug where `aria-disabled` stops
  updating).
- Handlers are closures: read state **inside the handler body** (event-time), never above the
  `return` (derive-time), which captures a stale value.
- `untrack` is legitimate **only** for one-shot snapshots: the root's `factory`, a part's `id` prop,
  and mount-time reads. Those must _not_ become reactive dependencies.
- **Nothing read from a dispatch block may depend on Bond state**, however well gated — a child
  registering at mount is a write during effect flush, and a block effect re-runs eagerly on it.

**Collections** — a parent's mount-ordered `Map`, registered at the child's init (document order)
and released on teardown. It replaces the node registry. Anything reactive derived from membership
goes through ONE equality-gated `$state` — the accordion's tab stop — never a reactive array every
child reads, which is the defect class `bench:growth` exists to catch.

**Stable attachment keys** — a part mints its attachment symbols once, at init, never while
computing attrs. Svelte keys attachments by symbol identity; reminting one on every read reruns
mount/cleanup and breaks lifecycle locality. This is how an `animate`-only motion driver rides a
literal element instead of escalating to `HtmlElement` (+2 hydration anchors per part).

**Share** — the operation that puts a Bond into Svelte context: `XContext.share(bond)` in the root,
`XContext.get()` / `getOrThrow(message)` in the parts. The root also reads `factory` through
`untrack` — a family takes its parent from context BEFORE it shares its own.
See §"Bond context plumbing".

**Preset record** — the closed presentation contract `{ class, attrs, variants,
compounds, defaults, render? }`, authored with `definePreset(...)`. Presets do not own
attachments or lifecycle; that behavior belongs in parts and behavior models.

**`base` / `as` / preset cascade** — rich render props govern what component renders and how
variants/presets merge. Order: `defaults → preset → variants → restProps` (last wins). Tests under
`src/lib/kernel/resolve/` pin this contract. `presentation.svelte.ts` evaluates it into one
tracked snapshot. Kernel renders the ordinary native path directly; custom renderers, driver-only
motion, or renderer lifecycle hooks enter the richer component leaves.

**Kernel** — the sole first-party rendering seam, `src/lib/kernel/kernel.svelte.ts`.
`Kernel.element(() => props, spec)` resolves the whole presentation contract for one part,
`Kernel.render(el)` returns the leaf a dispatching part renders (literal, dynamic, transition,
`HtmlElement`, or a custom renderer), `Kernel.context` publishes a family's shared object,
`Kernel.id`/`Kernel.claimId` derive element ids, and `Kernel.compose` composes a consumer handler
with a part's. There is no parallel rendering interface and no other authoring seam.

**Preset keys** — dotted paths naming a theme entry, declared in each part's Kernel spec and
registered in `src/lib/preset/manifest.ts`. A root takes the bare base (`accordion`,
`accordion.item`); every other part appends its slot (`accordion.item.header`). Dots separate
_hierarchy levels_, hyphens stay _inside_ a level (`dropdown-menu.item`). A fused family derives its
keys from `bond.name`, which is what lets Dialog's parts resolve `popover-dialog.*` under
PopoverDialog.

Shared parts select family preset keys from their state/context; preserve existing fallback resolution.

A part declares its key once, in its Kernel spec (`preset: 'accordion.item.header'`), and a
consumer's `preset` prop overrides it. The `preset` prop is typed `PresetKey`, which also accepts an
explicit fallback chain from `fallbackPreset(...)`. A part that re-skins another family's element
names that family's key verbatim rather than waking its own fallback — the two differ
(`list.item` is `px-4 py-3` against `select.item`'s `px-2 py-1.5`).

## Overlay architecture

**Disclosure** — the WAI-ARIA term for any pattern where a trigger controls the
visibility of a content region. Dialog, Drawer, Popover, Tooltip, Context Menu,
Dropdown Menu, Select, and Combobox all use disclosure behavior.

**Overlay state** — modal/host families retain their plain `OverlayBond` base; the eight popup
families share `PopupBond` behind family interfaces. Both satisfy the structural `OverlayState`
contract. Roots own disposal; standalone popup owners dispose their own state. Existing factory
contracts on non-popup families remain supported.

**Portal** — an in-place containment scope and mount target, not a body-detached escape hatch. A portal owns the DOM place where teleported content paints; host portals keep nested overlays scrolling, clipping, and stacking with their host.

**Port** — the low-level synchronous DOM re-parenting primitive (`port(node, target)`). It moves a node into a target element and returns cleanup; higher-level components own target resolution and diagnostics.

**Teleport** — the current component that ports content into a portal target. Target precedence is explicit `portal` prop → ambient portal from context → root portal (`root.l0`). It renders nothing until a target element exists.

**Portal host / sink** — the host is the in-flow relative wrapper; the sink is the absolute portal element inside it. The sink is also the floating-ui boundary, so positioning and containment use one DOM element.

**Containment scope** — the DOM and stacking context a portal keeps overlays inside. A popover opened inside a dialog should target the dialog's host portal by default, not the document body.

**ZLayer / band** — the current elevation model. Built-in bands are `base`, `positioned`, `modal`, and `ambient`; `ZLayer.value` computes the natural z-index from the band, parent layer, relation, and offset.

**Layer anchor / relation** — a named z reference registered with `ZLayer.anchor(...)`; a relation (`{ below }` or `{ above }`) pins a layer just below or above that anchor. Use it for sticky-under/sticky-over cases instead of magic z constants.

**Overlay behavior** — shared attribute, event and lifecycle helpers in
`src/lib/components/overlay/behavior.svelte.ts` consume `OverlayState`. They own trigger,
dismissal, focus and modal policies without depending on one concrete family class. Portal
mounting and surfaces live under `src/lib/components/portal/mounting` and `surface`.

**Query dismissal** — the popup family's `onEscape` clears a nonempty query before closing.
Preserve that existing ordering when adding dismissal policies.

## Testing posture

The **rendered outcome** is the test surface — ids, ARIA, `data-*`, keyboard behaviour — plus the
Bond's own methods and derived state. Assert on the DOM, not on a runtime object: there is no spread
object to inspect any more, and a spec that reaches for machinery pins an implementation rather than
a contract.

**Spec convention** — `*.svelte.spec.ts` colocated next to `bond.svelte.ts`.
The Svelte-prefixed suffix lands in Vitest's browser project (Playwright +
Chromium), where `$state` runes work. Pure (no-rune) specs use `*.spec.ts` and
run in the node project.

**Per-family checklist** — each colocated browser spec covers: (1) a Bond method mutates props;
(2) the rendered attributes track that state; (3) pointer/keyboard gestures transition it;
(4) every part renders its seeded id; (5) a model or `factory` substitution alters behaviour;
(6) teardown releases what the family registered; (7) a required descendant throws outside its root
context; and (8) cross-part ARIA names the element that actually rendered. Collapsible and Dialog
are the canonical examples.

**Adapter specs** — each strategy adapter (ClickTrigger, hoverTrigger,
CloseOnEscape, ClearThenClose, TrappedFocus, FocusOnOpen, NoFocus) has a spec
colocated next to its source file (e.g. `strategies/trigger.svelte.spec.ts`),
fully decoupled from any bond.

## Other deep modules

**Collection** — a root-owned `Map` (or the popup runtime's `SvelteMap`) of registered children.
Children register their own identity and release it on teardown; selection and focus remain on
the owning state. There is no public `Bond.collection` or capability registry. Preserve existing
family registration methods because some are reachable through public state interfaces.

**Child→parent seam** — a child Bond or part should depend on a **narrow
parent-facing interface**, not the whole parent Bond. The parent Bond exposes
only what children need, such as ids, values, open/close/toggle methods,
collection registration, or a specific capability surface. The child stores that
small interface, which keeps tests simple and avoids reaching through
`parent.parent.parent` chains.

**Roving focus** — `createRovingFocus({ ids, item })` from `@ixirjs/ui/shared`: a model over the
ids currently reachable, with `next`/`previous`/`first`/`last`/`goto`. The keyboard handler and the
`tabindex`/`aria-activedescendant` attributes are written by the part that owns the element. Tree
owns one model at the outermost node, because navigation crosses node boundaries.

**Data-driven parts** — a part rendered once per datum (Calendar days keyed by `day.id`, DataGrid
rows). It derives its element id from the datum's identity rather than from a slot name, and
registers with its parent's collection at init if the parent needs to see it. Caller responsibility:
keep the data identity stable across renders.

**ValidationSource** — the one seam between a Bond and whoever decides whether it
is valid (`shared/validation`). Two directions, either or both: **pull**, where
`validate(values)` is called when the form decides it is time, and **push**, where
`errors` is read reactively because someone else owns the state. A
[Standard Schema](https://standardschema.dev) is a source
(`standardSchemaSource`); a reactive error bag is a source (`errorRecordSource`);
Superforms is a source (`superformsSource`). `FormBond` never learns which kind it
was handed, which is why adding Superforms took no changes to the Bond.

The `~standard` spec is **vendored as types**, not depended on — a peer dependency
would force every consumer to install a schema library they may not use. There is
deliberately no adapter layer: Zod, Valibot, ArkType and Effect all implement the
spec natively, so `schema={anySchema}` is the whole integration. A schema that
_throws_ propagates rather than being reported as zero errors, since an empty error
list reads downstream as valid. See `docs/adr/0010`.

**Error routing** — issue paths and field `name`s are both normalized through
`formatPath(parsePath(name))` before comparison, so `items.0.qty` and `items[0].qty`
are one key. A field's `errors` are its own schema's plus the slice of the form's
that match its name; the merged view — not the field's own model — is what the
field's `errors` getter exposes, so a form-level error still reaches
`aria-invalid` on the control.

## Compatibility

[ADR 0011](docs/adr/0011-additive-first-api-compatibility.md) and [the API policy](docs/api/README.md)
protect the adopted worktree surface. No scheduled removals. Review each API for today's use and
tomorrow's additive evolution; preserve aliases, augmentation, factories, bindings and reachable
state members. Documentation of older runtimes in historical ADRs is not current authoring guidance.
