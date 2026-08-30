# ADR 0008: Public contract and authoring seams

## Status

Accepted for package layering. [ADR 0009](./0009-native-renderer-and-lazy-runtime-kernel.md)
supersedes its rendering, descendant-authoring, and retired low-level public surfaces.

**Superseded again, 2026-08-27, by the whiteboard migration** (`docs/research/whiteboard-2026-08.md`,
`docs/research/whiteboard-migration-recipe.md`): every component family now authors through the
redesigned Kernel, and the Bond/Atom runtime the sections below describe has been deleted. Read
"Authoring after the whiteboard migration" for what replaced it. The package layering this ADR fixes
is still current; `usePart`, `definePart`, `useRoot`, `defineBond` and `createAtomInstance` are all
historical.

## Date

2026-07-15

## Context

The library has a strong runtime architecture: Bonds coordinate shared state, Atoms own
rendered parts, capabilities compose behavior, and presets provide context-scoped presentation.
The current worktree, however, exposes several different levels of that implementation as if they
were equally stable. Component families also use different presentation, callback, typing, and
authoring conventions.

The goal is a pre-1.0 cleanup that improves ease of use, consistency, and flexibility without
throwing away the deep runtime seams. The package must make the common path small and predictable
while preserving an expert path for replacing or extending internals.

## Decision

### Package layers

The package has the following target layers:

| Entry point                         | Audience                                              | Contract                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `@ixirjs/ui`                        | Application consumers                                 | Components, namespaces, semantic props, snippets, and `setPreset`.                                                              |
| `@ixirjs/ui/components/<component>` | Application consumers and component-level integrators | The component's public parts, props, snippets, and documented semantic extension points.                                        |
| `@ixirjs/ui/preset`                 | Application and theme authors                         | Typed preset records, module augmentation, fallback composition, and registration.                                              |
| `@ixirjs/ui/utils`                  | Application authors                                   | Small, stable utility functions only.                                                                                           |
| `@ixirjs/ui/shared`                 | Library authors                                       | Stable factory-based authoring SDK: definitions, narrow handles, capabilities, roles, models, and sanctioned lifecycle helpers. |
| `@ixirjs/ui/experimental`           | Expert/library authors                                | Concrete runtime classes, raw definitions, registries, lifecycle administration, and implementation-level escape hatches.       |

`/experimental` is an intended package seam for the migration missions that follow. Until that
seam is published, current `/shared` exports are classified below so additions and removals can be
reviewed against the target rather than treated as accidental stability promises.

Application consumers must not need to import Bond, Atom, registry, or lifecycle administration.
Stable authoring concepts are created by factories and discovered through narrow, keyed surfaces;
consumers should not implement runtime protocols directly.

Component-level entries are published through the constrained `./components/*` export pattern.
`src/lib/public/components/` is the allowlist: adding a facade there intentionally creates the
matching package subpath while implementation directories remain encapsulated.

### Presentation

There is one presentation contract and one resolver/fold implementation. It is adapted to two
rendering modes:

1. `HtmlAtom` is the full adapter. It owns Bond context, Atom identity, attachments, lifecycle,
   polymorphism, and the presentation spread.
2. A lightweight native/SVG adapter is allowed where full Atom machinery is unnecessary, but it
   delegates to the same resolver and fold implementation. It does not define a second preset
   language or precedence rule.

Every preset-aware rendered part follows this observable order:

```text
defaults → preset → variants/compounds → resolved presentation → consumer props
```

The contract includes:

- `class`, `attrs`, defaults, variants, compounds, and render-target resolution;
- reactive preset entries and fallback keys;
- consumer classes and explicit consumer props winning at the documented final stage;
- `'$preset'` being interpreted only by preset-aware adapters and never leaking to a native DOM
  node;
- one public, augmentable `PresetModuleMap`/`PresetKey` declaration source.

### Authoring

- Static modules use the shared presentation helpers or lightweight adapter.
- Bonded roots use `useRoot` and `createAtomInstance`.
- Ordinary declared descendants use `usePart`.
- Repeated/data-driven parts use direct `createAtomInstance` with explicit cardinality.
- **Card and Accordion are authored on the redesigned Kernel** (2026-08-26,
  `docs/research/whiteboard-2026-08.md`): `Kernel.element`/`render`/`context`/`id` over plain
  state classes that keep the `CardBond`/`AccordionBond`/`AccordionItemBond` names and surfaces
  (`{ card }`, `getBond`, `factory`, `create`). `Factory<T>` no longer requires a `Bond`. A
  preset's `render.as`/`render.base` is honoured by every part that dispatches through
  `Kernel.render` (`AccordionItem.Root` does; Card's parts are literal elements and DEV warns when a
  theme targets one); composability is per part, `as`/`base` where a part offers them. Other
  families migrate the same way, one at a time, behind their existing surfaces.
