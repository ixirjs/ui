# ADR 0008: Public contract and authoring seams

## Status

Accepted

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
- Cross-part behavior is a Bond capability, not a root-level effect or hand-wired relationship.
- Generated detached-Atom methods and `bond.state` are compatibility paths only and are removed
  before 1.0.

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

This table is exhaustive for names currently exported by `src/lib/public/shared.ts`. It records the
target seam, not a promise that every current export is already in its final location.

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
  `BondBaseClass`, `BondSpec`, `DefinedBond`, `DefinedBondClass`, `FusablePart`, `MethodsOf`, `PartsOf`,
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
