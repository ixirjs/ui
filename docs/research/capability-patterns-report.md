# Capability Pattern Report

Date: 2026-06-26

Scope: `src/lib/shared/capability`, the `BondState` registry it depends on, and the components that currently register or project capabilities.

## Executive summary

The current capability module is a strong seam. It gives the library a small runtime interface:

- register a `Capability` by slot
- retrieve its typed surface by key
- project behavior into an atom role
- run whole-bond setup once
- override or decorate by registering another holder for the same slot

That seam is already carrying real architectural weight. It makes `Popover`, `Dialog`, `DropdownMenu`, `Select`, `Combobox`, `Tabs`, `DataGrid`, `Field`, and `Toast` share behavior without subclassing each other.

The weak spot is not the runtime. The weak spot is the vocabulary around it. Today, one word, "capability", covers at least seven different patterns: state surface, role projection, relationship wiring, input channel, interaction policy, lifecycle effect, and bundle. That flexibility is powerful, but it makes it hard to decide what should become a capability next.

Recommended direction: keep the runtime registry, but introduce a capability pattern catalog and faceted authoring helpers. In other words, do not replace `Capability`; make the existing interface easier to classify, document, and extend.

## Current architecture

### The core interface

`src/lib/shared/capability/capability.ts` defines:

- `Behavior`: `attrs`, `handlers`, and `onmount` facets projected into an atom.
- `CapabilityKey<Surface>`: a symbol whose phantom type makes retrieval typed.
- `Capability<Surface>`: `slot`, optional `surface`, optional `requires`, optional `behavior(role, ctx)`, optional `setup(bond)`, optional `compose(prior)`.
- `defineCapability`: canonical builder for typed role maps or dynamic role projection.
- `decorateCapability`: wrapper for last-registered overrides that delegate to the prior holder.

`src/lib/shared/capability/use.svelte.ts` defines:

- `useCapabilities(bond)`: runs each registered `setup()` once and tears them down in LIFO order.

The runtime registry lives in `src/lib/shared/bond/state.svelte.ts`:

- `capability(cap)` registers a holder.
- `capability(key)` retrieves by slot.
- `surface(key)` retrieves only the holder surface.
- `collection(kind)` lazily creates a `collection:<kind>` capability.
- `behaviorsForRole(role, ctx)` asks every registered capability to project behavior for an atom role.
- repeated registration for the same slot is last-wins unless the new holder has `compose(prior)`.

`src/lib/shared/bond/atom.svelte.ts` completes the seam:

- `atom.role(role, ctx?)` asks the bond state for role behaviors and folds them into `spread`.
- behavior attrs are last-wins.
- behavior handlers are chained.
- behavior `onmount` callbacks become stable Svelte attachments.

### Design read

This is a deep module. Callers learn a small interface, while the implementation centralizes:

- typed slot identity
- capability replacement
- capability decoration
- per-role projection
- handler composition
- setup lifecycle
- dev diagnostics
- collection unification

The deletion test is favorable. If this module disappeared, equivalent logic would reappear across many bonds and atoms as bespoke ARIA, keyboard, focus, escape, selection, and collection code.

## Current built-in capabilities

| Capability           | File                                                    | Pattern                                | Surface              | Role projection                               | Setup                            | Current role                                         |
| -------------------- | ------------------------------------------------------- | -------------------------------------- | -------------------- | --------------------------------------------- | -------------------------------- | ---------------------------------------------------- |
| Collection           | `models/collection.svelte.ts`                           | collection registry                    | `Collection<T>`      | optional `item`, `container` positional attrs | no                               | parent-child membership and optional positional ARIA |
| Selection            | `models/selection.svelte.ts`                            | selection state + projection           | `SelectionModel<T>`  | `item`, `container`                           | no                               | selected state, data hooks, optional click commit    |
| Disclosure           | `models/disclosure.svelte.ts`                           | state model only                       | `Disclosure`         | none directly                                 | no                               | open/close facade over selection algebra             |
| Roving focus         | `models/roving.svelte.ts`                               | active item state + projection         | `RovingFocus<T>`     | `container`, `item`                           | no                               | highlighted item, `aria-activedescendant`            |
| Navigation           | `models/navigation.svelte.ts`                           | keyboard policy                        | `RovingFocus`        | configurable roles                            | no                               | arrow/Home/End behavior over roving                  |
| Input                | `models/input.svelte.ts`                                | input channel + combobox projection    | `InputModel`         | `input`                                       | no                               | field text store, combobox ARIA, input writeback     |
| Trigger/content link | `models/relationship.svelte.ts`                         | semantic relationship                  | `Disclosure`         | `trigger`, `content`                          | no                               | `aria-expanded`, `aria-controls`, `aria-labelledby`  |
| Labelled control     | `models/relationship.svelte.ts`                         | semantic relationship                  | none                 | `label`, `control`                            | no                               | label/control/description linkage                    |
| Trigger policy       | `components/portal/host/policies/trigger.svelte.ts`     | interaction policy                     | none                 | `trigger`                                     | sometimes atom `onmount` cleanup | click, hover, context-menu, manual trigger variants  |
| Focus policy         | `components/portal/host/policies/focus.svelte.ts`       | focus lifecycle + projection           | `FocusPolicySurface` | `content`, `surface`                          | yes                              | focus on open, focus trap, restore policy            |
| Escape policy        | `components/portal/host/policies/escape.svelte.ts`      | dismissal policy + global coordination | `EscapeHandler`      | `surface`                                     | yes                              | close/ignore/clear-then-close on Escape              |
| Capability bundles   | `components/portal/host/capabilities/bundles.svelte.ts` | bundle                                 | none                 | from members                                  | from members                     | modal and positioned overlay defaults                |

