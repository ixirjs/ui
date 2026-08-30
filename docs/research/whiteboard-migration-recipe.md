# Migrating a family onto the redesigned Kernel — the recipe

Read first: `AGENTS.md` § "Authoring on the redesigned Kernel", the header of
`src/lib/kernel/kernel.svelte.ts`, and the two exemplars — `src/lib/components/card/**` (a
presentation family) and `src/lib/components/accordion/**` (a behavioural one: state classes,
registration `Map`, roving keyboard, controlled commit with callbacks, transition leaf, driver
motion, `presets` layers, `factory`/`getBond`). Copy their shapes; do not invent new ones.

## What a migrated family is

- `bond.svelte.ts`: one plain class per shared object, **keeping the existing class names**
  (`XBond`, `XItemBond`), a `static create(props)`, live `props` (an object of getters the root
  builds), `id` from the root's `$props.id()`, element ids via `Kernel.id(seed, '<family>-<part>')`
  **with the exact ids the family rendered before** (check the SSR snapshot). `XContext =
Kernel.context<XBond>('bond/<name>')` (the same canonical key the old `defineBond` used).
- Cross-part ARIA (`aria-labelledby`, `aria-controls`, `aria-describedby`, `for`, `headers`…): the
  child writes its id into a parent `$state` field at its init; the parent reads it in `attrs`.
