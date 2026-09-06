# AGENTS.md

Canonical agent instructions for `@ixirjs/ui`. Tool-specific instruction files symlink here
(`CLAUDE.md`, `.github/copilot-instructions.md`) — never duplicate guidance into them.

A Svelte 5 + TypeScript component library. Every family is a plain state class published under
`Kernel.context`, parts authored through `Kernel.element`, presentation resolved by **presets**.

## Orientation

| Read this                                      | For                                                            |
| ---------------------------------------------- | -------------------------------------------------------------- |
| `CONTEXT.md`                                   | Vocabulary: Bond, capability, preset, portal, testing.         |
| `INDEX.md`                                     | Repository map — where anything lives.                         |
| `docs/adr/0008-*.md`                           | Public contract, package layers, authoring seams.              |
| `docs/research/whiteboard-migration-recipe.md` | What a family looks like, and its gates.                       |
| `src/lib/*/README.md`                          | Per-layer decisions: capability, kernel, preset.               |
| `.github/svelte.txt`                           | Svelte 5 + SvelteKit reference. Use it when generating Svelte. |

Copy the canonical exemplar rather than inventing a shape: **Button** for static modules, **Card**
for a presentation family, **Accordion** for a behavioural one, **Popover**/**Dialog** for an
overlay.

Better than copying, for a **new** family: `bun run scaffold <name> --slots root,header:trigger,body`
emits the shape directly — a plain state class with one `Kernel.context` and one id getter per slot,
a root that shares it, one literal-element part per slot, the barrels, the per-slot prop types and
extension interfaces — and registers the family's preset keys in `src/lib/preset/manifest.ts`
(without which the generated code does not compile). Add `--static` for the Button shape, `--dry` to
print instead of write. What it cannot write is the 30% worth writing: behaviour models, ARIA and
keyboard logic, Bond methods, markup. Those are marked `TODO`.

## Commands

```
bun run check         # svelte-check — the fast correctness gate
bun run lint          # prettier --check + eslint
bun run format        # prettier --write
bun run test:unit     # vitest (append -- --run for one shot)
bun run test:e2e      # playwright
bun run bench:ssr     # SSR µs/bytes/sha per layer, gated (machine-specific: --no-gate elsewhere)
bun run bench:growth  # mount growth shape per family, gated (machine-INdependent, safe anywhere)
bun run bench:row     # what a DataGrid row's Bond costs, decomposed; ungated attribution tool
```

**`bench:growth` is the gate for one specific defect class: a per-child read of something the
parent owns.** It mounts n children under one Bond at four sizes and fits `t ∝ n^k`; `k ≈ 1` is
linear, and anything near 2 means every child is reading an owner-wide getter, so each registration
invalidates every sibling. Two of those shipped undetected and cost 92× (tree) and ~3× (accordion)
on mount — `bench:ssr` could not see either, because children register from `onmount`, which never
runs on the server. Add a family to `src/lib/test/perf/growth/` whenever its Bond gains a child
`Collection`; `growth-coverage.spec.ts` fails until you do. Details and the fix pattern:
`docs/research/perf-vs-shadcn-2026-08.md` §7.

**Never run long-lived processes in the foreground** (`vite dev`, `storybook dev`, any
`--watch`) — they hang the turn. Launch detached (Bash `run_in_background: true`, or
`nohup <cmd> >/tmp/<name>.log 2>&1 &`), poll the log/port, then kill the process.

## Conventions

- Files, components, directories: kebab-case. Variables/functions: camelCase.
- **Import internals through `$ixirjs/ui/…`, never `@ixirjs/ui/…`.** The `$` alias resolves to
  `src/lib`; the package specifier resolves to `src/lib/public` — the hand-curated published
  surface, a strict subset. Four families had drifted onto it and were authoring themselves through
  their own public barrel. `no-restricted-imports` enforces this under `components/` and every infra
  layer; `src/lib/test/**` is exempt, since exercising the published surface is its job.
- **A family imports the seam from `$ixirjs/ui/kernel/kernel.svelte`, its prop types and motion from
  `$ixirjs/ui/authoring`, and behaviour models from `$ixirjs/ui/capability`.** Two barrels, one
  division: authoring is how a part is built, capability is how it behaves. Reaching _inside_ a layer
  is a lint error; the render-machinery files under `components/` that are exempt are named in
  `kernel-authoring-audit.spec.ts`.
- **An element generic is constrained on `HtmlElementTagName`** (exported from
  `$ixirjs/ui/authoring`), not on a re-spelled `keyof HTMLElementTagNameMap`. Same type; one
  place to widen it if `ElementTagName` ever has to cover SVG too, which is why the alias exists.
- **A long list windows through `createVirtual`, never a hand-rolled one.** The rune
  (`src/lib/runes/virtual.svelte.ts`, exported from `@ixirjs/ui`) owns the scrolling, measuring and
  positioning and returns three spreads — `viewport(style?)`, `content(style?)`, `item(item, style?)`
  — while the markup stays yours. Each takes your own style as an argument rather than as a separate
  attribute: a `style` attribute cannot be combined with a spread in either order, so passing it
  merges instead of choosing. Virtualization is opt-in at the call site — there is no windowed
  component to reach for, by design: a capability needs a Bond, a Bond needs a root, and the root
  then owns the markup a caller wanted to write. Rationale and the rejected designs:
  `docs/research/virtualization-decision-2026-07.md`.
- Commit messages: short, present tense, no filenames.
- **Conditionals dispatch a snippet; they do not open an `{#if}` block.**

  ```
  {@render (children ?? fallback)(arg)}       consumer-or-default
  {@render (cond ? branchA : branchB)()}      two outcomes
  {@render (cond ? branch : undefined)?.()}   optional — compiles to `?? noop`
  ```

  An `{#if}` block emits two hydration anchors (live comment nodes at runtime), a render tag
  emits one, and a snippet branch is `EFFECT_TRANSPARENT` so consumer content keeps reacting to
  an outer block's enter/exit — an `{#if}` branch is transparent only as an `{:else if}`.
  `{#if children}{@render children()}{/if}` is just `{@render children?.()}`. Rationale and the
  measured per-construct cost table: `docs/research/hydration-anchor-diet-2026-08.md`.

  Four things that bite when writing them: TypeScript narrowing does **not** cross into a snippet
  body (assert, and name the dispatch that proves it); a snippet written among a component's
  children is passed to it as a **prop**, not defined locally; `{@const}` does not survive its
  block (hoist to `$derived`); a snippet used inside `{#each}` takes the item as a parameter.

- **Snippets are declared at the bottom of the template**, after the markup and before any
  `<style>`, ordered by first use (a snippet only another snippet dispatches follows its
  referrer). Snippets that are component props stay where they are passed — they are arguments,
  not declarations.

---

## Authoring on the redesigned Kernel

`src/lib/kernel/kernel.svelte.ts` is **the** element seam. Every family authors through it
(`docs/research/whiteboard-2026-08.md`, `docs/research/whiteboard-migration-recipe.md`); the Bond/Atom
runtime, `defineBond`/`definePart`/`useRoot`/`defineLeaf` and the capability registry were deleted on
2026-08-27. Import the seam from `$ixirjs/ui/kernel/kernel.svelte` — eslint and
`kernel-authoring-audit.spec.ts` allow exactly that path.

Copy **Card** for a presentation family, **Accordion** for a behavioural one, **Popover**/**Dialog**
for an overlay.

