# Bond Mechanism Review

Date: 2026-06-24
Branch: `feat/arch-improvements`
Scope: `src/lib/shared/bond`, `src/lib/shared/capability`, root binding helpers, and representative component usage.

## Summary

The current bond mechanism is architecturally strong. `Bond`, `BondState`, and `legacy Bond-owned Atom` form a deep module that hides several hard Svelte 5 problems behind a compact surface: cached atoms, microtask-staged registration, stable attachment keys, capability projection, behavior composition, and context plumbing.

The main risks are not in the central runtime shape. They are mostly caller-side invariant risks and migration drift:

1. Collection-owning states do not consistently apply the eager-registration pattern needed to avoid the documented `$derived` collection trap.
2. Legacy Alert/Card prop-builder methods mint attachment keys outside the protected `legacy Bond-owned Atom` path.
3. Many required component parts still use soft `.get()` context access instead of `getOrThrow()`.
4. Capability setup is partially tested, but teardown ordering and late-registration behavior need tighter regression coverage.
5. `$bindable` root props need explicit internal `$state` backing whenever bond state mutates them internally.

## What Is Working Well

### Runtime Shape

- `Bond.atom(key)` caches atom instances and resolves factories in a clear order: instance registry, class registry, then `legacy fallback Atom`.
- `Bond` uses a `Symbol.for` brand so `instanceof Bond` survives duplicate library copies while subclass checks remain prototype-based.
- `Bond.namespace` and `Bond.preset` are separate concepts, which keeps DOM identity and preset hierarchy from leaking into each other.
- `BondState.capability()` uses symbol slot identity, supports last-wins replacement, and supports composition via `compose`.
- `legacy Bond-owned Atom.spread` keeps attachment keys stable and composes colliding handlers instead of clobbering them.
- `StagedMap` avoids `state_unsafe_mutation` when atoms are requested during `$derived` evaluation.

### Current Test Coverage

Existing tests already cover important invariants:

- Atom registry, fallback behavior, and cache identity.
- Namespace and preset resolution.
- Cross-copy `instanceof Bond` behavior.
- `Collection` lifecycle and cleanup idempotence.
- Behavior attr merge and handler chaining.
- `legacy Bond-owned Atom.spread` attachment stability.
- Missing `useCapabilities()` setup guard.
- Relationship, navigation, selection, roving, and collection capability models.

## Findings And Solutions

### 1. High: Collection Getters Need Consistent Eager Registration

Files to inspect:

- `src/lib/components/accordion/bond.svelte.ts`
- `src/lib/components/dropdown-menu/bond.svelte.ts`
- `src/lib/components/tabs/bond.svelte.ts`
- `src/lib/components/stepper/bond.svelte.ts`
- Reference pattern: `src/lib/components/datagrid/bond.svelte.ts`

Finding:

The repo already documents a Svelte 5 trap: lazily creating a `Collection` from inside a `$derived` can poison dependency tracking. `DataGridState` handles this by touching `rows` and `columns` in its constructor before derived consumers run.

Other state classes expose collection getters such as `items`, `steps`, and content collections without the same visible eager-touch pattern. This does not prove a current user-visible failure by itself, but it makes correctness depend on external call order.

Impact:

- Derived views can become stale when the first `collection()` call happens inside a `$derived`.
- The failure can be subtle because initial render can work.
- Future component edits can accidentally reintroduce the trap.

How to solve:

1. Add a focused regression test that proves lazy collection creation inside `$derived` can go stale and that constructor eager-touch fixes it.
2. Audit collection-owning `BondState` classes.
3. In constructors, eagerly touch owned collections that are read by derived views. For example, use the DataGrid pattern: `void this.rows; void this.columns;`.
4. Keep the collection getters themselves as the public interface, but ensure the first creation happens outside `$derived`.

### 2. High: Legacy Prop-Builders Mint Attachment Keys Outside `legacy Bond-owned Atom`

Files to inspect:

- `src/lib/components/alert/bond.svelte.ts`
- `src/lib/components/card/bond.svelte.ts`
- `src/lib/components/alert/alert-title.svelte`
- `src/lib/components/card/card-title.svelte`

Finding:

`legacy Bond-owned Atom` protects the attachment-key invariant by minting keys once per atom instance. Alert and Card still use legacy methods such as `root()`, `title()`, and `description()` that return prop objects containing `[createAttachmentKey()]` inside the method body. Some part components call those methods inside `$derived` prop builders.

