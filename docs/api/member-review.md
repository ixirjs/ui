# Member-level evolution review

This is a **manual, scoped review**, not generated completion credit for the declaration inventory.
The first tranche covers Kernel's own surface, ElementSpec/KernelElement, InputBond's own members,
and the number/password/time control commands exercised while validating the Svelte minimum.
Other families, nested model methods and the remaining input control props are still open (M4).

E1 = inspected implementation/type evidence. E2 = a runnable check for the named scenario, not
proof of every possible input. Tomorrow's features below are pressures to design for, not work to build now.
All existing names remain; no deprecated member or apparently unused field is removed.

## Evidence map

- **K**: `src/lib/kernel/kernel.svelte.ts`, including initialization, Handle resolution and context/identity helpers (E1).
- **R**: `src/lib/kernel/element-render.svelte`, `kernel/render/element-branches.svelte`,
  `components/element/html-element.svelte` under `src/lib/` (E1). Optional branch-call compatibility:
  `src/lib/test/types/render-branch-contract.type-test.ts` (E2).
- **B**: `src/lib/components/input/bond.svelte.ts` and `input-root.svelte` (E1).
  `src/lib/test/compatibility/input-state.test.svelte` and `scripts/check-consumer.mjs` (E2).
- **I**: `src/lib/components/input/shared.ts`, `parsed-value.svelte.ts`,
  `input-number-control.svelte`, `input-password-control.svelte`, `time/time-control.svelte` (E1).
  `src/lib/test/compatibility/input-commands.test.svelte` plus the runner (E2), supplemented by
  `src/lib/components/input/input.svelte.spec.ts` (E2).

The frozen consumers compile against the adopted declarations and the candidate. Their runtime
scenarios run against the candidate with both Svelte 5.46.4 and 5.56.8 / TypeScript 5.9.3.
The original baseline runtime is not reinstalled and replayed; runtime expectations are characterized
from unchanged implementations, with the syntax-only changes described below.

## Kernel entry points and context members

