# ADR 0010: Standard Schema as the validation contract

## Status

Accepted

## Date

2026-08-09

## Context

Form validation had a correct core — `createValidation` kept errors as the single source of truth,
derived `isInvalid` from them, and discarded stale async results with a request counter — wrapped in
a layer that did not work.

**Nothing ever called it.** `Form.Root` rendered a plain `<form>` with no submit handling, the field
family had no blur seam at all, and `Field.Control`'s `oninput`/`onchange` were pure pass-throughs.
`FormBond.validate()` had zero callers. A consumer who wired a schema and an adapter got a field
that never validated.

**The adapter layer was the wrong abstraction.** Four hand-written `any`-typed shims —
`ZodValidationAdapter`, `YupValidationAdapter`, `JoiValidationAdapter`, `CustomValidationAdapter` —
existed so the library could talk to schema libraries. Every library worth naming now implements
[Standard Schema](https://standardschema.dev) natively (Zod 4, Valibot 1, ArkType 2, Effect Schema),
so the adapters plumbed a gap the ecosystem had already closed. Worse, `YupValidationAdapter` caught
every throwable and mapped it through `error.inner?.map(...) || []`, so a malformed schema produced
an empty error list — which every reader downstream saw as _valid_.

Two incompatible `ValidationResult` types lived in the same folder: an orphan
`form/field/validation-adapters.ts` that only the Storybook stories imported, so the stories
demonstrated an adapter consumers could not import.

`FormBond` was a stub — `validate()` fanned out with `.map` and discarded every result, `clear()`
was empty, `root()/label()/control()` returned `{}`, and there was no aggregate error view. There
was no touched/dirty state, and no seam at all for externally owned form state: Superforms,
SvelteKit remote form actions, felte and server round-trips all _publish_ errors rather than being
asked for them, and the design could only pull.

## Decision

### Standard Schema is the contract

The `~standard` interface is vendored as types in `src/lib/shared/validation/standard-schema.ts`.
Vendoring is what the spec is designed for, and it keeps the package free of both a dependency and a
peer dependency. `<Form schema={anySchema}>` accepts Zod, Valibot, ArkType or Effect directly.

The four adapter classes and the `validator` prop are **removed**. `defineSchema(fn)` is the
replacement for everything they covered that the spec does not — Yup, Joi, one-off rules.

A schema that _throws_ propagates. Reporting a thrown error as "no errors" is the specific defect
this replaces.

### `ValidationSource` is the one seam

```ts
interface ValidationSource {
  readonly errors?: readonly ValidationError[];              // push
  validate?(values: unknown): ValidationResult | Promise<…>;  // pull
  readonly values?: Record<string, unknown>;
  readonly isSubmitting?: boolean;
}
```

`schema`, `errors` and `source` on `Form.Root` are three ways to arrive at one of these, and
`FormBond` never learns which it got. Superforms is a `source` (`superformsSource(sf)`, typed
structurally against the store shapes so no dependency or version coupling is introduced); a server
error bag is an `errors` record; a schema is a `schema`.

### Errors route by path

Standard Schema issues carry a path whose segments may be bare keys or `{ key }` objects. They are
normalized to one canonical string (`address.street`, `items[0].qty`) and matched against each
field's `name`. `items.0.qty` and `items[0].qty` therefore match each other.

### One `validate()`, sync-or-promise

`ValidationModel.validateAsync()` is removed. Standard Schema returns sync-or-promise, so the split
only forced every caller to know which kind it held. A synchronous schema still allocates no
promise; `await validate()` works for both.

`ValidationResult.success` is removed for the same reason the Yup bug existed: `errors.length` is
the truth, and a second representation of one fact is a desync waiting to happen.

### Triggers are configurable, submit never blocks by default

`mode` is `'submit' | 'blur' | 'input' | 'touched' | 'manual'`, defaulting to `'touched'`: validate
on blur and submit, then live on every keystroke once a field has been visited, so an error clears
as the user fixes it but never appears before they have been there.

`Form.Root` intercepts `submit`, validates, and populates errors, but **does not** call
`preventDefault()`. An invalid form still submits, which is what keeps a progressively-enhanced
form working without JS. `blockInvalidSubmit` opts into blocking; with an async schema it blocks
unconditionally, because the verdict is not known before the browser would navigate.

The consumer's own `onsubmit` is forwarded unchanged and runs _after_ validation, so it reads fresh
errors off the bond.

## Consequences

**Breaking.** Removed from the public surface: `ZodValidationAdapter`, `YupValidationAdapter`,
`JoiValidationAdapter`, `CustomValidationAdapter`, the `ValidationAdapter` type, the `validator`
prop on `Form.Root` and `Field.Root`, `ValidationResult.success`, and
`ValidationModel.validateAsync`. `FieldBondBase.validateASync` (a typo) is gone with it.

Migration is normally a deletion: drop `validator`, keep the schema exactly as it was. A Yup or Joi
schema becomes `defineSchema((value) => …)`.

**Gained**: any Standard Schema vendor with no library code; a real submit and blur trigger story;
touched/dirty projected as `data-touched`/`data-dirty` through the existing status capability;
`FormBond.values/errors/isValid/isDirty/isTouched`; and one seam that covers Superforms, remote form
actions and server errors alike.

**Not done**: Valibot and ArkType are not added as devDependencies. Vendor-independence is proven in
`shared/validation/validation-core.spec.ts` against a hand-rolled `~standard` implementation
alongside real Zod, which is the same guarantee for no install weight.
