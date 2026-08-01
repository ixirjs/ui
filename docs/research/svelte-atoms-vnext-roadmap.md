# Svelte Atoms vNext Roadmap

Derived from `docs/research/svelte-atoms-vnext-concept.md`.

**Status:** Phases 0-10 runtime host split, component-owned Atoms, deterministic merge rules, core family migration, public vNext naming docs, and compatibility deprecation markers implemented  
**Date:** 2026-06-28  
**Goal:** Move `@svelte-atoms/core` from the current `Atom / Bond / BondState / legacy Bond-owned Atom` model to a smaller public runtime model:

```text
Atom Component
Atom
Bond
Capability / Particle
```

The roadmap is intentionally incremental. Existing components should keep working while the internals move from Bond-owned atom factories toward component-owned `Atom`s registered with `Bond`.

---

## Guiding Decisions

- `Atom` replaces `legacy Bond-owned Atom` as the runtime atom/controller name.
- Atom components create their own `Atom`s.
- `Bond` owns shared state, context, registered Atoms, and compound coordination.
- `BondState` is merged into `Bond` as a public concept.
- `BondState` may remain as a compatibility wrapper or internal helper while existing components migrate.
- Capabilities install on two public hosts: `Atom` and `Bond`.
- Bond capabilities can be state-focused, coordination-focused, or effectful.
- Registered node lookup should use `bond.node()` / `bond.nodes()` so `bond.atom()` can remain a legacy factory during migration.

---

## Phase 0: Baseline and Safety Rails

- [x] Capture current behavior tests for `Bond`, `BondState`, and `legacy Bond-owned Atom`.
- [x] Identify all public exports that mention `BondState`, `legacy Bond-owned Atom`, `legacy fallback Atom`, `Bond.atom()`, and generated part methods such as `root()`, `trigger()`, and `content()`.
- [x] Inventory components by migration risk:
  - [x] Low risk: simple compounds such as `Collapsible`, `Tabs`, `AccordionItem`.
  - [x] Medium risk: `Dialog`, `Popover`, `DropdownMenu`, `Select`.
  - [x] High risk: `Combobox`, `ContextMenu`, `Datagrid`, `Portal` / overlay host.
- [x] Preserve known invariants before touching implementation:
  - [x] Attachment keys must be stable across `spread` reads.
  - [x] Event handlers must compose predictably.
  - [x] Existing `legacy Bond-owned Atom` subclasses must keep working.
  - [x] Capabilities with whole-bond setup must still clean up in reverse order.

**Implementation notes:** public export and call-site inventory was checked with `rg` across `src/lib`
and the existing safety coverage was rerun before changes. Focused verification covered
`bond.svelte.spec.ts`, `spread.svelte.spec.ts`, `behavior.svelte.spec.ts`, and
`capability/use.svelte.spec.ts`.

**Done means:** the existing behavior is pinned well enough that compatibility regressions are visible.

---

## Phase 1: Introduce `Atom` Behind `legacy Bond-owned Atom`

- [x] Add `Atom` as the new bond-optional runtime atom/controller class.
- [x] Move shared `legacy Bond-owned Atom` behavior into `Atom`:
  - [x] id generation
  - [x] element capture
  - [x] attrs / handlers / attachments
  - [x] stable attachment keys
  - [x] `spread`
  - [x] lifecycle cleanup
- [x] Keep `legacy Bond-owned Atom` as a compatibility subclass or alias.
- [x] Mark `legacy Bond-owned Atom` as deprecated in docs only at first.
- [x] Keep `legacy fallback Atom` working as the fallback for legacy `Bond.atom()`.
- [x] Add tests proving:
  - [x] `Atom` can exist without a `Bond`.
  - [x] `legacy Bond-owned Atom` preserves current behavior.
  - [x] `legacy Bond-owned Atom.spread` does not remint attachment keys.

**Done means:** new code can use `Atom`; old code can keep using `legacy Bond-owned Atom`.

---

## Phase 2: Add Registered Node APIs to `Bond`

- [x] Add explicit registration:
  - [x] `bond.register(node)`
  - [x] `bond.unregister(node)`
  - [x] registration cleanup returned from `register`