## Capability patterns already present

### 1. Surface-only model

A capability can exist only to make a shared model addressable by slot.

Examples:

- `collectionCapability(kind)` is surface-only unless `positional` is enabled.
- `noFocus` carries a focus surface with no projection.

Why it works:

- other modules can retrieve the surface through one typed registry
- fusion and last-wins override apply to models as well as behavior
- collections no longer need a parallel registry

Potential rule: if the value is a reusable model that multiple atoms, child bonds, or policies may need to retrieve, it deserves a capability surface even if it emits no DOM behavior.

### 2. Surface plus role projection

A capability can own state and project that state into atom roles.

Examples:

- `selectionCapability`: selected state becomes `aria-selected`, `aria-checked`, `data-selected`, and optional click commit.
- `rovingCapability`: active item becomes `aria-activedescendant` on the container and `data-highlighted` on items.
- `inputCapability`: input text model becomes combobox attrs and `oninput`.

Why it works:

- state logic is tested once
- DOM projection is reusable
- atoms name intent with `role(...)` instead of hand-writing every attribute

Potential rule: if state has an accessible DOM representation on multiple atom roles, keep state and projection together unless one of them varies independently.

### 3. Behavior-only policy

A capability can be a replaceable behavior policy with little or no state surface.

Examples:

- `clickTrigger`, `hoverTrigger`, `contextMenuTrigger`, `manualTrigger`
- `navigationCapability`
- `closeOnEscape`, `ignoreEscape`, `clearThenClose`

Why it works:

- policies are swappable by slot
- component bonds can override behavior without forking atom classes
- tests can exercise the policy without mounting the full component

Potential rule: if consumers reasonably want to pick one strategy from a family, put the family behind one public slot.

### 4. Semantic relationship

A capability can wire IDs and ARIA references between atom roles.

Examples:

- `triggerContentLink`: trigger gets `aria-controls` and `aria-expanded`; content gets `aria-labelledby`.
- `labelledControl`: control gets `aria-labelledby` and `aria-describedby`; label optionally gets native `for`.

Why it works:

- relationship wiring is more reusable than any one component
- atom roles become the relationship vocabulary
- implementation stays centralized around `bond.atomByRole(...)`

Potential rule: if two or more atoms need stable cross-references, prefer a relationship capability over per-atom ID construction.

### 5. Whole-bond effect

A capability can run a lifecycle effect that no individual atom owns.

Examples:

- focus restore watches open/closed transitions
- escape stack enrolls open overlays so only the topmost overlay handles Escape
- `useCapabilities` is the single activation point

Why it works:

- global or state-reactive effects do not leak into root components
- effects compose with the same slot semantics as projections
- setup-bearing capabilities can warn if `useCapabilities(bond)` was forgotten

Potential rule: if behavior needs document state, timers, subscriptions, stacks, or state-reactive effects, it belongs in `setup()`, activated once at the root.

### 6. Bundle

A bundle is a named set of capabilities for a component archetype.

Examples:

- `modalCapabilities`: click trigger, trapped focus, close on escape
- `positionedCapabilities`: click trigger, focus on open, close on escape
- `popoverCapabilities`: positioned defaults plus trapped-focus override

Why it works:

- components opt into a behavioral archetype with one function
- individual slots remain overrideable
- fusion can resolve conflicts through last-wins slot registration

Potential rule: if a group of capabilities is repeatedly used together and still needs per-slot overrides, expose a bundle rather than a base class.

### 7. Parent-child projection bridge

A parent can own a model surface while a child re-registers the same capability instance so child atoms can project against parent state.

Examples:

- `TabsBondState` owns selection; `TabBondState` re-registers the parent's selection capability.
- `DataGridBondState` owns selection; `DataGridRowBondState` re-registers the parent's selection capability.

Why it works:

- the child atom can simply call `.role('item', id)`
- selection state remains on the parent
- child state depends only on a narrow parent-facing interface

Potential rule: if a child atom needs role projection from parent-owned state, bridge the parent's capability through the child contract instead of giving the child the whole parent bond.

## Component dependency matrix

