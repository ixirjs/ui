# `shared/capability` — the capability system

A **capability** is the behavior-axis brick, the dual of an atom. Capabilities have two runtime
hosts:

- **Bond capabilities** own shared state, cross-node coordination, role projection, and whole-bond
  effects such as disclosure, selection, focus, escape handling, and ARIA relationships. The
  `Capability` type is the common Bond-capability shape.
- **Atom capabilities** own one node's local presentation, DOM behavior, and lifecycle, such as
  `elementRef`, `pressable`, `focusable`, `dataState`, `ariaRole`, and `motion`.

Bond capabilities are registered onto a bond with `bond.capability(...)` and project a `Behavior` per **role** that atoms fold into their `spread` via
`atom.role('trigger')`. Atom capabilities are registered onto an `Atom` or passed to
`createAtomInstance(..., { capabilities })`.

Slots are keyed by **symbol** (`CapabilityKey<Surface>`), so the key _is_ the type registry:
`bond.surface(SELECTION)` returns the typed model with no cast. See
[`docs/adr/0005`](../../../../docs/adr/0005-symbol-protocol-layer.md) and
[`0010`](../../../../docs/adr/0010-capability-seam-hardening.md).

## Files

| File                               | What it is                                                                                                                                                                                                                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`capability.ts`](./capability.ts) | The authoring/registration kit: `BondCapability`/`AtomCapability`/`Behavior` interfaces, `capabilityKey` / `sharedCapabilityKey`, `defineCapability`, `defineAtomCapability`, `decorateCapability`, the role-context types, and `RoleContexts`. No runes — pure types + builders. |
| [`use.svelte.ts`](./use.svelte.ts) | `useCapabilities(bond)` — activates the registered capabilities once when the bond goes live, running their `setup()` effects (focus restore, document listeners) and LIFO teardown.                                                                                              |
| [`models/`](./models)              | The concrete capabilities — see [`models/README.md`](./models/README.md).                                                                                                                                                                                                         |

## Public surface

Through [`index.ts`](./index.ts): the kit from `capability.ts`, `useCapabilities`, and everything
re-exported from [`models`](./models).

## Authoring Bond Capabilities

Prefer `defineCapability({ slot, surface?, requires?, setup?, roles })` or its explicit alias
`defineBondCapability(...)` over hand-writing a `BondCapability` literal. The typed `roles` map
removes the `if (role === ...)` dispatch and the `ctx as T` casts:

```ts
export const FOCUS = capabilityKey<FocusModel>('@svelte-atoms/cap:focus');

export const focusCapability = (opts) =>
	defineCapability<FocusModel>({
		slot: FOCUS,
		surface: createFocusModel(opts),
		setup: (bond) => installFocusRestore(bond),
		roles: { trigger: () => ({ handlers: () => ({ onfocus, onblur }) }) }
	});
```

Register it in the bond constructor via `this.capability(focusCapability(...))`, then activate the
whole bond once with `useCapabilities(bond)` + `setup()`. Older compatibility code may still
register through `bond.state`, but new code should register on the Bond. Override a slot you don't own with
`decorateCapability(slot, { behavior, surface, setup })` registered **after** the base.

## Authoring Atom Capabilities

Use `defineAtomCapability({ slot?, surface?, requires?, behavior?, setup? })` for local atom
behavior. Atom behavior receives `(node, bond | undefined)`, so it works for standalone atoms and
bonded compound parts:

```ts
const trigger = createAtomInstance('trigger', {
	bond: () => DialogBond.required(),
	capabilities: [
		elementRef(),
		pressable(),
		dataState((node, bond) => (bond?.props.open ? 'open' : 'closed'))
	]
});
```

The Atom host supports `atom.capability(key)`, `atom.get(key)`, `atom.require(key)`, and
`atom.describeCapabilities()` for the same typed lookup and diagnostics shape as bond capabilities.

## Faceted authoring