- A collection: a `Map` on the parent, registered at the child's init (document order), released
  on teardown (`const detach = parent.attach(...); $effect(() => detach)`). Reactive facts derived
  from membership go through one equality-gated `$state` (the accordion's tab-stop fallback), never
  a reactive array every child reads.
- Behaviour models are reused as functions: `createSelection`, `createDisclosure`,
  `createRovingFocus`, `createTypeahead` (from `$ixirjs/ui/capability/models/*`), `animate`. Their
  _projections_ (what a capability used to put on an element) are written literally in the part's
  `attrs`.
- Controlled props: the root owns the `$bindable`s and wires `bond.bindCommit((next, ctx) => …)`
  as `accordion-root.svelte` does; callbacks fire after the write with `{ bond }`; an equal value
  does not fire.
- Parts: `const el = Kernel.element(() => restProps, { preset: '<family>.<slot>', class: BASE,
state: bond, attrs: () => ({ …own attrs and handlers… }), layer: () => bond.props.presets?.<slot> })`
  and a **literal tag** `<div {...el.attrs}>`. A part with a reason — transitions (`motion`),
  an `animate` driver (`motion`), a renderer (`base`), a polymorphic tag (`as` as a thunk), or a
  preset that themes retag — declares it in the spec, binds `const leaf = Kernel.render(el);` and
  renders `{@render leaf(el, children, arg)}`. Never `{@render Kernel.render(el)(…)}`.
- Props types: `PlainPartProps<'tag', Children>` for literal parts, `RenderProps<'tag', Base,
Children>` for the composable ones; keep every documented prop, drop `E`/`B` generics from the
  component's `generics=` attribute. Keep `IXxx` narrow interfaces the family exports.
- Nothing from `$ixirjs/ui/authoring` except types; nothing from `bond/`, `kernel/index`,
  `kernel/element`; no `Atom`, no capability registration, no registry, no `useRoot`/`definePart`/
  `defineLeaf`. Import the seam from `$ixirjs/ui/kernel/kernel.svelte`.
- A family that another family extends (`DropdownMenuBondBase` → Select/Combobox/ContextMenu) keeps
  the class hierarchy as plain classes.

## What must not change

Public component names, props, snippet arguments, exported types, `getBond`, `factory`, element
ids, ARIA attributes and `data-*` state, keyboard behaviour, preset keys, `presets` bags, motion
recipes' exports. Docs pages and stories must keep compiling without edits.

## Gates, per family

1. `bunx vitest --run components/<family>` — every behaviour spec passes **unchanged**. A spec that
   asserts machinery (`Atom` instances, `nodeByPart`, `capabilities`, `spread` objects) is replaced
   by a DOM-level spec asserting the same rendered outcome — say so in the report.
2. `bun run check`, `bunx eslint src/lib/components/<family>`.
3. `bunx vitest --run family-ssr control-ssr menu-ssr` — do **not** pass `-u`. Read the mismatch:
   the delta must be hydration anchors (`<!---->`) and DEV `data-bond`/`data-kind` markers only,
   or a documented cleanup (`aria-*="false"` gone, a stray attribute gone, `type="button"` added).
   Anything else is a regression: fix it. Report the delta per family.
4. Old-runtime fixtures under `src/lib/test/**` that used this family as a vehicle for the OLD
   machinery: retarget them to a family still on the old runtime (Alert, Collapsible…) or rewrite
   as DOM-level; never delete a behaviour assertion.
5. Do not edit `anchor-budget.spec.ts`, `ssr-baseline.json`, `growth-baseline.json`,
   `public-surface.snapshot.json`, `docs/**` or `AGENTS.md` — those are re-pinned centrally.

## Report

Files changed; specs replaced (which, why); snapshot deltas per family in words; anything left
unresolved. Then stage new files (`git add -N <files>`) and write the patch:
`git diff > <PATCH_DIR>/<batch>.patch`.

## Overlay families

The shared overlay core is already on the redesigned Kernel; an overlay family builds on it and
nothing else:

- `components/overlay/model.svelte.ts` — `OverlayBond` (plain class: `isOpen`/`isDisabled`/`modal`,
  `open`/`close`/`toggle`, `bindCommit` for the root's controlled `open`, `stageOpenChange` /
  `takeOpenChangeContext` for the reason a policy hands to `onopenchange`, and `ids` — each rendered
  part announces its id with `attachPart(part, id)` at init, so `partId('content')` /
  `element('trigger')` resolve without a registry), `OverlayContext` (the host key nested popovers
  gate on), `OverlayLike`, `OverlayKnobs`, `OverlayPart`. Family Bonds extend `OverlayBond`
  (`PopoverBondBase extends OverlayBond`, `DialogBondBase extends OverlayBond`, …) and keep their
  names.
- `components/overlay/behavior.svelte.ts` — every policy as a function: `triggerAttrs`,
  `clickTrigger` / `hoverTrigger` / `contextMenuTrigger` (handlers), `escapeKeydown(o, onEscape)`
  with `closeOnEscape` / `ignoreEscape`, `useEscapeStack`, `useOutsidePress` / `outsidePress` /
  `backdropPress`, `useFocusRestore` / `useFocusOnOpen` / `focusContentOnMount` /
  `focusTrapKeydown` / `surfaceKeydown`, `useBodyScrollLock` / `useInertSiblings`,
  `modalRootAttrs` / `contentStateAttrs` / `modalIsActive`, and the two bundles `useModal(o)` and
  `usePositioned(o)` that a root calls once at init. A part writes the attrs literally
  (`attrs: () => ({ ...triggerAttrs(bond, 'menu'), ...clickTrigger(bond) })`) and composes a
  consumer handler with `Kernel.compose(onclick, own.onclick)` where one exists.
- `components/portal/**` — `PortalsBond` / `PortalBond` are plain classes (`PortalsContext`,
  `PortalContext`, `PortalBond.sink` is written by `Portal.Inner`), `PortalSurface` / `Teleport` /
  `ActivePortal` are on the new seam. `PortalSurface` accepts `owner` (an `OverlayLike`) and honours
  a `presetLayer` prop from a root that hands it its props.
- The root wires `open` exactly as `accordion-root.svelte` wires `values`:
  `bond.bindCommit((open, ctx) => { openProp = open; onopenchange?.(open, ctx); })` — `ctx`
  already carries the staged `event`/`reason` and `bond`.
- The old `overlay/policies/*`, `overlay/capabilities/*`, `overlay/modal.svelte.ts`,
  `overlay/bond.svelte.ts` and `overlay/types.ts` stay until the last old family is gone; do not
  import them from a migrated family. Do not edit `overlay/index.ts` (re-exported centrally at the
  end).

## Gotchas found in flight (2026-08-27)

- **Driver-only motion rides an attachment, not `motion:`.** `motion` with only an `animate` phase
  selects Kernel's `element` mode, which mounts `HtmlElement` — a component boundary worth **+2
  hydration anchors per part**. Mint `createAttachmentKey()` once at init and put the driver in the
  part's own `attrs` instead; the part then stays a literal leaf (`<div {...el.attrs}>`). Return a
  cleanup that cancels the run (`stopMotion(controller, node)`), which is what the driver used to do
  — without it every toggle leaves another filled WAAPI animation on the element. Real `enter`/`exit`
  transitions still belong in `motion`. Tree and Collapsible went 19 → 15 and 15 → 13 anchors per unit
  this way, back to their pinned budgets.
- **A part's own handler gates on `defaultPrevented` itself.** `Kernel.compose(consumer, own)` skips
  the part's handler only when the consumer passed one as a prop; a consumer who calls
  `preventDefault()` from their own `addEventListener` is invisible to the seam. Write
  `if (event.defaultPrevented) return;` at the top of the part's handler as well.
- **`PortalHost`'s `id` names the PORTAL, never the wrapper element** (`Root` names its own
  `root.l0`, and `Portal.Outer` renders an element carrying it). A part that must address its own
  element by id — `Dialog.Content`, whose `role="document"` and `attachPart('content', id)` both
  belong to the wrapper — passes `elementId` as well and names its portal separately.
- **A migrated family stops being a vehicle for the old machinery.** Specs that census the old
  runtime through it (`capability-cost`, `bond-construct`, the capability-integration specs) must be
  retargeted to a family still on the old runtime, or lose that subject; check
  `src/lib/test/**` for the family's name before declaring a migration done.
- **OPEN — repeated parts collide on ids.** Deriving a part's id from the seed alone (`Kernel.id(bond.id,
'dialog-header')`) gives every instance of a repeated part the same id; the old runtime registered
  those nodes with `cardinality: 'many'` and numbered them. It affects every migrated family with a
  part a consumer may render twice. Fix centrally, in the id seam, once the last family has landed —
  a per-Bond mount-ordered counter is deterministic on the server and through hydration.