### Canonical popup families

Popover, DropdownMenu, Select, Combobox, Tooltip, ContextMenu, DatePicker and PopoverDialog now
share `components/overlay/popup/PopupBond` (implemented in `bond.svelte.ts`) and one collection-item
runtime. Read `src/lib/components/overlay/popup/README.md` before changing these families. Their
family Bond names are interfaces only; legacy constructors and popup `factory` props are removed.
Use `PopupBond.create` for standalone state or `PopupBond.mount` inside a component root. Parts still use the same Kernel seam, contexts and presets.

## Component anatomy

A multi-part component is a folder `src/lib/components/<name>/`:

- `bond.svelte.ts` — one plain state class per shared object (`CardBond`, `AccordionItemBond` — the
  names stay), each with `static create(props)`, live `props` (an object of getters the root builds),
  and `XContext = Kernel.context<XBond>('bond/<name>')`. The brain. No base class, no registry.
- `<name>-root.svelte` — builds the live props, shares the Bond, wires the controlled props, renders
  the root element.
- `<name>-<part>.svelte` — one component per slot, each calling `Kernel.element`.
- `types.ts`, `atoms.ts` (the namespace barrel), `index.ts`, `stories/<name>.stories.svelte`,
  optional `motion.svelte.ts` / `attachments.svelte.ts`.