- [x] Add lookup APIs:
  - [x] `bond.node(key)`
  - [x] `bond.nodes(kind?)`
  - [x] optional lookup by role / part when capabilities provide role metadata
- [x] Support single and many cardinality.
- [x] Add dev warnings for duplicate single-node registration.
- [x] Keep legacy `bond.atom(key)` as the factory/cache path.
- [x] Rename the internal factory path to make intent clear:
  - [ ] `legacyAtom`
  - [x] `createLegacyAtom`
  - [ ] or equivalent private helper
- [x] Add tests for:
  - [x] register / unregister
  - [x] duplicate single registration
  - [x] many-node lookup
  - [x] legacy factory compatibility

**Done means:** `Bond` can coordinate component-created `Atom`s without relying on factory ownership.

---

## Phase 3: Merge `BondState` Into the `Bond` Authoring Model

- [x] Add a `Bond<Props>` authoring path where `Bond` directly owns:
  - [x] `props`
  - [x] derived values
  - [x] mutation methods
  - [x] capability registry
  - [x] context sharing
  - [x] node registry
- [x] Preserve DOM-free state testing:
  - [x] a `Bond` should be constructible and testable without mounted nodes
  - [x] state-focused capabilities should not require DOM
- [x] Keep `BondState` compatibility:
  - [x] existing `new Bond(new BondState(props))` style keeps working
  - [x] old state classes can be adapted into the merged Bond model
  - [x] exports remain stable during the compatibility period
- [x] Move capability token lookup to `Bond`:
  - [x] `bond.get(token)`
  - [x] `bond.require(token)`
- [x] Add tests for merged Bond state behavior.

**Done means:** new components can create one `Bond`, not a separate `BondState` plus `Bond`.

---

## Phase 4: Add `createAtomInstance()` / `createAtomInstance()` for Svelte Parts

- [x] Add the Svelte-facing helper that creates an `Atom` from a component.
- [x] Decide final helper name:
  - [x] `createAtomInstance`
  - [x] `createAtomInstance`
  - [x] both, with one lower-level than the other
- [x] Helper responsibilities:
  - [x] create node once per component instance
  - [x] install Atom capabilities
  - [x] register with optional or required Bond
  - [x] unregister on destroy
  - [x] preserve stable spread behavior
- [x] Add required / optional Bond helpers:
  - [x] `DialogBond.required()`
  - [x] `DialogBond.optional()`
  - [x] component-specific dev error messages
- [x] Add tests for Svelte lifecycle registration and cleanup.

**Done means:** part components have a small, repeatable authoring pattern for component-owned atoms.

---

## Phase 5: Split Capability Hosts Into `Atom` and `Bond`

- [x] Define Atom capability shape.
- [x] Define Bond capability shape.
- [x] Preserve or adapt existing capability metadata:
  - [x] layer
  - [x] kind
  - [x] projects
  - [x] requires
  - [x] conflicts
- [x] Classify the existing state/model capability catalog as Bond-hosted capabilities:
  - [x] `openable` via `disclosureCapability`
  - [x] `controllable` through the merged `Bond` props/capability facade and existing input/value model capabilities
  - [x] `selectable` via `selectionCapability`
  - [x] `disabled` via status/disabled projection capabilities
  - [x] `checked`
  - [x] `rangeValue`
  - [x] `collection`
- [x] Classify the existing relationship/effect capability catalog as Bond-hosted capabilities:
  - [x] `focusScope` through the existing focus policy/effect catalog
  - [x] `dismissableLayer` through dismissible surface / outside press / backdrop / escape capabilities
  - [x] `rovingFocus`
  - [x] `typeahead`
  - [x] `ariaLabelRegistry` through labelled/relationship capabilities
  - [x] `escapeKeyStack`
  - [x] `popperPositioning` through existing positioning/geometry surfaces
- [x] Add Atom capabilities:
  - [x] `elementRef`
  - [x] `pressable`
  - [x] `focusable`
  - [x] `dataState`
  - [x] `ariaRole`
  - [x] `motion`
- [x] Keep existing role projection working while new host APIs mature.