| Component/family    | Capability dependencies                                                                      | How they are used                                                                                         | Notes                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Overlay host        | trigger, focus, escape                                                                       | `OverlayTriggerAtom.role('trigger')`, `ModalRootAtom.role('surface')`, `ModalContentAtom.role('content')` | Foundation for modal and positioned overlays                                                 |
| Dialog              | `modalCapabilities()` minus trigger                                                          | root surface gets escape/focus; content gets focus-on-open                                                | Good example of behavior via capabilities, not a class hierarchy                             |
| Drawer              | `modalCapabilities()` minus trigger                                                          | root/content same as dialog                                                                               | Backdrop click close is still bespoke and could be a dismiss capability                      |
| Popover             | positioned bundle plus trapped focus override                                                | trigger, overlay surface, content                                                                         | Uses slot override to make positioned overlay trap focus                                     |
| Dropdown menu       | Popover capabilities, collection:item, roving, navigation, click trigger override            | content is `container`; trigger also receives navigation; items register in collection                    | Good composite pattern, though highlighted-item activation remains hand-written              |
| Select              | Dropdown menu capabilities, selection, input, listbox click trigger, clear-then-close escape | selection reflects options; input manages query; Escape clears query before closing                       | Strong example of overriding inherited capability slots                                      |
| Combobox            | Select capabilities, overrides input                                                         | one input capability handles `query` and `value` fields                                                   | Input override is clean; some typed-input clearing remains atom-local                        |
| Accordion           | collection:item, selection model, per-item trigger/content link                              | parent owns collection and selection model; each item owns disclosure relationship                        | Selection is reused as a model but not registered as a parent capability                     |
| Collapsible         | disclosure model, trigger/content link                                                       | header/body relationship; header toggles locally                                                          | Toggle gesture could become a reusable disclosure trigger policy                             |
| Tree                | disclosure model, trigger/content link                                                       | header/body relationship                                                                                  | Has tree-specific semantics but no collection/roving tree navigation yet                     |
| Tabs/Tab            | selection capability, collection:item, collection:content                                    | parent owns selection; tab child bridges parent selection; header projects item state                     | Tab/tabpanel relationship is still atom-local and could become a relationship capability     |
| DataGrid/Row/Column | selection capability, collection:row, collection:column                                      | parent owns row selection; rows bridge parent selection                                                   | Grid navigation, sorting, column relationships are future capability candidates              |
| Stepper/Step        | collection:step, collection:content                                                          | parent owns ordered steps/content                                                                         | Active/completed/disabled status is atom-local and could become a status/progress capability |
| Field/Form          | labelledControl                                                                              | label/control relationship                                                                                | Validation state is local; could become a field capability if reused                         |
| Toast               | labelledControl, disclosure model                                                            | root labelled by title/description; close behavior local                                                  | Dismiss and auto-dismiss are likely future capability families                               |

## Capability universe for UI and frontend

The current system covers a healthy slice of the UI universe: selection, disclosure, roving focus, keyboard navigation, input, relationships, focus, escape, and trigger policies.

The larger universe should be organized by layer, not by component. The bottom layer is the universal vocabulary of UI behavior. The upper layers compose those primitives into focused capabilities and then into component archetypes.

### Layer model

Layer 0 is the capability protocol:

- `Capability`
- slot identity
- typed surface retrieval
- role projection
- setup lifecycle
- replacement and decoration

Layer 1 is the universal primitive catalog. These are small, orthogonal capabilities that appear across the whole UI universe:

- state surfaces
- role projections
- interaction policies
- relationships
- lifecycle and environment effects
- status and styling state

Layer 2 is focused capability composition. These modules compose Layer 1 primitives into reusable behavior kits that are still below any single component family:

- selectable collection = collection + selection + item projection
- navigable collection = collection + roving + keyboard navigation
- filterable collection = input + collection + roving + typeahead/filtering
- disclosure pair = disclosure + trigger/content relationship + activation policy
- dismissible surface = escape + outside press + backdrop press + stack coordination
- labelled field = labelled control + validation + disabled/readonly status

Layer 3 is component archetype composition. These are high-level bundles for recognizable UI patterns:

- listbox
- menu
- combobox
- tabs
- tree
- grid
- dialog
- drawer
- popover
- toast
- stepper

Layer 3 should be mostly recipe, not new primitive behavior. If a grid capability needs keyboard movement, active descendant, selection, row/column relationships, and sorting, each of those should come from lower layers first. The grid module earns its keep by choosing and configuring those primitives behind a smaller interface.

### State surfaces

Reusable state models that may or may not project DOM behavior:

- disclosure: open, closed, toggling, disabled guard
- selection: single, multiple, range, all, indeterminate
- collection: ordered children, virtual children, grouped children
- roving focus: active item, active descendant, current item
- input value: raw text, committed value, query, masked value
- validation: dirty, touched, valid, invalid, pending, errors
- loading: pending, fulfilled, empty, error, stale
- progress: determinate, indeterminate, current step, total steps
- sorting: active column, direction, priority
- expansion: expanded rows/nodes, nested disclosure
- checked state: checked, unchecked, mixed
- pressed state: pressed, unpressed, toggle button state

### Role projections

Behavior attached to a semantic role:

- item
- container
- trigger
- content
- surface
- input
- control
- label
- description
- option
- tab
- panel
- row
- column
- cell
- handle
- thumb
- track
- viewport
- backdrop

Current `RoleContexts` already captures common roles, but the universe is larger. The next step is not necessarily to hard-code every role. A better step is to document role profiles per capability: which roles a capability projects, which role contexts they need, and which atom slots normally claim them.

### Interaction policies

Replaceable strategies for user intent:

- click trigger
- hover trigger
- focus trigger
- context menu trigger
- manual trigger
- keyboard activation
- long press
- outside press
- backdrop press
- escape dismissal
- typeahead
- roving arrow navigation
- grid navigation
- carousel navigation
- drag and drop reorder
- resize
- swipe
- pinch/zoom
- press-and-hold repeat

Current trigger/escape/navigation policies are the right pattern. Dismissal and typeahead are the obvious next policies.

### Relationship capabilities

Cross-atom references and ownership:

- trigger controls content
- label labels control
- description describes control
- error message describes control
- tab controls tabpanel
- option belongs to listbox
- row owns cells
- column labels cells
- tree item owns group
- menu item controls submenu
- active descendant points to active option

These are a high-return capability category because they remove repetitive, error-prone ID wiring.

### Lifecycle and environment effects

Whole-bond effects that need `setup()`:

- focus restore
- focus trap
- escape stack
- outside press listener
- pointer modality tracking
- keyboard modality tracking
- body scroll lock
- inert siblings/background
- resize observer
- intersection observer
- mutation observer
- media query subscriptions
- reduced motion
- route/navigation cleanup
- clipboard permission flow
- drag/drop document listeners

Current `setup()` handles this category well. The report recommendation is to keep it, but make effect capabilities visibly different from pure projection capabilities.

### Status and styling state

Attrs and data hooks that many components repeat:

- `data-open`
- `data-active`
- `data-disabled`
- `data-selected`
- `data-highlighted`
- `data-invalid`
- `data-readonly`
- `data-loading`
- `data-pending`
- `data-completed`
- `data-error`
- `aria-disabled`
- `aria-readonly`
- `aria-invalid`
- `aria-busy`
- `aria-current`

Today, these are split between capabilities and atom-local attrs. A status projection capability could reduce repeated logic across stepper, tabs, accordion, toast, drawer, and form.

### Focused and archetype composition

Layer 2 focused capabilities:

- disclosure pair
- selectable collection
- navigable collection
- filterable collection
- dismissible surface
- labelled field
- validated control
- sortable collection
- virtualized collection
- reorderable collection

Layer 3 archetype bundles:

- modal overlay
- positioned overlay
- listbox
- menu
- tabs
- tree
- grid
- form field
- command palette
- toast/live region
- carousel
- slider
- stepper

Focused capabilities and archetype bundles should remain shallow wrappers over lower-layer capabilities. The individual slots are the real extension seam.

## Gaps and opportunities

### 1. First-class disclosure capability

`createDisclosure` is currently a model, while `triggerContentLink` carries the `Disclosure` surface under the `TRIGGER_CONTENT` slot. That works, but conceptually "disclosure" is broader than "trigger-content relationship".

Potential improvement:

- introduce `DISCLOSURE` as a first-class model slot
- let relationship capabilities require or receive that surface
- let trigger gesture policies work with the disclosure surface, not only overlay-shaped state

This could unify `Collapsible`, `Tree`, `AccordionItem`, `Toast`, and overlays around one open/close vocabulary.

### 2. Disclosure trigger policy

Collapsible, tree, accordion item, and toast close buttons still hand-write click/key handlers.

Potential capability:

- `disclosureTrigger({ keys, disabled, action })`
- projects onto `trigger`, `close`, or custom roles
- emits button semantics, keyboard activation, and guarded open/close/toggle

This should not replace overlay trigger policies immediately. Overlay triggers have extra `aria-haspopup` and disabled semantics. But both could eventually share a lower-level "activation policy" helper.

### 3. Dismissal policy

Escape exists, but outside/backdrop dismissal is atom-local.

Potential capability:

- `dismissPolicy({ escape, outsidePress, backdropPress, disabled, stack })`
- roles: `surface`, `backdrop`, maybe `trigger`
- setup: document pointer listener when outside press is enabled

Immediate users:

- Drawer backdrop
- Popover outside press if added
- Dialog/Drawer close affordances
- Toast dismiss button
- Context menu outside click

### 4. Typeahead and collection search

Dropdown menu and select already have collection, roving, and input. Typeahead is the natural missing layer.

Potential capability:

- `typeaheadCapability(collection, roving, getText, opts)`
- roles: `container`, `trigger`, optionally `input`
- behavior: key buffering, search, goto, timeout cleanup

This belongs beside `navigationCapability`, not inside dropdown/select atoms.

### 5. Status projection

Many atoms repeat active/disabled/error/completed attrs.

Potential capability:

- `statusCapability(surface, map)`
- roles receive a stable set of `data-*` and `aria-*` attrs
- each component supplies accessors: `active`, `disabled`, `invalid`, `completed`, `error`, `open`

This should be used carefully. A generic status capability can become too shallow if callers pass a large map everywhere. It earns its keep when the same status contract appears across multiple component families.

### 6. Field validation capability

Field validation is currently state-local. If the library grows field, input, textarea, select, checkbox, and form-level validation, it may deserve a capability.

Potential capability:

- `validationCapability(model)`
- surface: errors, pending, touched, dirty, validate
- roles: `control`, `label`, `description`, `error`
- attrs: `aria-invalid`, `aria-errormessage`, `aria-describedby`, `data-invalid`, `data-validating`