`BondCapability` stays the bond runtime format, with `Capability` as its compatibility name. The
faceted helpers are classification aids for authors, reviewers, diagnostics, and future docs
generation:

| Helper                         | Pattern                                                  | Default metadata                     |
| ------------------------------ | -------------------------------------------------------- | ------------------------------------ |
| `defineModelCapability`        | exposes a reusable state surface                         | `{ layer: 1, kind: 'model' }`        |
| `defineProjectionCapability`   | projects attrs, handlers, or onmount behavior into roles | `{ layer: 1, kind: 'projection' }`   |
| `defineRelationshipCapability` | links atom roles through IDs and ARIA ownership          | `{ layer: 1, kind: 'relationship' }` |
| `definePolicyCapability`       | one replaceable strategy in a behavior family            | `{ layer: 1, kind: 'policy' }`       |
| `defineEffectCapability`       | installs whole-bond lifecycle work through `setup()`     | `{ layer: 1, kind: 'effect' }`       |
| `defineFocusedCapability`      | labels a Layer 2 composition of primitives               | `{ layer: 2, kind: 'focused' }`      |
| `defineArchetypeCapabilities`  | labels a Layer 3 component recipe array                  | `{ layer: 3, kind: 'archetype' }`    |

Metadata does not change slot replacement, decoration, setup, or role projection. It does power
diagnostics: `requires` validates required slots, and `meta.conflicts` warns in dev when a registered
capability conflicts with another registered slot or with a role another capability advertises in
`meta.projects`. Use `defineCapability` directly when a capability does not fit one of the facets yet.

```ts
const closeOnOutsidePress = definePolicyCapability({
	slot: DISMISS,
	meta: {
		projects: ['surface', 'backdrop'],
		requiresRoles: ['surface'],
		docs: 'Closes the active surface from outside or backdrop press.'
	},
	roles: {
		backdrop: () => ({ handlers: () => ({ onclick: close }) })
	}
});
```

## Pattern taxonomy

Use these terms consistently when naming, reviewing, and documenting capability work:

| Term                    | Meaning                                                                      |
| ----------------------- | ---------------------------------------------------------------------------- |
| Primitive capability    | Layer 1 behavior from the universal UI catalog.                              |
| Model capability        | Owns or exposes reusable state.                                              |
| Projection capability   | Turns state or policy into role-specific behavior.                           |
| Relationship capability | Wires cross-role IDs and ARIA references.                                    |
| Policy capability       | A replaceable strategy such as click trigger, navigation, or dismissal.      |
| Effect capability       | Whole-bond lifecycle work activated by `useCapabilities`.                    |
| Focused capability      | Layer 2 composition of primitives into a reusable behavior kit.              |
| Archetype bundle        | Layer 3 recipe for a recognizable UI pattern.                                |
| Bridge capability       | Passes a parent-owned capability into child state for local role projection. |

Use a capability when behavior crosses roles, is shared across component families, needs replacement
or decoration by slot, needs whole-bond setup, bridges parent state into child atoms, or owns ARIA
relationships between sibling atoms.

Avoid a capability when the behavior is only one atom's local presentation, only passes through a
single handler, has no second adapter or override, or needs so many options that its public surface is
as complex as the implementation.

## Layered catalog

Layer 1 primitives should be orthogonal and reusable across component families:

| Category           | Existing or present in spirit                                                                                                                                                                                                                                                                                                                                           | Next candidates                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| State/model        | `collectionCapability`, `selectionCapability`, `rovingCapability`, `inputCapability`, `disclosureCapability`, `validationCapability`, `checkedCapability`, `pressedCapability`, `rangeValueCapability`, `progressValueCapability`, `loadingCapability`, `sortCapability`, `paginationCapability`, `viewportCapability`, `geometryCapability`, `dateSelectionCapability` | none from the current state/model roadmap        |
| Role projection    | selected item, active descendant, input combobox, positional collection, scoped status projection, checked, pressed, range, progress, sort column, pagination controls, viewport, geometry, date selection, `orientationProjection`, `disabledProjection`, `currentProjection`                                                                                          | none from the current role-projection roadmap    |
| Relationship       | `triggerContentLink`, `labelledControl`, `tabPanelLink`, `errorMessageLink`, `activeDescendantLink`, row/column/cell, tree item/group, `menuSubmenuRelationship`, `optionCollectionRelationship`, `headingSectionRelationship`, `liveRegionRelationship`                                                                                                                | none from the current relationship roadmap       |
| Interaction policy | click/hover/context/manual trigger, focus trigger, activation, disclosure trigger/close/toggle, navigation, typeahead, escape, outside press, backdrop press, clear, thumb drag, track press, resize handle, reorder drag, long press, swipe                                                                                                                            | none from the current interaction-policy roadmap |
| Whole-bond effect  | focus restore, focus trap, escape stack, outside press listener, body scroll lock, inert siblings, resize/intersection/mutation observers, media query, reduced motion, pointer modality, scroll measurement, virtual window, document drag, portal layer                                                                                                               | none from the current whole-bond effect roadmap  |
| Atom primitive     | `elementRef`, `pressable`, `focusable`, `dataState`, `ariaRole`, `motion`                                                                                                                                                                                                                                                                                               | hoverable, labelledBy, describedBy               |

Layer 2 focused capabilities compose primitives while staying component-agnostic:

| Focused capability               | Status   | Lower-layer shape                                         |
| -------------------------------- | -------- | --------------------------------------------------------- |
| `selectableCollectionCapability` | Existing | collection + selection + selected item projection         |
| `navigableCollectionCapability`  | Existing | collection + roving + navigation + active descendant      |
| `filterableCollectionCapability` | Existing | input + collection + filter predicate + roving            |
| `dismissPolicy`                  | Existing | escape + outside press + backdrop press + stack           |
| `labelledFieldCapability`        | Existing | labelled control + disabled/readonly/invalid status       |
| `validatedControlCapability`     | Existing | validation + error link + control status                  |
| `typeaheadCollectionCapability`  | Proposed | collection + text extraction + typeahead + roving         |
| `expandableCollectionCapability` | Proposed | collection + disclosure/expansion + trigger/content links |

Layer 3 archetype bundles should mostly choose, configure, and compose lower layers:

| Bundle                     | Status   | Lower-layer shape                                                      |
| -------------------------- | -------- | ---------------------------------------------------------------------- |
| `dialogCapabilities`       | Existing | modal surface without trigger                                          |
| `drawerCapabilities`       | Existing | modal surface + backdrop dismissal + side status                       |
| `popoverCapabilities`      | Existing | positioned surface + trapped-focus override                            |
| `listboxCapabilities`      | Existing | selectable + navigable/filterable collection                           |
| `menuCapabilities`         | Existing | navigable collection + typeahead                                       |
| `treeCapabilities`         | Existing | expandable + selectable + navigable collection + tree relationships    |
| `gridCapabilities`         | Existing | two-dimensional navigation + row/column relationships + selection/sort |
| `tabsCapabilities`         | Existing | selectable collection + tab/panel relationship + activation            |
| `toastCapabilities`        | Existing | disclosure + labelled live-region + close activation + status          |
| `fieldCapabilities`        | Existing | labelled field + validated control + field status                      |
| `datePickerCapabilities`   | Existing | disclosure trigger/content + optional calendar grid behavior           |
| `dropdownMenuCapabilities` | Proposed | popover + navigable collection + menu roles                            |
| `selectCapabilities`       | Proposed | dropdown menu + selectable/filterable collection + input clear         |
| `comboboxCapabilities`     | Proposed | select + editable value input + clearable value                        |

Layer placement rule: if a behavior applies to three or more archetypes, put it in Layer 1. If it
composes primitives without naming a concrete UI pattern, put it in Layer 2. If it names a UI pattern
such as tree, grid, tabs, dialog, or combobox, keep it in Layer 3.