- A presentation-free descendant may be its own element — a literal tag spreading
  `node.spread()` with no `{@render}` dispatch. Such a part's props are `PlainPartProps`, which
  types `as`, `base`, motion and the renderer lifecycle attributes `never`: the dispatch existed to
  honour them, and dropping it is a block, a branch and a hydration anchor per part (card −13…15%
  on mount, 2026-08-25). Card's seven parts take this shape; a family adopts it per part, and the
  removal of `as`/`base` on a part is a public-contract change recorded here.
- The same shape applies to a **root** on either lane — `Card.Root` (class-only lane),
  `DataGrid.Row`, `Tree.Root`/`Tree.Header`/`Tree.Body` and `AccordionItem.Root` are their own
  `<div>` (2026-08-25, `PlainPartProps`): no `as`, no `base`, no motion, no renderer lifecycle
  attributes on those parts. `AccordionItem.Header` (polymorphic `as="button"`) and
  `AccordionItem.Body` (real enter/exit transitions) keep the dispatch. A root's own element still
  resolves fully when its source is rich (`variants`, `presetLayer`, a function preset).
- An Atom declares whether it captures its element: `static capturesElement = false` on a class,
  `captures: false` in a `defineAtom` spec. Nothing in the public contract reads a part's `.element`
  that its rendered `id` cannot find.
- `Bond.isSettled` is public: false during the root's synchronous mount, true from the following
  microtask. A recipe reads it to skip an enter animation for a part that was open at mount
  (`AccordionItem.Body`).
- Cross-part behavior is a Bond capability, not a root-level effect or hand-wired relationship.
- Generated detached-Atom methods and `bond.state` are compatibility paths only and are removed
  before 1.0.

### Authoring after the whiteboard migration (2026-08-27)

Every family is a `bond.svelte.ts` of plain state classes published under `Kernel.context(...)`, and
every part calls `Kernel.element(() => props, spec)` and either spreads `el.attrs` on a literal tag
or binds one leaf (`const leaf = Kernel.render(el)`) and renders it. There is one authoring seam.

**Removed from the published surface (a major break, decided 2026-08-27).** `@ixirjs/ui/shared` no
longer exports `defineBond`, `useRoot`, `controlledProp`, `createAtomInstance`, `BondHandle` or
`AtomHandle`; `@ixirjs/ui/experimental` no longer exports `Bond`, `Atom`, `defineAtom`, `bindBond`,
`BondBinding`, `Collection`, the prop-cell types, the definition/spec types, or the six popover
`*Atom` classes. A family authored against them does not compile; the replacement is a plain class
plus `Kernel.element`, and the shape is documented in the migration recipe. `@ixirjs/ui/shared` gains
`Kernel` and `ElementSpec`.

**Removed from every part's prop contract.** Symbol-keyed lifecycle keys (`createLifecycleKey`,
`mount`/`destroy`) are gone: they never survived server `rest_props`, no first-party part used them,
and `oninit` — which fires on both platforms — covers the case.

**Kept, and re-implemented in the Kernel where the redesign had dropped them** (each was found by an
existing gate during the migration, and each applied library-wide, so each is fixed once, in
`kernel.svelte.ts`, not per part): `oninit`; a consumer's `motion`/`initial`/`enter`/`exit`/`animate`
on a part that declares none of its own; a preset-declared `motion`; `defaults` as lowest-precedence
author attributes; and a string `part` as the CSS shadow-parts attribute.

**Measured costs of the redesign, pinned rather than hidden.** A function-form preset entry resolves
twice per part on mount — once at init to read `render.as`/`render.base`, once inside the tracked
memo, which is what subscribes the part to what that entry reads — and a class-only part re-resolves
when an unrelated attribute changes, because the Kernel assembles its attrs object inside the memo
instead of passing the rest-props proxy through by reference. `kernel/render/resolve-count.svelte.spec.ts`
holds both numbers and the reasoning.

