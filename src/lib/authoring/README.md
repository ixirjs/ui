# `authoring`

**The prop types, identity helpers and motion a component family imports.** One barrel, no deep
imports.

It used to carry the seams as well — `defineBond`, `useRoot`, `definePart`, `defineLeaf` — plus the
Bond/Atom runtime they declared against. All of that was deleted on 2026-08-27, when the last family
moved to the redesigned Kernel (`docs/research/whiteboard-2026-08.md`). There is one seam now, and it
lives in `kernel/`:

```svelte
const el = Kernel.element(() => restProps, { preset: 'card.title', class: '…', state: card });
```

`<div {...el.attrs}>` for a literal part; `const leaf = Kernel.render(el)` bound once, then
`{@render leaf(el, children)}`, for a part with a reason to dispatch (transitions, a `base`
renderer, a polymorphic `as`, a preset that retags). `docs/research/whiteboard-migration-recipe.md`
is the full shape, and Card/Accordion/Popover are the exemplars.

## What is here

- **Prop types** every part declares: `RenderProps`, `PlainPartProps`, `Base`, `BasePropsOf`,
  `SnippetProps`, `Variants`, `LeafAttrs`, `ElementType`, `HtmlElementTagName`, plus
  `BondPresetLayers`/`BondStateProps` for a family's `presets` bag and identity seed.
- **`componentBase`** for a part that names a renderer component.
- **`resolvePreset` / `mergePresetProps`** for a part that hands its props to ANOTHER component
  rather than rendering an element. A part that renders one passes `preset`/`layer` in the Kernel
  config instead.
- **Identity**: `generateId` (outside a component only — never rendered as a bare id) and
  `getElementId`.
- **Motion**: `animate`, `DURATION` and the animation types.

## Rules

- **Named re-export form only** — never a star re-export, and never a value re-exported through an
  intermediate module. `root-identity-audit.spec.ts` parses this form.
- **Nothing imports _into_ `authoring/`.** It is the top infra layer; the edges run
  `components → authoring → kernel`.
- **Capability models are not re-exported here.** There are ~284 of them; funnelling that surface
  through this file would make importing a prop type reach the whole behaviour catalogue. A family
  composing behaviour imports from `$ixirjs/ui/capability` — a peer layer with its own barrel.
  Note the alias: `$ixirjs/ui/capability` is the INTERNAL path. There is no `./capability` package
  export, so a consumer authoring their own family takes the same factories from
  `@ixirjs/ui/shared`, which re-exports them.
