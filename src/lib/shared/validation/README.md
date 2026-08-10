# `shared/validation`

The validation contract. Form and Field are the only consumers today, but nothing here depends on
them — a Bond that wants schema-checked state can use it directly.

## Layout

| Path                                         | Purpose                                                              |
| -------------------------------------------- | -------------------------------------------------------------------- |
| [`standard-schema.ts`](./standard-schema.ts) | The vendored [Standard Schema](https://standardschema.dev) v1 types. |
| [`path.ts`](./path.ts)                       | Issue-path normalization, and `setByPath` for building form values.  |
| [`source.ts`](./source.ts)                   | `ValidationSource` and the three ways to build one.                  |

## Why the spec is vendored

`~standard` is types-only, and the spec is explicitly designed to be copied rather than depended on.
Vendoring keeps the package free of both a dependency and a **peer** dependency — the latter matters
most, since a peer dep would force every consumer to install a schema library they may not use.

`isStandardSchema(value)` is the runtime check: an object with a `~standard.validate` function.

## `ValidationSource` — pull and push

```ts
interface ValidationSource {
	readonly errors?: readonly ValidationError[]; // push: someone else owns the truth
	validate?(values: unknown): ValidationResult | Promise<ValidationResult>; // pull
	readonly values?: Record<string, unknown>;
	readonly isSubmitting?: boolean;
}
```

A schema is a source (`standardSchemaSource`). A reactive error bag is a source
(`errorRecordSource`). Superforms is a source (`superformsSource`, which lives with the Form family
because it is library-specific). `FormBond` never learns which kind it was given.

Push and pull compose: a form can hold a client schema _and_ receive server errors, and a field
merges its own schema's errors with the slice of the form's that match its `name`.

## Path routing

Standard Schema issue paths carry either bare keys or `{ key }` objects, and consumers write field
names in either notation. Both go through `formatPath(parsePath(name))` before comparison, so
`items.0.qty` and `items[0].qty` are the same key. `formatPath` is the canonical form —
`address.street`, `items[0].qty`.

## Errors that are not validation failures

`standardSchemaSource` lets a thrown error propagate. A schema that throws is a bug in the schema,
and reporting it as an empty error list reads downstream as _valid_ — the exact defect in the
adapter layer this replaced (see [`docs/adr/0010`](../../../../docs/adr/0010-standard-schema-as-the-validation-contract.md)).

## Escape hatch

`defineSchema(fn)` wraps a plain predicate as a Standard Schema, for a library that has not adopted
the spec (Yup, Joi) or for a one-off rule:

```ts
const schema = defineSchema<string>((value) => (value.length > 2 ? undefined : 'Too short'));
```