**Implementation notes:** `Capability` is now the compatibility name for `BondCapability`, with
`defineBondCapability` as an explicit alias for the existing bond-hosted authoring path.
`defineAtomCapability` adds the atom-hosted shape, and `Atom` now supports
`node.capability(key)`, `node.get(key)`, `node.require(key)`, and `node.describeCapabilities()`.
`createAtomInstance` accepts public Atom capabilities and handles setup teardown. The concrete
Atom primitive catalog now includes `elementRef`, `pressable`, `focusable`, `dataState`,
`ariaRole`, and `motion`. Some concept names in the original roadmap remain mapped to existing
capability families instead of being renamed wholesale, to avoid churn before the component
migration phases.

**Done means:** reusable behavior no longer depends on `BondState` as a public host.

---

## Phase 6: Define Deterministic Merge Rules

- [x] Implement and test attribute merge rules:
  - [x] `id`: single owner with explicit user override
  - [x] `class`: merge
  - [x] `style`: merge with later property wins
  - [x] `data-*`: merge, warn on conflicting dev values
  - [x] `aria-*`: merge when safe, warn on conflict
  - [x] `role`: exclusive, warn or error in dev
  - [x] `disabled` / `inert` / `hidden`: true wins
- [x] Implement and test handler composition.
- [x] Decide and document handler order:
  - [x] recommended: user handler first, then internal unless default prevented
- [x] Implement and test attachment composition:
  - [x] element ref mounts first
  - [x] user attachment cleans up first
  - [x] element ref cleans up last
- [x] Add dev diagnostics for capability conflicts.

**Implementation notes:** `shared/bond/merge.ts` is the deterministic spread rulebook used by
`Atom` behavior folding and bonded component `mergeAtomProps(...)`. Internal behavior cannot
steal a generated node `id`; explicit user props can override it. Event handlers compose as user/base
first, then internal/later behavior only when the event is not `defaultPrevented`. Attachments compose
base first and clean up in reverse order, preserving element capture as the first mount and last
cleanup. `BondState` now validates `meta.conflicts` for registered slot conflicts and advertised role
projection conflicts during the existing deferred capability validation pass.

**Done means:** capability composition is predictable enough for broad component migration.

---

## Phase 7: First Component Pilot

Start with one small compound component before touching overlays.

Recommended pilot: `Collapsible`.

- [x] Convert root to create one merged `CollapsibleBond`.
- [x] Convert parts to create local `Atom`s.
- [x] Register atoms with `bond.register`.
- [x] Replace `legacy Bond-owned Atom` subclass behavior with capabilities where obvious.
- [x] Remove old part methods as adapters for the pilot:
  - [x] `bond.root()`
  - [x] `bond.header()`
  - [x] `bond.body()`
  - [x] `bond.indicator()`
- [x] Add tests that the old part-method adapters are absent.
- [x] Add new authoring tests for component-owned atoms.

**Implementation notes:** the rendered `Collapsible` parts create local atoms with
`createAtomInstance`, register them with the bond, and opt out of generated `bond.header()`-style
part-method adapters. The root now uses the generated `CollapsibleBond.create(props)` path with
`CollapsibleState` declared on the bond spec, so component roots construct one merged bond through the
public authoring API. Header/body/indicator presentation moved into Atom capabilities installed
by the component-owned node classes. Parent-context capture is tolerant outside component
initialization so `CollapsibleBond.create(...)` remains DOM/context-free in tests.

**Done means:** one real component proves the migration shape without breaking old users.

---

## Phase 8: Migrate Core Compound Families

Migrate from lower-risk to higher-risk families.

- [x] `Accordion` / `AccordionItem`
- [x] `Collapsible`
- [x] `Tabs` / `Tab`
- [x] `Stepper` / `Step`
- [x] `FormField`
- [x] `Dialog`
- [x] `Popover`
- [x] `DropdownMenu`
- [x] `Select`
- [x] `Combobox`
- [x] `ContextMenu`
- [x] `Portal` / overlay host
- [x] `Datagrid`

For each family:

- [x] root creates one merged Bond
- [x] behavior/state coordination lives on the Bond class, not an exported component-specific `BondState`
- [x] rendered parts create local Atoms
- [x] nodes register and unregister with Bond
- [x] `legacy Bond-owned Atom` is not used for new family internals
- [x] `bond.atom()` and generated part methods remain only as legacy adapters
- [x] duplicated subclass behavior moves into capabilities
- [x] stories and docs continue to render (`npm run build`, `npm run storybook:build`)
- [x] accessibility tests still pass (`npm run test:unit -- --run`, `npm run test:e2e`)

**Done means:** component-owned Atoms are the internal default.

**Implementation notes:** The shared authoring/runtime seam now accepts `Atom` constructors in
`defineBond({ atoms })`, `AtomConstructor`, `AtomSpec`, `AtomFactory`, and `AtomRegistry`.
`bond.atom()` is typed as returning an `Atom`, while `legacy fallback Atom` remains the legacy fallback
for missing keys and `legacy Bond-owned Atom` remains exported as a deprecated compatibility subclass.

`Accordion` / `AccordionItem` now follow the Phase 8 compatibility shape. Roots create merged bonds,
rendered parts create local atoms with `createAtomInstance`, and those nodes register/unregister with
the bond. The old generated `bond.root()`, `bond.header()`, `bond.body()`, and `bond.indicator()`
factory methods remain present as adapters, but the Svelte parts no longer depend on them
internally. Header/body/indicator/root behavior moved from subclass overrides into node
capabilities. The later Bond-owned correction moved the parent accordion selection/item collection
and child item disclosure/open-close behavior from `AccordionState` / `AccordionItemBondState` onto
`AccordionBond` / `AccordionItemBond` base classes; those component-specific state classes are no
longer part of the family.

The completed Phase 8 pilots (`Accordion` / `AccordionItem`, `Collapsible`, `Tabs` / `Tab`,
`Stepper` / `Step`, `FormField`, `Dialog`, `Popover`, `DropdownMenu`, `Select`, `Combobox`,
`ContextMenu`, and `Portal` / overlay host) use concrete node classes that extend `Atom`, not
`legacy Bond-owned Atom`. Their focused node specs assert registered Atoms and generated adapter return values
are `Atom` instances and not `legacy Bond-owned Atom` instances; search guard for the implementation: no
`extends legacy Bond-owned Atom` in those family directories.

`Tabs` now follows the same Phase 8 compatibility shape for both the parent `Tabs` bond and child
`Tab` bond. `Tabs.Root` and `Tab.Root` default to `TabsBond.create(props)` /
`TabBond.create(props)`, rendered parent and child parts create local atoms, and generated
`tabs.root()` / `tabs.header()` / `tabs.body()` plus `tab.header()` / `tab.body()` /
`tab.description()` remain as adapters. Parent header lookup prefers the registered header node so
child tab headers can portal without forcing the legacy factory path. The later Bond-owned
correction moved parent selection/content collections and child tab selection/active-state behavior
from `TabsBondState` / `TabBondState` onto the `TabsBond` / `TabBond` base classes; those
component-specific state classes are no longer part of the family.

`Stepper` now follows the Phase 8 compatibility shape for the parent `Stepper` bond and child `Step`
bond. `Stepper.Root` and `Step.Root` default to `StepperBond.create(props)` /
`StepBond.create(props)`, rendered step parts create local atoms, and `Step.Root` registers the real
child bond with the parent stepper collection. The generated `stepper.root()` plus `step.root()` /
`step.indicator()` / `step.header()` / `step.title()` / `step.description()` / `step.body()` /
`step.separator()` methods remain as adapters, while the Svelte parts use registered Atoms and node
capabilities internally. The later Bond-owned correction moved parent navigation/step/content
collections and child step status/parent wiring from `StepperState` / `StepBondState` onto the
`StepperBond` / `StepBond` base classes; those component-specific state classes are no longer part
of the family.

