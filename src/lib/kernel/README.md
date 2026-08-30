# `kernel`

**Turning a declaration plus props into rendered markup.** One module, one question.

Kernel is the sole internal rendering interface (ADR 0009). Four operations and two operands:

| Op               | Does                                                                              |
| ---------------- | --------------------------------------------------------------------------------- |
| `Kernel.plan`    | compiles immutable per-slot metadata, memoized per (definition, slot, tag, class) |
| `Kernel.node`    | binds one component instance — lazy Atom, registration, lane decision             |
| `Kernel.element` | resolves the full presentation contract                                           |
| `Kernel.render`  | returns the exact compiled snippet the caller dispatches **once**                 |
| `Kernel.static`  | the shared seam for a leaf with no Bond or Atom                                   |
| `Kernel.forward` | the body-argument forwarding marker                                               |

A node **is** a renderable handle. `render` must be dispatched with the handle rather than closing
over it: a fresh closure changes the `{@render}` target identity and tears the block down every
render.

**Kernel is not the authoring interface.** Families author through
[`$ixirjs/ui/authoring`](../authoring); Kernel is what those seams are built on, and the documented
escape hatch for the few shapes they cannot express. `kernel-authoring-audit.spec.ts` ratchets the
count of direct callers.

## Layout

| Path                     | Owns                                                                          |
| ------------------------ | ----------------------------------------------------------------------------- |
| `index.svelte.ts`        | the `Kernel` facade, `KernelPlan`, `KernelNode` — including the lane decision |
| `element.svelte.ts`      | `useKernelElement`, the seam type, the static seam                            |
| `types.ts`               | `RenderProps`, `Base`, `HtmlElementTagName` and the prop vocabulary           |
| `render/`                | leaf branches, render-mode selection, lifecycle, the kernel-prop split        |
| `resolve/`               | presentation: preset, classes, variants, fold, motion, caches                 |
| `presentation.svelte.ts` | the forwarded-packet path for components that take props, not a seam          |

## Two rules that are easy to undo by accident

- **Dispatch must read `presentation.base`, not the destructured `base` prop.** A preset can name a
  renderer through `render.base`, where the raw prop is `undefined` — such an atom then renders as a
  plain `div` carrying the preset's classes, which looks entirely correct.
  `custom-renderer.svelte.spec.ts` covers it.
- **The rune gate must read raw props, never `presentation.motion`**, or the presentation resolves
  eagerly for every atom. `resolve-count.svelte.spec.ts` will _not_ catch that — it counts
  recomputes, and an init-time read of a `$derived` neither adds a count nor establishes a
  dependency.

## The lane, and why it is decided at init

`KernelNode`'s constructor decides whether a part renders on the class-only lane or resolves its
full presentation, because resolving needs `$derived`, `$effect.pre` and `$effect`, and effects can
only be created during init. Asking in `Kernel.render` instead meant escalation had to mount
`RichPart` purely to reopen an init context: **+2.5 µs and +4 hydration anchors per part**.
`anchor-budget.spec.ts` pins the node and escalated rows at the same number, which is what keeps the
decision out of the render pass.

Never call `Kernel.element` on a node that already owns one — `useKernelElement` throws in DEV rather
than leaving the rule to memory. A second element registers a second set of lifecycle and motion
effects against the same part.

Attribute channels are **not** interchangeable: `Kernel.node`'s `attrs` option _merges_ with the
consumer's props, while `Kernel.element`'s third parameter _replaces_ attribute extraction entirely.

## Class merging

`resolve/classes.ts` caches merges keyed on `userClass[0]`, and stores **only flat arrays of
strings** — nested arrays, clsx's object form and class functions are never stored. That is why
`definePart`'s and `defineLeaf`'s `class` options are typed `string`, with a state-dependent segment
going through `beforePreset` as a single string rather than an array.

See ADR 0009 and
[`docs/research/authoring-seam-consolidation-2026-08.md`](../../../docs/research/authoring-seam-consolidation-2026-08.md).