**A repeated part claims its id.** Ids derive from the family's seed, so two `<Dialog.Header>`s under
one root would render the same id; `Kernel.claimId(bond, seed, part)` gives the first instance the
canonical id and later ones the lowest free suffix, released on teardown. Deterministic across SSR
and hydration, because both passes initialise in document order.

### State and callbacks

Bindable props remain the controlled/uncontrolled transport. Semantic callbacks use one shape:

```ts
(value, { event?, bond?, reason? }) => void
```

The callback name identifies the state transition (`onopenchange`, `onvaluechange`,
`oncheckedchange`, `onquerychange`, and so on). Native DOM callback names retain native event
semantics and are never repurposed with custom payloads. Semantic callbacks run after the Bond has
committed the new value and do not fire merely because a root initialized.

### Local customization

Compound parts remain directly configurable. Static multi-part modules expose typed snippets for
fixed internal slots (for example, a Switch thumb or Slider thumb/track). A replacement snippet
receives the resolved semantic and presentation props, so replacing markup does not bypass preset
attrs, variants, ARIA, or state data.

### Public behavior versus implementation detail

The following are public contract and must be executable-test-backed:

- exported names and package subpaths;
- prop, snippet, callback, and factory types;
- semantic DOM roles and relationships;
- documented `data-*`/`aria-*` state output;
- presentation precedence and class/attribute merge behavior;
- Atom spread identity and lifecycle guarantees explicitly documented in `CONTEXT.md`;
- controlled-state callback timing and value/context semantics.

The following remain reserved implementation details unless a component explicitly documents them:

- Bond/Atom concrete class layout;
- registry data structures and microtask implementation;
- capability setup ordering internals (the dependency/teardown behavior remains contract);
- generated source anatomy and private metadata;
- exact DOM wrappers, private class names, and unlisted diagnostics.

## Current `/shared` classification

This table records the target seam for the names below, not a promise that every current export is
already in its final location. It is not exhaustive — `docs/public-surface.snapshot.json` is the
mechanical list, and `public-surface.spec.ts` is what enforces it.

**Removed, pre-1.0:** the `checked`, `progress`, `range` and `role-projections` capability models
(`CHECKED`, `createChecked`, `checkedCapability`, `PROGRESS_VALUE`, `createProgressValue`,
`progressValueCapability`, `RANGE_VALUE`, `createRangeValue`, `rangeValueCapability`,
`ORIENTATION_PROJECTION`, `DISABLED_PROJECTION`, `CURRENT_PROJECTION`, `orientationProjection`,
`disabledProjection`, `currentProjection`, and their option/backing types). They were published as
stable seams that no component in the library ever composed — Progress, Slider, Checkbox, Switch and
Radio are all static modules with no Bond. Publishing a model no first-party family uses commits the
project to a shape that was never validated against a real consumer, which is the opposite of what
this ADR's stability rule is for. Reinstate them from a family that actually needs them, not ahead
of one.

### Stable `/shared` target

- **Authoring:** `createAtomInstance`, `defineBond`, `usePart`, `useRoot`, `BondOf`,
  `PropsOf`, `UsedPart`, `UsePartOptions`, `internCapabilityFactory`.
- **Motion primitives:** `animate`, `DURATION`, `Easing`.
- **Capability construction:** `capabilityKey`, `sharedCapabilityKey`, `CapabilityKey`, `SurfaceOf`,
  `defineBondCapability`, `defineAtomCapability`, `roles`, `customRole`, `Role`.
- **Capability models:** `createInput`, `inputCapability`, `INPUT`, `createDisclosure`,
  `disclosureCapability`, `disclosureTrigger`,
  `disclosureClose`, `disclosureToggle`, `DISCLOSURE`, `collectionCapability`, `collectionSlot`,
  `createSelection`, `selectionCapability`, `SELECTION`, `createRovingFocus`, `rovingCapability`,
  `ROVING`.
- **Relationships and atom behaviors:** `triggerContentLink`, `labelledControl`, `tabPanelLink`,
  `errorMessageLink`, `elementRef`, `pressable`, `focusable`, `dataState`, `ariaRole`, `motion`.