This would pair naturally with `labelledControl`.

### 7. Tab/panel relationship capability

Tabs currently use selection capability, but tab/tabpanel IDs are mostly atom-local.

Potential capability:

- `tabPanelLink(selection)`
- roles: `item` or `tab`, `content` or `panel`
- attrs: `aria-controls`, `aria-labelledby`, `role=tab`, `role=tabpanel`, `hidden`, `tabindex`

This would make tabs look more like collapsible and tree: selection surface plus relationship capability.

### 8. Layered grid/list/tree capabilities

DataGrid and Tree are under-capabilitized compared with overlays and selects, but the fix should not be "invent grid and tree as low-level primitives." Grid, list, and tree should be Layer 3 archetypes composed from lower-layer capabilities.

Potential low-level primitives they should consume:

- `collectionCapability`
- `selectionCapability`
- `rovingCapability`
- `navigationCapability`
- `typeaheadCapability`
- `triggerContentLink`
- `labelledControl`
- future relationship primitives for row/column/cell and treeitem/group
- future status primitives for active, disabled, expanded, selected, busy, invalid

Potential focused Layer 2 capabilities:

- `selectableCollectionCapability`
- `navigableCollectionCapability`
- `filterableCollectionCapability`
- `expandableCollectionCapability`
- `sortableCollectionCapability`
- `rowColumnRelationshipCapability`

Potential Layer 3 archetype bundles:

- `listboxCapabilities`
- `menuCapabilities`
- `treeCapabilities`
- `gridCapabilities`

Example decomposition:

```ts
const treeCapabilities = ({ collection, disclosure, selection, roving }) => [
	expandableCollectionCapability({ collection, disclosure }),
	selectableCollectionCapability({ collection, selection }),
	navigableCollectionCapability({ collection, roving }),
	treeRelationshipCapability({ collection })
];
```

The design pressure should flow downward. When building `treeCapabilities`, any behavior that also applies to menu, listbox, grid, tabs, accordion, or stepper should be extracted into Layer 1 or Layer 2. The archetype layer should mostly choose defaults and compose slots.

### 9. Metadata for diagnostics

Current diagnostics can list slots and explain role projections. It cannot yet explain intent.

Potential additions to `Capability`:

- `kind`: `model | projection | relationship | policy | effect | bundle`
- `projects`: known role names
- `requiresRoles`: role names expected on the bond
- `conflicts`: slots or roles this capability intentionally replaces
- `docs`: short human-readable summary

This does not need to affect runtime behavior. It would make docs, warnings, and devtools much better.

## Alternative approach

### Do not replace the registry

The tempting alternative is to split capabilities into separate systems:

- models
- behaviors
- effects
- relationships
- policies
- collections

That would make the taxonomy cleaner, but it would lose a major benefit of the current design: one typed registry, one slot conflict rule, one composition language, one setup activation path, one projection seam.

The current registry is the right deep module. It should stay.

### Recommended alternative: layered, faceted capability authoring

Keep `Capability` as the runtime format, but add authoring helpers that make the layer and pattern explicit:

```ts
defineModelCapability({ slot, surface });
defineProjectionCapability({ slot, surface, roles });
defineRelationshipCapability({ slot, roles, requiresRoles });
definePolicyCapability({ slot, roles, setup });
defineEffectCapability({ slot, setup, surface });
defineFocusedCapability({ slot, capabilities });
defineArchetypeCapabilities([capabilityA, capabilityB]);
```

These helpers can all return the current `Capability` shape. The value is not a new runtime; the value is a clearer interface for authors and reviewers.

Benefits:

- new capabilities are easier to classify
- docs can be generated from metadata
- tests can be organized by pattern
- reviewers can catch a model accidentally hiding lifecycle work
- consumers can understand whether a slot is safe to override, decorate, or just read
- high-level component behavior is visibly composed from low-level primitives

### Suggested taxonomy for the repo

Use these names consistently:

- Primitive capability: a Layer 1 capability from the universal UI behavior catalog.
- Model capability: owns or exposes a reusable state surface.
- Projection capability: turns a model into role-specific attrs, handlers, or onmount behavior.
- Relationship capability: links atom roles through IDs and ARIA ownership.
- Policy capability: one replaceable strategy in a family.
- Effect capability: installs whole-bond lifecycle behavior through `setup()`.
- Focused capability: a Layer 2 composition of primitive capabilities into a reusable behavior kit.
- Archetype bundle: a Layer 3 recipe for a recognizable UI pattern.
- Bridge capability: passes a parent-owned capability into child state for local role projection.

This taxonomy fits the code that already exists.

## Migration path

1. Document the taxonomy in `src/lib/shared/capability/README.md`.
2. Split the catalog in docs into Layer 1 primitives, Layer 2 focused compositions, and Layer 3 archetype bundles.
3. Add metadata fields to `CapabilityConfig`, all optional.
4. Add helper builders that return the existing `Capability`.
5. Convert only new capabilities first.
6. Convert high-signal existing capabilities next: relationship, trigger, focus, escape.
7. Add a report/spec test that snapshots `describeCapabilities()` and `explainBondRole()` for representative bonds.
8. Promote disclosure to a first-class primitive capability only after writing the desired call sites for collapsible, tree, accordion item, toast, and overlay.
9. Add one new primitive at a time: dismissal, typeahead, tab/panel relationship, validation.
10. Compose those primitives into focused capabilities before adding new grid/list/tree archetype bundles.

