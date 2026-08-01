# `shared/authoring` — the bond authoring DSL

Declarative construction of bond families. Instead of hand-writing a `Bond` subclass plus its
`Atom` classes and a context key, a family is _declared_ — nodes, roles, and capability
composition in one spec — and the machinery is generated. Atom constructors should extend
`Atom`.

| File                                     | Exports                                                                | What it is                                                                                                                                                                                                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`define.svelte.ts`](./define.svelte.ts) | `defineBond`, `BondSpec`, `AtomSpec`, `BondOf`, `ViewOf`, `StateOf`, … | The primary entry point. `defineBond({ name, base, atoms })` returns a bond class with a canonical `CONTEXT_KEY`, generated compatibility atom methods, and roles declared per node. Use `parts:` for flat composition or `extends:` for spec inheritance. |
| [`fuse.svelte.ts`](./fuse.svelte.ts)     | `fuse`, `FuseSpec`, `AtomsOf`, `MergeAtoms`                            | Bond + bond → bond. Fuses two families under one shared context slot (e.g. `PopoverDialog`), re-using each part's own atom components; last part wins on capability-slot collision.                                                                        |

## Type utilities

Prefer the spec-derived aliases over `InstanceType<...>`:

- `BondOf<typeof X>` — the bond instance type
- `ViewOf<State>` — `Bond & { state: State }`
- `StateOf<C>` — the state type of a defined bond

## Public surface

Everything above is re-exported through [`index.ts`](./index.ts) into the
[shared barrel](../index.ts).

Generated part methods such as `bond.root()` and `tab.header()` remain direct constructor adapters
for compatibility. Rendered Svelte parts should create local `Atom`s with
`createAtomInstance(...)` and let the bond coordinate registered Atoms.

## Relationship to the rest of `shared`

`authoring` sits on top of [`../bond`](../bond) (the runtime it generates) and
[`../capability`](../capability) (the behaviors a spec composes). It is the highest layer — nothing
in `bond` or `capability` imports back into it.