`FormField` now follows the Phase 8 shape for both `Form` and `Field`. `Field.Root` defaults to
`FieldBond.create(props)`, rendered label/control/helper-text parts create local atoms with
`createAtomInstance`, and generated `field.root()` / `field.label()` / `field.control()` /
`field.description()` remain as adapters. Field validation/status and form field collection
coordination moved from `FieldBondState` / `FormBondState` onto `FieldBond` / `FormBond`; those
component-specific state classes are no longer part of the family.

The duplicated subclass projection pass moved the remaining Phase 8 `attrs` / `handlers` /
`onmount` behavior into Atom capabilities for accordion root, modal/dialog parts, popover,
dropdown-menu, select, combobox, and datagrid row/column state projections. Remaining subclass
overrides are intentional identity/surface exceptions: portal root owns its externally supplied
DOM id, rendered menu/select items own their custom option ids, and the popover virtual trigger owns
an empty spread for virtual positioning.

`Dialog` now owns overlay lifecycle through `DialogBond` / `OverlayBond`, not `DialogBondState`.
`Dialog.Root` defaults to `DialogBond.create(props)`, rendered root/content/header/title/
description/body/footer/close parts create local atoms with `createAtomInstance`, and generated
`dialog.root()` / `dialog.content()` / `dialog.closeButton()`-style methods remain as legacy
adapters. `dialog.close()` is now the dialog lifecycle command on the bond. Dialog-specific node
classes now extend `Atom`; the fused `PopoverDialog` bridge keeps its legacy overlay state
until the Popover slice is migrated.

`Popover` now owns disclosure and floating-position coordination on `PopoverBond` /
`PopoverBondBase`: `position`, `tracking`, `computed`, `notifyComputed(...)`, and
`shouldTrackPosition` moved off the runtime state path. `Popover.Root` defaults to
`PopoverBond.create(props)`, and rendered trigger/content/overlay/arrow/indicator parts create
local `Atom`s with `createAtomInstance`. Generated `popover.trigger()` /
`popover.content()` / `popover.overlay()` / `popover.arrow()` / `popover.indicator()` methods
remain as legacy adapters. `PopoverState` remains only as a deprecated compatibility shim for old
user code; `DropdownMenu`, `Select`, and `Combobox` no longer depend on it internally.

`DropdownMenu`, `Select`, and `Combobox` now continue that bond-owned overlay chain.
`DropdownMenuBondBase` owns roving focus, typeahead, and item registration; `SelectBondBase` owns
selection/query/label coordination; `ComboboxBondBase` owns the independent query/value input model
and free-text selections. Their roots default to `*.create(props)`, rendered item/control nodes use
`Atom` via `createAtomInstance`, and their old component-specific state class exports were removed
from the migrated surface. The reused Popover part components now instantiate rendered nodes through
the composed bond's atom registry, so `DropdownMenu.Trigger` / `DropdownMenu.Content` and
`Select.Content` render their specialized Atom classes instead of the base Popover nodes.
`Select.Placeholder`, `Select.Query`, and `Combobox.Control` also create/register local Atoms
instead of calling generated factory adapters. Generated part methods remain only as legacy adapters.

`ContextMenu` now has its own `ContextMenuBond` / `ContextMenuBondBase` identity over the
`DropdownMenu` part chain instead of resolving a dropdown bond directly. `ContextMenu.Root` defaults
to `ContextMenuBond.create(props)`, shares the composed dropdown/popover contexts, and
`ContextMenu.Trigger` registers the cursor-positioned virtual trigger as a component-owned
`PopoverVirtualTriggerAtom` with `createAtomInstance` instead of calling `bond.atom('virtual-trigger')`.
Right-click opening and outside dismissal use the overlay bond policies, keeping state coordination
on the bond.

`Portal` now uses `PortalBond` / `PortalBondBase` directly, with no `PortalState` class in the
runtime construction path. `Portal.Outer` and `Portal.Inner` create/register component-owned
`PortalRootAtom` and `PortalInnerAtom` nodes, while `portal.root()` / `portal.inner()` remain as
legacy adapters. The overlay host half now keeps modal root/content atoms on `Atom`, removes the
internal `OverlayPortalState` helper, and resolves focus-restore targets through registered overlay
nodes before falling back to legacy atom factories.

---

## Phase 9: Documentation and Public Naming