## Decision guidance

Use a capability when:

- behavior crosses more than one atom role
- behavior is shared across component families
- behavior needs replacement by slot
- behavior needs decoration rather than forking
- behavior has whole-bond setup or teardown
- a parent-owned model needs to project into child atoms
- ARIA relationships require sibling IDs

Do not use a capability when:

- the behavior is only one atom's local presentation
- no second adapter or override exists
- the capability would just pass through a single handler
- the caller must provide so many options that the interface becomes as complex as the implementation
- the behavior depends on component-specific private state that cannot be expressed through a narrow surface

## Final recommendation

Treat `src/lib/shared/capability` as the project's behavior protocol layer.

Keep the current runtime shape. It is already deep and productive. The next design move is to make capability patterns explicit, then grow the library from the pattern catalog:

- first-class disclosure
- dismissal policy
- typeahead over collection plus roving
- tab/panel relationship
- validation/field state
- carefully-scoped status projection
- focused collection capabilities
- archetype bundles for listbox, menu, tree, and grid
- richer diagnostics metadata

That serves the goal better than replacing capabilities with more base classes, hooks, or per-component helpers. The whole point of the capability seam is that UI behavior composes across component families. The low-level layer should capture the whole UI universe; the higher layers should be composed recipes with smaller interfaces.

## Appendix: layered capability catalog

Legend:

- Existing: already implemented as a capability or effectively present behind the capability seam.
- Model exists: the model exists, but it is not yet a first-class capability slot.
- Proposed: not implemented yet; extracted from repeated UI/frontend patterns in this repo and the broader UI universe.

### Layer 1 primitive capabilities

Layer 1 capabilities are universal UI behavior atoms. They should be orthogonal, small, and reusable across many component families.

#### State and model primitives

| Capability                | Status                 | Core surface                                         |
| ------------------------- | ---------------------- | ---------------------------------------------------- |
| `collectionCapability`    | Existing               | ordered registered children/items                    |
| `selectionCapability`     | Existing               | selected values and selectedness                     |
| `disclosureCapability`    | Proposed, model exists | open/close/toggle                                    |
| `rovingCapability`        | Existing               | active item/index                                    |
| `inputCapability`         | Existing               | named text fields                                    |
| `checkedCapability`       | Proposed               | checked/unchecked/mixed                              |
| `pressedCapability`       | Proposed               | pressed/unpressed toggle state                       |
| `rangeValueCapability`    | Proposed               | min/max/step/value/percent                           |
| `progressValueCapability` | Proposed               | value/max/percent/indeterminate/completed            |
| `validationCapability`    | Proposed               | errors, invalid, pending, validate                   |
| `loadingCapability`       | Proposed               | pending, settled, error, stale                       |
| `statusCapability`        | Proposed               | active, disabled, readonly, invalid, busy, completed |
| `sortCapability`          | Proposed               | sort key, direction, priority                        |
| `paginationCapability`    | Proposed               | page, page size, total, boundaries                   |
| `viewportCapability`      | Proposed               | viewport size, scroll position, visible range        |
| `geometryCapability`      | Proposed               | element rects, track/thumb geometry, measured sizes  |
| `dateSelectionCapability` | Proposed               | date value, range start/end, visible month           |

#### Role projection primitives

| Capability                       | Status                                                     | Projects                                         |
| -------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| `selectedItemProjection`         | Existing inside `selectionCapability`                      | `item`, `container`                              |
| `activeDescendantProjection`     | Existing inside `rovingCapability` and `inputCapability`   | `container`, `input`                             |
| `inputComboboxProjection`        | Existing inside `inputCapability`                          | `input`                                          |
| `positionalCollectionProjection` | Existing optional collection projection                    | `item`, `container`                              |
| `checkedProjection`              | Existing inside `checkedCapability`                        | checkbox/switch/radio roles                      |
| `rangeProjection`                | Existing inside `rangeValueCapability`                     | slider/scrollbar/spinbutton roles                |
| `progressProjection`             | Existing inside `progressValueCapability`                  | progressbar/meter roles                          |
| `statusProjection`               | Existing inside `statusCapability`                         | generic data/ARIA status attrs                   |
| `orientationProjection`          | Existing as `orientationProjection`                        | horizontal/vertical roles                        |
| `disabledProjection`             | Existing as `disabledProjection`                           | `aria-disabled`, native disabled, tabindex guard |
| `currentProjection`              | Existing as `currentProjection`                            | `aria-current` for step/page/date/nav            |
| `busyProjection`                 | Existing inside `loadingCapability` and `statusCapability` | `aria-busy`, loading hooks                       |

#### Relationship primitives

