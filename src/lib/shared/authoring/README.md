# `shared/authoring`

Declarative helpers for defining Bond families.

## Files

| File                 | Purpose                                                                   |
| -------------------- | ------------------------------------------------------------------------- |
| `define.svelte.ts`   | `defineBond(...)`, spec types, generated context keys, and atom metadata. |
| `define-runtime.ts`  | Runtime helpers used by `defineBond`.                                     |
| `use-part.svelte.ts` | Resolves a declared part and owns its standard authoring ceremony.        |
| `index.ts`           | Public barrel for this layer.                                             |

## Usage Notes

- `defineBond<const S extends BondSpec>(spec: S)` has one inference site; use `SpecOf`, `BaseOf`, `StateOf`, `PropsOf`, `PartsOf`, and `AtomsOf` to inspect it at type level.
- Prefer `BondOf<typeof X>` for defined bond instances.
- Use `parts:` for flat composition. State and methods belong on the `base:` class — the generated class adds neither.
- Ordinary fixed descendants compile `Kernel.part(BondClass, slot, options)` in module scope and bind `Kernel.node(...)` per instance; Kernel owns context lookup, lazy registration, role projection, and presentation. Roots use `useRoot`; repeated/data-driven, virtual, and runtime-polymorphic parts use `createAtomInstance(...)` only by explicit exception. Definition metadata remains internal and no public `.spec` is exposed.
- `AtomSpec.part` names a declarative slot only. Atom identity belongs to the Atom constructor and registration belongs to Kernel or `createAtomInstance({ register })`.
- Definitions record atom metadata for Kernel. Identity, registration, and teardown stay with the render owner.
- A generic class value loses its type parameter through `typeof` in TypeScript. The DataGrid family and Drawer retain only small static constructor facades to re-introduce that parameter at their public boundary; ordinary bonds expose `defineBond(...)` directly.