- [x] Update core concept docs to use:
  - [x] Atom Component
  - [x] Atom
  - [x] Bond
  - [x] Capability / Particle
- [x] Move `BondState` to compatibility docs.
- [x] Explain that Bond capabilities can be:
  - [x] state-focused
  - [x] coordination-focused
  - [x] effectful
- [x] Add before / after migration examples.
- [x] Add capability authoring guide.
- [x] Add required vs optional Bond guide.
- [x] Add registry guide for `bond.node()` / `bond.nodes()`.
- [x] Add deprecation notes for `legacy Bond-owned Atom` and Bond-owned atom factories.

**Implementation notes:** The public Bonds guide now teaches the vNext model first: Atom
Components render local `Atom`s with `createAtomInstance`, `Bond` owns shared state/context/
capability lookup/registered Atoms, and Capability / Particle is the reusable behavior unit. The
Extending guide and both LLM text exports were rewritten to use the same vocabulary, including
required vs optional Bond helpers, registry lookup via `bond.node()` / `bond.nodes()`, Bond and
Atom capability examples, and a before/after migration example from `legacy Bond-owned Atom` factories to
component-owned atoms. `BondState`, `legacy Bond-owned Atom`, `legacy fallback Atom`, `bond.atom(...)`, and generated
part methods are documented as compatibility APIs rather than the default authoring path. README,
docs landing metadata, Atom component reference metadata, philosophy copy, styling/preset wording,
and shared runtime READMEs were also updated to avoid teaching `BondState` as a required public
concept.

**Done means:** docs teach the new model without requiring readers to learn `BondState`.

---

## Phase 10: Deprecation and Cleanup

- [x] Type-deprecate `legacy Bond-owned Atom`.
- [x] Type-deprecate public Bond-owned atom factory methods where possible.
- [x] Type-deprecate `BondState` as a public authoring primitive.
- [x] Add dev warnings only after internal migrations are complete.
- [x] Remove internal use of legacy factories from migrated vNext node lookups where possible.
- [x] Remove or fully internalize `legacy Bond-owned Atom` in the next major.
- [x] Remove or fully internalize `BondState` in the next major.
- [x] Keep a migration guide for downstream component authors.

**Implementation notes:** `legacy Bond-owned Atom` was removed from the runtime surface; remaining component
internals that still subclassed it now extend `Atom` directly. `legacy fallback Atom` is an internal
fallback node for `Bond.atom(key)` rather than a public shared export. `BondState` remains as the
internal state/capability host used by the non-published `shared/bond` implementation, but it is no
longer re-exported from the public `shared` barrel. `Bond.atom(key)` is still type-deprecated and
emits a once-per-bond/key dev warning that points authors toward component-owned `Atom`s,
`createAtomInstance(...)`, `bond.register(...)`, and `bond.node(...)` / `bond.nodes(...)`. Generated
part methods from `defineBond({ atoms })` remain type-deprecated compatibility adapters over the
legacy atom factory path.

Mature vNext internals that were still using factory fallbacks for node lookup were tightened:
`TabsBond.headerElement` and `PortalBond.boundaryElement` now resolve registered Atoms only. The
legacy factory path remains intentionally available for user compatibility, tests, adapter methods,
and older/non-vNext families that have not been folded into this roadmap slice.

**Done means:** the old public model is compatibility-only, and the codebase itself uses the vNext model.

---

## Validation Gates

Do not advance past a phase if these fail:

- [ ] Existing test suite passes.
- [ ] Type checking passes.
- [ ] `Atom.spread` attachment stability remains covered.
- [ ] Public imports match the alpha vNext surface.
- [ ] At least one old-style and one new-style authoring test cover the same component.
- [ ] Docs examples match the current intended authoring surface.

---

## Recommended First Slice

1. Add `Atom` behind `legacy Bond-owned Atom`.
2. Add `bond.register`, `bond.node`, and `bond.nodes` without changing existing `bond.atom` behavior.
3. Add tests for independent `Atom` and registered Atoms.
4. Convert `Collapsible` as the first pilot.
5. Only after the pilot, finalize the helper name and capability host details.