| Capability                     | Status                                | Relationship                                           |
| ------------------------------ | ------------------------------------- | ------------------------------------------------------ |
| `triggerContentLink`           | Existing                              | trigger controls content                               |
| `labelledControl`              | Existing                              | label/description label a control                      |
| `errorMessageLink`             | Existing                              | error message describes control                        |
| `tabPanelLink`                 | Existing                              | tab controls panel                                     |
| `activeDescendantLink`         | Existing                              | control/container points to active item                |
| `rowColumnRelationship`        | Existing alias of `rowColumnCellLink` | column/header labels row/cell                          |
| `treeGroupRelationship`        | Existing alias of `treeItemGroupLink` | treeitem owns child group                              |
| `menuSubmenuRelationship`      | Existing                              | menuitem controls submenu                              |
| `optionCollectionRelationship` | Existing                              | option belongs to listbox/menu/radio group             |
| `headingSectionRelationship`   | Existing                              | title/description label section/surface                |
| `liveRegionRelationship`       | Existing                              | title/description/content announce through live region |

#### Interaction policy primitives

| Capability             | Status   | Behavior                                    |
| ---------------------- | -------- | ------------------------------------------- |
| `clickTrigger`         | Existing | click/Enter/Space opens or toggles          |
| `hoverTrigger`         | Existing | delayed pointer/focus open and close        |
| `contextMenuTrigger`   | Existing | contextmenu opens                           |
| `manualTrigger`        | Existing | ARIA only, no gesture                       |
| `focusTrigger`         | Existing | focus opens, blur closes or schedules close |
| `activationPolicy`     | Existing | button-like click/keyboard activation       |
| `navigationCapability` | Existing | arrow/Home/End over roving                  |
| `typeaheadCapability`  | Existing | buffered text search through collection     |
| `escapePolicy`         | Existing | Escape strategy for a surface               |
| `dismissPolicy`        | Existing | escape, outside press, backdrop press       |
| `outsidePressPolicy`   | Existing | document pointer down outside target        |
| `backdropPressPolicy`  | Existing | backdrop click/press dismissal              |
| `clearPolicy`          | Existing | clear value/query/selection                 |
| `thumbDragPolicy`      | Existing | drag thumb along a track                    |
| `trackPressPolicy`     | Existing | click/press track moves value/scroll        |
| `resizeHandlePolicy`   | Existing | drag to resize                              |
| `reorderDragPolicy`    | Existing | drag/drop reordering                        |
| `longPressPolicy`      | Existing | press-and-hold action                       |
| `swipePolicy`          | Existing | touch swipe navigation/dismissal            |

#### Whole-bond effect primitives

| Capability                       | Status                        | Effect                                  |
| -------------------------------- | ----------------------------- | --------------------------------------- |
| `focusRestore`                   | Existing inside focus policy  | restore focus after close               |
| `focusTrap`                      | Existing inside focus policy  | trap Tab within a surface               |
| `escapeStack`                    | Existing inside escape policy | topmost overlay coordination            |
| `outsidePressListener`           | Existing                      | global outside pointer listener         |
| `bodyScrollLock`                 | Existing                      | prevent background scroll               |
| `inertSiblings`                  | Existing                      | inert background/sibling roots          |
| `resizeObserverCapability`       | Existing                      | observe element size                    |
| `intersectionObserverCapability` | Existing                      | observe visibility/intersection         |
| `mutationObserverCapability`     | Existing                      | observe DOM mutation                    |
| `mediaQueryCapability`           | Existing                      | subscribe to media query                |
| `reducedMotionCapability`        | Existing                      | expose prefers-reduced-motion           |
| `pointerModalityCapability`      | Existing                      | pointer vs keyboard modality            |
| `scrollMeasurementCapability`    | Existing                      | maintain scroll geometry                |
| `virtualWindowCapability`        | Existing                      | maintain visible range and measurements |
| `documentDragCapability`         | Existing                      | document-level move/up during drag      |
| `portalLayerCapability`          | Existing                      | z-layer, portal host, containment       |

### Layer 2 focused capabilities

Layer 2 capabilities compose Layer 1 primitives into reusable behavior kits. They should still be component-agnostic.