Impact:

- If those `$derived` values re-run, the attachment key identity changes.
- Svelte can treat the attachment as a new one, causing unnecessary teardown and remount behavior.
- This bypasses the `legacy Bond-owned Atom.spread` stability guarantee and the existing spread regression test.

Caveat:

Repo guidance says some Alert/Card element captures are known-dead or migration debt. Do not mix a broad Alert/Card rewrite into core runtime fixes unless a failing behavior proves the issue is currently user-visible.

How to solve:

1. First add a tiny component-level reproduction for Alert/Card attachment churn.
2. If the issue is confirmed, migrate these families toward `legacy Bond-owned Atom`-based slots or stable per-instance attachment keys.
3. Do not weaken the central `legacy Bond-owned Atom` invariant to accommodate legacy prop-builders.
4. If Alert/Card are intentionally pending migration, file this as migration debt instead of patching it opportunistically.

### 3. Medium: Required Parts Still Use Soft Context Access

Files and patterns:

- Many parts call `SomeBond.get()` and then optional-chain into behavior.
- Modern required parts call `SomeBond.getOrThrow(...)`.
- Examples appear in older Alert, Card, Input, Calendar, and Accordion item parts.

Finding:

The runtime supports both soft and strict context access. Soft `.get()` is valid for optional owner lookups, portals, delegated roots, and attachment helpers. Many required visible parts still use it as a fallback, which makes invalid composition fail silently.

Impact:

- Misnested component parts can render partially wired DOM.
- Missing context bugs become styling or behavior bugs instead of immediate errors.
- The required-vs-optional context contract is not obvious from the call site.

How to solve:

1. Classify every `.get()` call as optional or required.
2. Keep `.get()` for optional owner lookups, fusion/delegation, portals, and intentionally degradable helpers.
3. Migrate required visible parts to `getOrThrow()` with component-specific error messages.
4. Do this in family-sized passes so behavior changes are easy to review.

### 4. Medium: Capability Setup Lifecycle Needs More Focused Tests

Files to inspect:

- `src/lib/shared/capability/use.svelte.ts`
- `src/lib/shared/capability/define.svelte.spec.ts`

Finding:

The missing-`useCapabilities()` warning is already tested. `useCapabilities()` also promises setup in registration order and teardown in LIFO order, but that ordering is not covered as strongly.

Impact:

- Focus restore, escape handling, overlay policies, and portal-related capabilities can depend on setup and teardown ordering.
- A future refactor could change teardown order without a focused failing test.

How to solve:

1. Add `src/lib/shared/capability/use.svelte.spec.ts`.
2. Test setup order across multiple capabilities.
3. Test LIFO teardown order.
4. Test both teardown function returns and `Disposable` returns.
5. Keep the existing missing-setup guard tests in `define.svelte.spec.ts`.

### 5. Medium: Capability Validation Is Deferred And One-Shot

File to inspect:

- `src/lib/shared/bond/bond.svelte.ts`

Finding:

`BondState` validates missing capability requirements and missing setup activation on first role projection. That delay lets constructor-time registration settle, but late `capability()` calls after the first projection are not revalidated.

Impact:

- Missing `requires` entries may never warn if no relevant role is projected.
- Late registration can bypass validation entirely.
- The behavior may be intentional, but it should be explicit and tested.

How to solve:

1. Add a test documenting late registration after first projection.
2. Add a test for multi-level `requires` chains.
3. Decide whether late registration should re-open validation or remain unsupported.
4. If it remains unsupported, document that capabilities should be registered before any atom role projection.

### 6. Medium: Duplicate Role Lookup Semantics Are Implicit

File to inspect:

- `src/lib/shared/bond/bond.svelte.ts`

Finding:

`Bond.atomByRole(role)` returns the first atom matching a role from the internal queue. That is fine for one-trigger/one-content relationships, but duplicate roles are possible in dynamic or compound components.

Impact:

- Cross-slot ARIA relationships can point at an unexpected atom if duplicate role assumptions are violated.
- First-match behavior is not documented as a public contract.

How to solve:

1. Add a unit test for duplicate role behavior.
2. Decide whether first-match semantics are supported.
3. If first-match is intentional, document it.
4. If duplicate roles should be invalid for relationship roles, add a development warning.

### 7. Medium: `StagedMap.find()` And `forEach()` Restage Semantics Are Inconsistent

File to inspect:

- `src/lib/shared/bond/staged-map.svelte.ts`

Finding:

`get()` checks pending before committed, so a newly staged value wins. `find()` iterates committed before pending, so if a key exists in both maps the older committed value can win. `forEach()` visits committed then pending, which can emit duplicate keys to callers.

Impact:

- Low probability today because atoms are normally staged once per key.
- Future dynamic atom registration could expose stale atoms before the microtask flush.
- The `forEach()` comment says the newest value wins, but the implementation can call the callback for both values.

How to solve:

1. Add `src/lib/shared/bond/staged-map.svelte.spec.ts`.
2. Test restaging the same key before flush for `get()`, `find()`, and `forEach()`.
3. Decide whether pending values should be authoritative across all read methods.
4. If yes, update `find()` and `forEach()` to overlay pending entries on top of committed entries before iteration.

### 8. Medium: `$bindable` Root Props Need Enforced Backing Discipline

Files to inspect:

- Root components with `$bindable(...)` props under `src/lib/components/**/*-root.svelte`.
- Existing repo note: `tabs-bindable-reactivity.md` in repository memory.

Finding:

Svelte 5 `$bindable` values without a parent `bind:` are not reliable internal reactive sources when mutated by bond state. Tabs already hit this class of bug. Internally mutated bindable props need an internal `$state` backing variable so uncontrolled mode invalidates derived consumers.

Impact:

- A component can work in controlled mode but fail in uncontrolled mode.
- Derived state can update once and then stop invalidating.
- The bug sits at the root binding seam, not in downstream atoms.

How to solve:

1. Audit roots where bond state mutates `$bindable` props internally.
2. Add component-level uncontrolled-mode tests for Select, Combobox, Accordion, Calendar/DatePicker, Stepper, Stack, and similar roots.
3. Back internally mutated bindables with `$state` and use the bindable variable as the parent communication conduit.
4. Document the rule near `bindBond` in `src/lib/shared/bond/README.md`.

### 9. Low: DataGrid Row/Column Context Reads Are Duplicated

Files to inspect:

- `src/lib/components/datagrid/row/bond.svelte.ts`
- `src/lib/components/datagrid/column/bond.svelte.ts`

Finding:

Some row and column bond paths call `DataGridBond.get()` more than once during construction. This is clarity and performance debt, not a central correctness issue.

Impact:

- Extra context lookups per row or column instance.
- Parent dependency is harder to reason about.

How to solve:

1. Deduplicate parent lookup during a focused DataGrid pass.
2. Store the parent once and pass or reuse it where needed.
3. Keep this separate from shared bond runtime changes unless profiling shows meaningful cost.

## Suggested Test Work

1. `src/lib/shared/capability/use.svelte.spec.ts`: setup order, LIFO teardown order, function teardown, disposable teardown.
2. `src/lib/shared/bond/staged-map.svelte.spec.ts`: restage-before-flush semantics for `get()`, `find()`, and `forEach()`.
3. `src/lib/shared/bond/collection.svelte.spec.ts`: lazy collection creation inside `$derived` vs eager constructor touch.
4. `src/lib/shared/capability/decorate.svelte.spec.ts`: multi-level decoration chains.
5. `src/lib/shared/bond/bond.svelte.spec.ts`: duplicate role lookup semantics for `atomByRole()`.
6. Component specs for uncontrolled `$bindable` behavior in stateful roots.
7. Component specs for Alert/Card attachment churn only if those families are still supported as-is.

## Recommended Implementation Order

1. Add regression tests for shared runtime invariants before changing runtime behavior.
2. Patch confirmed shared runtime defects, starting with small isolated helpers such as `StagedMap` if tests prove a mismatch.
3. Eagerly register owned collections in collection-owning state constructors where needed.
4. Audit uncontrolled `$bindable` roots and add internal `$state` backing where bond state mutates the value.
5. Migrate required component parts from soft `.get()` to `getOrThrow()` in small family-sized passes.
6. Treat Alert/Card prop-builder migration as a separate cleanup unless a current failing test proves urgency.

## Scope Boundaries

Included in this review:

- Bond runtime core.
- Capability registration, projection, setup, and teardown lifecycle.
- Binding and context helpers.
- Representative component usage and drift.

Excluded from this review:

- Visual styling and preset design except where they interact with atom prop layering.
- Broad Alert/Card rewrites without a failing behavior.
- E2E workflow expansion beyond identifying missing coverage.
- Source-code changes.