| Member                              | Today / invariant                                                                                                    | Tomorrow / safe path                                                                                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Kernel.element(props, spec)`       | K: initializes from a props thunk; returns one handle. Reads preset installation at init, not on each update.        | A new installation strategy must not silently turn request-local or initialization-scoped state into a global live registry.                                   |
| `Kernel.render(el)`                 | K/R: chooses a leaf from `el.mode()`; accepts omitted body and argument. Bind the leaf once.                         | Compiler changes must retain the optional callable contract, identity reuse and hydration cost; typed aliases rather than wrappers/default-expression signals. |
| `Kernel.context(name)`              | K: creates a branded handle, keyed by a canonical string. Handles are not recognized by duck-typing a `.get` method. | A new context implementation must interoperate with existing string-keyed contexts and keep plain state objects plain.                                         |
| `context.key`                       | K: `@ixirjs/context/${name}`; readonly in the public type.                                                           | Do not switch to unique symbols and orphan existing seeded contexts.                                                                                           |
| `context.share(value)`              | K: writes component context and returns the very same object.                                                        | Validation/proxying must not replace the returned state identity.                                                                                              |
| `context.get()`                     | K: reads Svelte context; requires component initialization.                                                          | Do not silently catch all errors here; the tolerant route already exists.                                                                                      |
| `context.getOptional()`             | K: catches context-access errors and returns `undefined`.                                                            | Retain the programmatic/no-component path; stricter diagnostics need a separate opt-in route.                                                                  |
| `context.getOrThrow(message?)`      | K: rejects missing (`undefined`) state with the supplied/default message; other values are not treated as missing.   | Do not replace the undefined test with truthiness or replace caller-provided messages.                                                                         |
| `Kernel.id(seed, part)`             | K: exact `${part}-${seed}` formatting, no counter or DOM access.                                                     | New identity schemes must coexist; no SSR/client divergence or silent reformatting.                                                                            |
| `Kernel.claimId(owner, seed, part)` | K: owner/part-scoped slots; first unsuffixed, later lowest free numeric suffix.                                      | New slot storage must preserve collision behavior and released-slot reuse.                                                                                     |
| `claim.id`                          | K: fixed string for that claim.                                                                                      | Never retag an existing element when siblings register.                                                                                                        |
| `claim.release()`                   | K: deletes the allocated slot; repeated deletion before reuse is harmless. It is not a generation-checked lease.     | Do not promise a stale release is safe after slot reuse without a new behavioral review; callers currently own exactly-once teardown.                          |
| `Kernel.compose(consumer, own)`     | K: absent consumer returns `own`; otherwise consumer-first composition, own skipped on cancellation.                 | Do not reverse order or reuse this as an equality gate for semantic input callbacks.                                                                           |

## ElementSpec: each declared field

| Field          | Today / invariant (K)                                                                                                              | Tomorrow / safe path                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `preset`       | Optional key; a string consumer preset may override it.                                                                            | Keep augmentation and key precedence; adding selector names requires collision review.                              |
| `class`        | Required base string, merged with preset/own/consumer classes.                                                                     | Preserve `$preset` placement and border defaults; do not turn it into a replacement class.                          |
| `as`           | Literal or thunk; resolved at initialization with preset fallback.                                                                 | Reactive retagging is a new policy, not an invisible fix to existing initialization semantics.                      |
| `attrs`        | Object is used directly; thunk is tracked/memoized on the client. Own attrs precede consumer attrs.                                | Keep both input forms and tracking boundaries; a getter over parent collections can make sibling updates quadratic. |
| `state`        | Plain state or a branded Kernel context handle, lazily resolved when required.                                                     | Do not reinterpret every function as a state factory: `unknown` currently accepts function-valued state too.        |
| `variantProps` | Selects variants without adding those values to DOM attrs; overrides consumer values for variant selection.                        | New selectors must preserve DOM filtering and precedence.                                                           |
| `layer`        | Per-instance preset layer after preset/variant attributes and before own/consumer attributes.                                      | Keep ownership and order; do not merge it into global installation.                                                 |
| `base`         | Thunk used for initial lane selection; renderer resolution can read it again.                                                      | Do not promise universal live switching between lanes; preserve renderer packet forwarding.                         |
| `motion`       | Initial defined own driver wins; otherwise consumer, then preset fallback. A merely present thunk yielding no driver does not win. | New motion channels must not suppress fallbacks or create a second lifecycle owner.                                 |

## KernelElement: each declared member

| Member             | Today / invariant (K/R)                                                                                   | Tomorrow / safe path                                                                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `attrs`            | Readonly access to the resolved attribute object; memoized client resolution and server first-read cache. | Do not require callers to copy it or move state reads into the dispatch block.                                                                                                  |
| `tag()`            | Initialization-resolved tag string.                                                                       | A new renderer must retain current tag and polymorphic typing semantics.                                                                                                        |
| `spread()`         | Same resolved source as `attrs`, including class and client attachment symbols.                           | Keep attachment forwarding; SSR intentionally does not render symbol attributes.                                                                                                |
| `class()`          | Resolved class from the same source.                                                                      | No second independent theme-resolution pass.                                                                                                                                    |
| `attributes()`     | New object excluding `class`.                                                                             | Do not substitute `attrs` wholesale and duplicate class forwarding into renderer packets.                                                                                       |
| `motion()`         | Lazily materializes and retains the motion owner.                                                         | Keep lifecycle requirements; no second owner or per-read motion instance.                                                                                                       |
| `resolvedMotion()` | Raw selected driver, or shared frozen empty object.                                                       | Keep this distinct from the running owner returned by `motion()`.                                                                                                               |
| `renderer()`       | Resolves component and forwarded props, with presentation-resolved handling for HtmlElement.              | A new renderer protocol must coexist; do not wrap ordinary leaf elements in components.                                                                                         |
| `mode()`           | Cached lane choice; native transition lanes initialize their owner when selected.                         | New output union members can break exhaustive consumer switches. Map to existing semantics or review a separately exposed policy rather than assuming union growth is harmless. |

These member semantics are source-reviewed. The whole existing Kernel rendering/lifecycle/anchor
suite protects representative outcomes, but no claim is made that each row has an independent
frozen behavioral scenario yet.

## InputBond: each own public member

| Member                    | Today / invariant                                                                                                                                  | Tomorrow / safe path                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `constructor(props = {})` | B: accepts omitted props; retains the supplied object.                                                                                             | Keep construction usable without a component; do not require a provider to create state.                     |
| `create(props = {})`      | B: constructs an InputBond, not a new opaque handle.                                                                                               | Keep existing subclass/factory return contracts; no mandatory identity wrapper.                              |
| `CONTEXT_KEY`             | B: canonical `@ixirjs/context/bond/input`.                                                                                                         | Preserve seeded-context interoperability.                                                                    |
| `get()`                   | B: context lookup; absent root yields undefined during initialization.                                                                             | Keep optional-root controls working.                                                                         |
| `getOrThrow(message?)`    | B: delegates required lookup and preserves a custom missing-root message.                                                                          | A new error type must not discard caller text.                                                               |
| `name`                    | B: `input`.                                                                                                                                        | No rename hidden behind a general naming cleanup.                                                            |
| `props`                   | B: readonly reference, but its declared mutable fields remain writable.                                                                            | Deep freezing/cloning would break live root accessors and caller-owned state.                                |
| `value`                   | B: InputModel reference; getter stringifies non-null raw values, nullish becomes empty string; setter routes through `setValue`.                   | Preserve this model route, not just a scalar replacement; nested model methods need their own review.        |
| `id`                      | B: supplied seed or literal standalone fallback `input`.                                                                                           | Retain empty-string behavior of `??`; do not substitute truthiness.                                          |
| `rootId`                  | B: `input-root-${id}`.                                                                                                                             | Retain SSR/client identity.                                                                                  |
| `controlId`               | B: `input-control-${id}`, deliberately not `input-input`.                                                                                          | Preserve existing cross-part addressing.                                                                     |
| `placeholderId`           | B: `input-placeholder-${id}`.                                                                                                                      | Keep placeholder addressing independent of rendered control id overrides.                                    |
| `declareType(thunk)`      | B: stores a live semantic-type accessor despite the internal annotation.                                                                           | It is reachable today; do not delete it merely because it was intended for library controls.                 |
| `declareDate(date)`       | B: stores parsed-date fallback for representations Date.parse cannot reconstruct.                                                                  | Preserve the time/week fallback; changing date representation requires opt-in semantics.                     |
| `setValue(value)`         | B: writes props directly; does not itself emit a control callback.                                                                                 | Adding notifications here could double-report callbacks already owned by controls.                           |
| `setFiles(files)`         | B: stores the supplied array. The standalone getter preserves that reference.                                                                      | Do not clone or deduplicate silently. Root accessors can have their own copying behavior.                    |
| `setChecked(checked)`     | B: writes checked, without a control callback.                                                                                                     | Preserve mutation/reporting ownership separation.                                                            |
| `controlType`             | B: reads the registered thunk, otherwise undefined.                                                                                                | Do not infer type from a native DOM lookup that cannot run during SSR.                                       |
| `shouldShowPlaceholder`   | B: checkbox/radio never show; file checks length; otherwise raw truthiness. Numeric zero currently yields true even though `value.get()` is `"0"`. | Do not normalize this to string emptiness silently. Any zero-placeholder correction needs behavioral review. |
| `number`                  | B: only for number controls; blank/non-finite raw values yield undefined.                                                                          | Keep undefined, not NaN or zero, for empty/invalid values.                                                   |
| `date`                    | B: only for date-like types; parses raw value or falls back to declared date; returns a fresh SvelteDate projection.                               | Memoizing one mutable Date could let caller mutation contaminate later reads. Preserve copy semantics.       |
| `files`                   | B: supplied array or a fresh empty array when absent.                                                                                              | Do not add stable-empty-array identity or immutable arrays as an assumed existing guarantee.                 |

### InputStateProps and root ownership

- `id`, `value`, `files`, `checked`: source B above governs their reads/writes. Raw `value` accepts
  string, number, Date and undefined; projections do not replace it.
- `number`, `date`: readonly declared fields are not consulted by these built-in projection getters.
  They remain accessible on `props`; activating them as overrides would change existing behavior.
- `group`: stored/exposed but not interpreted by this class. No deletion or new interpretation is authorized.
- `Input.Root.factory`: read once at init; `getBond()` and snippet `input` share the selected instance.
- `Input.Root.value/checked/files`: live local accessors, **not declared bindable root exports**.
  Controls own their bindable channels. Do not document every family root as uniformly bindable.

## Number, password and time control members

| Member                                      | Today / invariant (I)                                                                                                                                                       | Tomorrow / safe path                                                                                                                                           |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Number `increment` snippet `action(event?)` | Omitted event is accepted; writes number before callback; checks disabled/readonly/max.                                                                                     | Alternate controls must retain callable actions, not require a DOM event or synthesize one.                                                                    |
| Number `decrement` snippet `action(event?)` | Symmetric min guard and decrement reason; undefined number starts from min or zero.                                                                                         | Preserve numeric starting point and precision; a new scale cannot reinterpret existing `step`.                                                                 |
| Number `step`                               | Default 1; zero is accepted and can report an unchanged number.                                                                                                             | Do not introduce a global equality gate or positive-step validation as a silent refactor.                                                                      |
| Number `onvaluechange`                      | Reports stepped/input/clear values after the bindable write.                                                                                                                | Preserve commit order and undefined on clear.                                                                                                                  |
| Number `onnumberchange`                     | Deprecated alias still fires after `onvaluechange` when both are supplied.                                                                                                  | Do not suppress the alias when the preferred callback is present.                                                                                              |
| Number `oninput`                            | Native event callback first; prevention stops the native-input commit.                                                                                                      | Keep native cancellation separate from direct snippet commands.                                                                                                |
| Number `number` prop                        | Declared `number?: number`; runtime clear can produce undefined. An explicitly undefined-valued binding fails under exactOptionalPropertyTypes in the adopted declarations. | This is existing typing debt, not proof undefined is an invalid runtime result. Review any widening against old consumers; no type correction is bundled here. |
| Password `toggleContent.toggle(event?)`     | Accepts no event; disabled blocks, readonly does not block visibility changes.                                                                                              | Readonly protects text editing, not visibility; do not equate it with disabled.                                                                                |
| Password `visible` / `onvisiblechange`      | Binding changes first; context includes current text value, toggle reason, optional event.                                                                                  | Keep the existing context fields and ordering; no fabricated MouseEvent.                                                                                       |
| Time `value` / `date`                       | Raw and parsed channels; non-empty raw wins initialization and simultaneous changes. Incomplete raw preserves the last parsed projection.                                   | Time zones/formats must be opt-in; don't replace Date or reverse precedence.                                                                                   |
| Time `hourFormat`                           | 24 by default; 12-hour stepping handles the 11/12 AM/PM boundary.                                                                                                           | Preserve internal 24-hour serialized values when changing display formats.                                                                                     |
| Time `onvaluechange`                        | Suppressed for unchanged/invalid serialized time; emitted after the parsed-value writer.                                                                                    | Do not generalize Number's notification policy onto Time.                                                                                                      |
| Time AM/PM interaction                      | Click and keyboard share the same writer; disabled/readonly guard it.                                                                                                       | Additional interaction routes must reuse the writer and preserve spinbutton accessibility.                                                                     |

## Minimum-compiler finding and approved fix

A fresh isolated Svelte **5.46.4** installation with newer compatible-range printer dependencies
left TypeScript optional parameter markers in emitted JavaScript. The ESM compiler used by Vite
failed; a direct CJS `require('svelte/compiler')` probe passed. Testing the wrong compiler entry
would therefore have produced false compatibility evidence.

The fix preserves optional public contracts through typed snippet aliases; implementations accept
explicit undefined. Ordinary input helpers also accept undefined without changing their runtime
function bodies. No wrapper functions or default-argument derived signals were introduced.
The `ElementBranch` declaration representation has an exact reviewed hash; the frozen baseline is unchanged.

Verification under the installed compiler: all three changed input components emit byte-identical
client/server JS to adopted commit `3a678810`; all three renderer modules have identical Svelte
runtime-call counts (including derived signals and snippet/element anchors). Runtime-call counts
are structural evidence, not a timing benchmark. Existing rendering/anchor/growth checks remain required.

The minimum rehearsal installs checker, plugin, compiler and runtime together outside repository
aliases and asserts their Svelte versions agree. All declared direct runtime/optional-peer and tool
versions other than Svelte match the installed development versions; transitive dependencies are
freshly resolved. CI and prepublish run both installed and minimum consumers. This is a two-point
Svelte check, not every peer version, TypeScript version, bundler, browser or duplicate-package topology.