| Capability                        | Status                             | Composes                                                       |
| --------------------------------- | ---------------------------------- | -------------------------------------------------------------- |
| `selectableCollectionCapability`  | Proposed                           | collection + selection + selected item projection              |
| `navigableCollectionCapability`   | Proposed                           | collection + roving + navigation + active descendant           |
| `filterableCollectionCapability`  | Proposed                           | input + collection + filter predicate + roving                 |
| `typeaheadCollectionCapability`   | Proposed                           | collection + text extraction + typeahead + roving              |
| `expandableCollectionCapability`  | Proposed                           | collection + disclosure/expansion + trigger/content links      |
| `sortableCollectionCapability`    | Proposed                           | collection + sort state + sort activation/status               |
| `paginatedCollectionCapability`   | Proposed                           | collection + pagination state + navigation                     |
| `virtualizedCollectionCapability` | Proposed                           | collection + viewport + virtual window + measurement           |
| `reorderableCollectionCapability` | Proposed                           | collection + drag/reorder policy                               |
| `gridNavigationCapability`        | Proposed as focused, not archetype | two-dimensional roving/navigation                              |
| `rowColumnRelationshipCapability` | Proposed                           | row/column/cell relationship primitives                        |
| `disclosurePairCapability`        | Proposed                           | disclosure + trigger/content relationship + activation         |
| `dismissPolicy`                   | Existing                           | escape + outside press + backdrop press + stack                |
| `positionedSurfaceCapability`     | Existing in spirit                 | trigger + focus + escape + positioning host                    |
| `modalSurfaceCapability`          | Existing in spirit                 | focus trap + focus restore + escape + inert/scroll lock later  |
| `labelledFieldCapability`         | Proposed                           | labelled control + disabled/readonly/invalid status            |
| `validatedControlCapability`      | Proposed                           | validation + error link + control status                       |
| `toggleControlCapability`         | Proposed                           | checked state + activation + checked projection                |
| `rangeControlCapability`          | Proposed                           | range value + track press + thumb drag + range projection      |
| `progressIndicatorCapability`     | Proposed                           | progress value + progress projection + status                  |
| `scrollableViewportCapability`    | Proposed                           | scroll measurement + track/thumb geometry + drag policies      |
| `liveRegionCapability`            | Proposed                           | labelled/described content + live region status                |
| `clearableValueCapability`        | Proposed                           | value/input/selection + clear policy + clear button projection |
| `searchableCommandCapability`     | Proposed                           | input + filterable collection + typeahead + selection          |

### Layer 3 archetype capability bundles

Layer 3 bundles are recipes for recognizable UI patterns. They should mostly choose, configure, and compose lower-layer capabilities.

| Bundle                       | Status                              | Lower-layer shape                                                      |
| ---------------------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| `dialogCapabilities`         | Existing in spirit                  | modal surface without trigger                                          |
| `drawerCapabilities`         | Existing in spirit                  | modal surface + backdrop dismissal + side status                       |
| `popoverCapabilities`        | Existing                            | positioned surface + trapped-focus override                            |
| `tooltipCapabilities`        | Proposed                            | positioned surface + hover/focus trigger + no-focus policy             |
| `dropdownMenuCapabilities`   | Existing in spirit                  | popover + navigable collection + menu roles                            |
| `contextMenuCapabilities`    | Proposed                            | positioned surface + contextmenu trigger + menu roles                  |
| `selectCapabilities`         | Existing in spirit                  | dropdown menu + selectable/filterable collection + input clear         |
| `comboboxCapabilities`       | Existing in spirit                  | select + editable value input + clearable value                        |
| `listboxCapabilities`        | Proposed                            | selectable + navigable/filterable collection                           |
| `menuCapabilities`           | Proposed                            | navigable collection + activation + submenu relationships              |
| `treeCapabilities`           | Proposed                            | expandable + selectable + navigable collection + tree relationships    |
| `gridCapabilities`           | Proposed                            | two-dimensional navigation + row/column relationships + selection/sort |
| `tabsCapabilities`           | Proposed                            | selectable collection + tab/panel relationship + activation            |
| `accordionCapabilities`      | Proposed                            | expandable collection + disclosure pair + selection mode               |
| `stepperCapabilities`        | Proposed                            | ordered collection + progress/current status + guarded navigation      |
| `calendarCapabilities`       | Proposed                            | grid navigation + date selection + range status                        |
| `datePickerCapabilities`     | Proposed                            | popover + calendar + combobox trigger + clearable date value           |
| `formCapabilities`           | Proposed                            | field registry + validation orchestration                              |
| `fieldCapabilities`          | Existing in spirit                  | labelled field + validated control                                     |
| `inputCapabilities`          | Proposed archetype wrapper          | labelled/validated control + input value                               |
| `textareaCapabilities`       | Proposed                            | input value + labelled/validated multiline control                     |
| `checkboxCapabilities`       | Proposed                            | toggle control + checked/mixed projection + hidden native input        |
| `switchCapabilities`         | Proposed                            | toggle control + switch projection + hidden native input               |
| `radioGroupCapabilities`     | Proposed                            | selectable collection + checked projection + labelled field            |
| `sliderCapabilities`         | Proposed                            | range control + orientation/status projection                          |
| `progressCapabilities`       | Proposed                            | progress indicator + linear/circular view projection                   |
| `scrollableCapabilities`     | Proposed                            | scrollable viewport + track/thumb roles                                |
| `virtualListCapabilities`    | Proposed                            | virtualized collection + scrollable viewport                           |
| `toastCapabilities`          | Existing in spirit                  | live region + disclosure + dismissible surface                         |
| `alertCapabilities`          | Proposed                            | live region + labelled/described section + optional dismiss            |
| `cardCapabilities`           | Proposed only for interactive cards | labelled section + activation + disabled status                        |
| `sidebarCapabilities`        | Proposed                            | disclosure pair + navigation/menu composition                          |
| `commandPaletteCapabilities` | Proposed                            | modal surface + searchable command collection                          |

### Layer placement rule

If a behavior can apply to three or more archetypes, it belongs in Layer 1. If it composes several primitives but still avoids naming a concrete UI archetype, it belongs in Layer 2. If it names a known UI pattern like tree, grid, tabs, dialog, or combobox, it belongs in Layer 3.