- Colocated `*.svelte.spec.ts` asserting **rendered outcomes** — ids, ARIA, `data-*`, keyboard —
  never machinery.

Static modules (Button) use the smaller layout: component + `types.ts` + `index.ts`. Mirror the
appropriate layout; don't invent a new file split.

## The Bond — a plain state class

- **State lives on the Bond**: shared props, `$derived` values, mutation methods, collections.
- **Mutate through methods** (`open()`, `toggle()`, `select()`); parts call these and never write
  props directly.
- **Read through predicates**: `is*`/`has*`/`can*` for booleans, plain nouns otherwise. A getter
  never shadows a verb — `isOpen`, not `get open()`.
- **Identity**: the root passes `id: () => $props.id()` into the live props; the Bond exposes
  `get id()` and one getter per part id, each `Kernel.id(this.id, '<family>-<part>')`. Ids are
  SSR-deterministic and survive hydration. `generateId()` fills in outside a component and is never
  rendered as a bare id. `root-identity-audit.spec.ts` enforces the seed.
- **Cross-part ARIA** is either derived from the seed (the header names `bond.bodyId` even on the
  server) or a child writing its id into a parent `$state` field at init (`card.titleId`), read back
  in the parent's `attrs`. There is no registry to ask.
- **A collection** is a mount-ordered `Map` the child registers at its own init and releases on
  teardown (`const detach = parent.attach(id, self); $effect(() => detach)`). Anything reactive
  derived from membership goes through ONE equality-gated `$state` (the accordion's tab stop), never
  a reactive array every child reads — that is the `bench:growth` defect class.
- **Behaviour models are plain functions**: `createDisclosure`, `createSelection`, `createRovingFocus`,
  `createTypeahead`, `createInput`, `createSort`, `createPagination` from `$ixirjs/ui/capability`.
  What a capability used to project onto an element is now written literally in a part's `attrs`.
- **Controlled props**: the root owns the `$bindable`s and wires `bond.bindCommit((next, ctx) => {
value = next; onvaluechange?.(next, ctx); })`. The write is equality-gated inside the Bond, so an
  unchanged value reports nothing, and the callback fires after the write with `{ bond }` plus the
  staged `event`/`reason`.

## Parts

```svelte
const el = Kernel.element(() => restProps, {
	preset: 'accordion.item.header',
	class: 'relative box-border flex w-full cursor-pointer items-center',
	state: bond,
	layer: () => bond.props.presets?.header,
	attrs: () => ({ id: bond.headerId, 'aria-expanded': bond.isOpen, onclick, onkeydown })
});
```

Then **either** spread it on a literal tag — `<div {...el.attrs}>` — **or**, when the part has a
reason to dispatch, bind one leaf and render it:

```svelte
const leaf = Kernel.render(el);
{@render leaf(el, children, { accordionItem: bond })}
```

An identifier callee compiles to a direct call: no block, no branch, no hydration anchor. The inline
`{@render Kernel.render(el)(…)}` form is a block with an anchor — never write it.

**The reasons to dispatch, and only these:** real `enter`/`exit` transitions; a `base` renderer the
part or a consumer may name; a polymorphic tag (`as` as a thunk); a preset that themes retag through
`render.as`/`render.base` (a literal part cannot honour it, and DEV warns). Everything else is a
literal tag, which is a block, a branch, a `BranchManager` and an anchor cheaper per part.

**Config precedence** inside `attrs`: `class` first, then the preset's attributes, the variant's, the
layer's, the part's own, then the consumer's props. A part's own `class` sits after the base class and
before the preset and the consumer's. `'$preset'` inside a `class` array is replaced by the resolved
preset classes.

**Interpreted props** in the props thunk: `class`, `as`, `base`, `defaults`, `variants`,
`variantProps`, `motion`, `oninit`, `preset`, `presetLayer`, `bond`, `part`, `children`. Everything
else is an element attribute. `part` is the exception that is both: a string is forwarded as the CSS
shadow-parts attribute.

**Motion.** `enter`/`exit` select a transition leaf; an `animate`-only driver does NOT belong in
`motion` — it escalates to `HtmlElement`, a component boundary worth **+2 hydration anchors per
part**. Mint `createAttachmentKey()` once at init, put the driver in `attrs`, and return a cleanup
that cancels the superseded run (`stopMotion(controller, node)`). Tree and Collapsible are the
worked examples. A part that declares `motion: () => motion ?? defaults` and yields nothing at init
falls back to the consumer's motion and then the preset's, both honoured by the Kernel.

**Handlers.** The seam composes a consumer's handler with the part's (consumer first, part skipped
when the default was prevented). Gate the part's own handler on `event.defaultPrevented` as well —
a consumer who calls `preventDefault()` from their own listener never passes a prop for the seam to
compose. Never re-invoke a merged handler by hand.

**Lifecycle has one owner.** `oninit` fires synchronously pre-mount on the server and again on client
hydration (keep it idempotent); its returned cleanup runs on client teardown. `onmount`/`ondestroy`
ride the motion path. Don't add competing lifecycle `$effect`s in parts.

**Traps.** `Kernel.element` resolves during init and reads the thunk then, so a `$derived` the config
names must be declared above the call. Never leave `class` in the destructure — it would drop the
consumer's class from `restProps`. Never spread a rest-props proxy into a new object inside a
`$derived`; hand it over as `() => restProps` so it is read inside the helper's tracked boundary.

### Don't re-skin a leaf by mounting it

A part that needs another part's presentation **renders the element itself** through the seam; it does
not mount that component and spread into it. `Select.Item` and `DropdownMenu.Item` used to render
`<List.Item {...itemAttrs}>`, which cost a second component boundary and a `spread_props` proxy:
collapsing both took an item from **12.51 to 8.07 µs (−35%)**, **73 to 51 scavenges**, **445 to 422
bytes** and **12 to 9 hydration anchors**. `docs/research/nesting-component-vs-snippet-2026-08.md`
has the model; `{...spread}` into a component costs +165% on SSR and +451% on a targeted client
update against explicit props.

The shared presentation moves into a helper both sides call — `components/list/item-class.ts` exports
`LIST_ITEM_AS` and `listItemClass(own, klass)` — so the class string still exists once. **Keep the
preset expression verbatim** when doing it: waking a dead fallback is a silent restyle
(`list.item` is `px-4 py-3` against `select.item`'s `px-2 py-1.5`).

This applies only where the inner component is a plain leaf. It does **not** apply to the
prop-defaulting wrappers (`Tooltip.Content` → popover `Content`, `Tabs.Body` → `Stack.Root`,
`Combobox.Control` → `Input.Control`): those own real state, several take `bind:` props that cannot
cross a snippet seam, and they are one-per-overlay rather than one-per-item. `menu-ssr.spec.ts` and
the `menu item` case in `anchor-budget.spec.ts` are the gates.

**A namespaced component costs more than the same component imported directly.** `<Card.Title>` is a
member expression, so the compiler treats it as a _dynamic_ component and wraps its output in a
fragment boundary. Re-measured on 2026-08-27 with `bench:vs-shadcn`, on the SAME shipped components
with only the call site changed (`card` vs `card-direct`): **mount −20% (45.9 → 36.9 µs/card),
hydrate −27% (57.9 → 42.1), broad update −41%, retained heap −21% (14.1 → 11.2 kB), and SSR 15 → 9
hydration anchors** — about **2.2 µs and 1.5 anchors per part**. Against shadcn that flips card's
mount from +23% to −23%.

Every family barrel therefore publishes both: the namespace (`Card.Root`, the ergonomic default)
and the parts by name (`export { CardRoot } from '@ixirjs/ui/components/card'`). Use the direct
import where one part renders many times — a long list, a grid cell, a table row. A part whose name
is already taken in its barrel by a type (`DropdownMenuItem`, `SelectSelection`) is not re-exported;
import that file directly.

### Handing props to another component

`{...part.props}` / `mergePresetProps` remain for a part that hands its props to **another
component** rather than rendering an element — `Input.Control`, `PortalHost`, `Stack.Root`,
`Dialog.Content` → `PortalHost`. Rendering an element uses `Kernel.element`; a packet allocates a
merged object and a signal the direct seam avoids.

`PortalHost`'s `id` names the **portal** it opens, never the wrapper element (`Root` names its own
`root.l0`). A part that must address its own element by id passes `elementId` as well.

## Consumer prop typing — the library ships the seam, not the union

Preset-driven props (`variant`, `size`, …) are **never declared in the library**. A preset is
swappable, so only the application knows which values its own preset defines; a union here would
wrongly reject them. Consumers declare them by declaration merging, via one of two routes:

- **Interface-shaped props** (`ButtonProps`, `CardRootProps`) — augment the props interface itself.
- **Type-alias props** (`TreeRootProps`, `FormRootProps`, every `ContextMenu*Props`) — a type alias
  cannot be merged, so the family exports an empty `<Family><Slot>ExtendProps` interface and
  intersects it into the alias. Augment that.

When adding a family, give every type-alias prop type a seam; interface-shaped ones need none and
should not get a redundant second route. `scaffold` emits the seams for new families, and
`props-augmentation.type-test.ts` proves both routes still reach the component and still reject an
out-of-union value. Note aliases that merely re-point at another family's interface
(`CardContentProps = CardBodyProps`) inherit that interface's augmentability and need no seam.

## Svelte 5 runes traps (these have bitten us)

- **A lazy collection inside a `$derived` poisons tracking.** If a class lazily creates a
  `collection()`, touch it eagerly in the constructor (`void this.rows`) so the dependency is
  established outside the derived.
- **Never spread a rest-props proxy into a new object inside `$derived`.** Hand rest props to a
  helper as `() => restProps` (`Kernel.element`'s config thunk) so it reads them within its own
  tracked boundary.
- **Init is the `oninit` prop**, not a symbol — symbols don't survive server `rest_props`, which is
  why the symbol-keyed lifecycle keys were deleted with the old runtime. It fires synchronously
  pre-mount on the server and again on client hydration, so keep it idempotent; the returned cleanup
  runs on client teardown only. Once-per-family SSR logic belongs in the state class's constructor.
  `kernel/render/lifecycle-seam.svelte.spec.ts` pins it.
- **Nothing read from a dispatch block may depend on Bond state, however well gated.** Svelte re-runs
  a block effect eagerly when a source it reaches through any derived chain is written during effect
  flush, and a child registering at mount is exactly that write. That defect cost every accordion
  header 1206 renders per item at n=800 (`bench:growth` k = 1.34 → 0.80).
  `perf-vs-shadcn-2026-08.md` §15.

## Tests and stories

- **Hard rule:** any `.svelte` used only by tests lives under `src/lib/test/<domain>/`, named
  `*.test.svelte`, imported via `$ixirjs/ui/test/...`. Never colocate test-only Svelte in
  `src/lib/components/**` or `src/lib/shared/**`; never move product, docs, demo, or Storybook
  `.svelte` files into `src/lib/test/`.
- Story house style: a live readout `<code>` line, an inline why-comment, design tokens, `{#key}`
  for round-trip demos. **Never `console.log`** in a story. "component annotation is missing from
  the default export" after adding a `<Story>` means a stale dev server — restart with the cache
  cleared.

## Don't churn known-dead code

Some code is intentionally vestigial or pending removal (e.g. element-less roots' vestigial
`rest`). Confirm before deleting anything that merely looks dead, and flag out-of-scope bugs
rather than fixing them mid-pass.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