- **Stable supporting types:** `BondHandle`, `AtomHandle`, `AtomCapabilityEntry`,
  `CreateAtomInstanceOptions`, `AtomCapability`, `AtomCapabilityConfig`, `BondCapability`,
  `BondCapabilityConfig`, `CapabilitySetupResult`, `SurfaceOf`, `Disclosure`, `DisclosureBacking`,
  `DisclosureActivationOptions`, `CollectionCapability`, `CollectionProjectionOptions`,
  `SelectionBacking`, `SelectionModel`, `SelectionProjectionOptions`, `RovingBacking`, `RovingFocus`,
  `RovingProjectionOptions`, `AtomElement`, `AtomTeardown`, `AtomValue`, `ElementRefCallback`,
  `ElementRefOptions`, `PressableOptions`, `FocusableOptions`, `DataStateOptions`, `MotionOptions`,
  `DisclosureStateProps`.

### Authoring a bonded family requires `/experimental`

Converting Collapsible, Select, Combobox and DataGrid to import from `@ixirjs/ui/shared` established
what the published seam can and cannot do. Their presentational, motion and capability modules
convert cleanly and now import through it, so the seam is exercised rather than merely declared —
the conversion found and closed real gaps (`internCapabilityFactory`, the whole input model,
`DisclosureStateProps`, the motion primitives, `isBrowser`).

The bond modules cannot convert: `defineBond({ base })` takes a `Bond` subclass, and `Bond`,
`defineAtom` and `AtomHost` are classified experimental above. A third-party family therefore needs
both entry points, and `/shared` alone is not a complete authoring SDK for bonded components.

That is recorded rather than resolved. Publishing `Bond` would put a runtime class whose internals
still churn into the stable contract; the alternative is a class-free `base` for `defineBond`,
which is pre-1.0 design work. Until one is chosen, the limitation is documented at the import site
in `collapsible/bond.svelte.ts`.

### Experimental or compatibility target

- **Concrete runtime classes:** `Bond`, `BondState`, `Atom`, `Collection`, `BondBinding`, `bindBond`.
- **Concrete/runtime plumbing:** `bondContextKey`, `BondStateProps`, `BondVirtualElement`,
  `NodeCardinality`, `NodeRegistrationOptions`, `BondFactory`, `BondBindingOptions`, `CellConfig`,
  `PropCell`, `PropsSpec`, `AtomOptions`, `DefineAtomOptions`, `DefinedAtomClass`, `DefineAtomSetup`,
  `defineAtom`.
- **Raw definition and composition records:** `AtomConstructor`, `AtomSpec`, `AtomsOf`,
  `BondBaseClass`, `BondSpec`, `DefinedBond`, `DefinedBondClass`, `FusablePart`, `PartsOf`,
  `SpecOf`, `StateOf`, `ViewOf`, `AtomsOfPart`, `MergeAtoms`.
- **Low-level protocol/diagnostic records:** `CAPABILITY_PROTOCOL_VERSION`,
  `SharedCapabilityKeyOptions`,
  `AtomBehavior`, `Behavior`, `AtomHost`, `RoleCtx`, `RoleCtxArgs`.

The stable list may be reduced during the SDK-seam mission; the experimental list may be reorganized
without application-level compatibility guarantees.

## Consequences

- Public surface changes are intentional, visible, and snapshot-gated before 1.0; this plan does
  not add compatibility aliases.
- One resolver gives the library presentation consistency while a lightweight adapter avoids
  forcing full lifecycle machinery onto every native control.
- Concrete runtime internals can evolve behind `/experimental` after the stable authoring seam is
  piloted on representative families.
- Component migrations are mechanical only after the contract is established; each migration must
  preserve Atom identity, registration, relationship projection, and teardown.
- Documentation and examples are part of the interface and must be compiled against the packed
  package rather than checked only as prose.

## Migration order

1. Snapshot this decision and restore green check/lint gates.
2. Unify preset typing and presentation adapters.
3. Repair component presentation and local slot customization.
4. Remove detached-Atom and `bond.state` compatibility paths.
5. Migrate ordinary descendants to `usePart`.
6. Standardize state callbacks and controlled behavior.
7. Narrow and correct public component types.
8. Publish the stable/experimental authoring split.
9. Repair overlay/portal locality.
10. Rebuild onboarding from executable examples.
11. Make completeness audits source-driven and add scaffolding.
12. Run the pre-1.0 integration gate.

## References

- `docs/component-authoring.md`
- `CONTEXT.md`
- `docs/research/api-evolvability.md`
- `docs/research/architecture-review-2026-07.md`
