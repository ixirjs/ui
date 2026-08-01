# `shared`

Runtime engine for Bonds, Atoms, capabilities, and authoring helpers.

## Layout

| Path                             | Purpose                                      |
| -------------------------------- | -------------------------------------------- |
| [`bond/`](./bond)                | Bond/Atom runtime, registry, binding, merge. |
| [`capability/`](./capability)    | Reusable Bond and Atom behavior.             |
| [`authoring/`](./authoring)      | `defineBond(...)` and composition helpers.   |
| [`animation.ts`](./animation.ts) | Small WAAPI helper used by built-in motion.  |
| [`motion.ts`](./motion.ts)       | Shared motion duration token.                |
| [`index.ts`](./index.ts)         | Shared public barrel.                        |

## Importing

Consumers usually import from `$ixirjs/ui/shared`. Internal code can import a layer barrel
for public surface or a concrete file for implementation details.

See [`CONTEXT.md`](../../../CONTEXT.md) for vocabulary.
