/**
 * The authoring barrel — the types and helpers a component family imports.
 *
 * It used to carry the seams as well (`defineBond`, `useRoot`, `definePart`, `defineLeaf`) plus the
 * Bond/Atom runtime they declared against. Every family authors through `Kernel.element` now — a
 * plain state class under `Kernel.context`, parts that spread `el.attrs` on a literal tag — so what
 * is left here is what those families actually import: the prop types every part declares, the
 * identity helpers, and motion. ADR 0008, `docs/research/whiteboard-2026-08.md`.
 *
 * ## Rules for this file
 *
 * - **Named re-export form only — never a star re-export.** `root-identity-audit.spec.ts` parses
 *   this form, and a value re-exported through an intermediate module drags that module's graph in.
 * - **Nothing imports *into* `authoring/`.** It is the top infra layer; the edges run
 *   `components → authoring → kernel`. A default borrowed from a family would invert that.
 *
 * Capability models are deliberately NOT re-exported here: a family composing behaviour imports
 * from `$ixirjs/ui/capability`, a peer layer with its own barrel. Two barrels, one division —
 * **`authoring` is how a part is built, `capability` is how it behaves.**
 */

// ── Prop types every part declares ───────────────────────────────────────────
export type {
	ComponentBase,
	SnippetBase,
	AnySnippet,
	Base,
	BasePropsOf,
	SnippetProps,
	Variants,
	RenderProps,
	PlainPartProps,
	LeafAttrs,
	ElementType,
	HtmlElementTagName,
	BondPresetLayers,
	BondStateProps
} from '$ixirjs/ui/kernel/types';
export { componentBase, type ExplicitBase } from '$ixirjs/ui/kernel/render/render-target';

// ── Presentation helpers a part hands to ANOTHER component ───────────────────
// A part that renders its own element passes `preset`/`layer` in the Kernel config instead.
export { resolvePreset, mergePresetProps } from '$ixirjs/ui/kernel/resolve';

// ── Identity ─────────────────────────────────────────────────────────────────
// Element ids derive from the family's identity seed (`Kernel.id`), never from `$props.id()`
// directly; `generateId` fills in outside a component (tests, programmatic construction).
export { generateId } from '$ixirjs/ui/utils/id';
export { getElementId } from '$ixirjs/ui/utils/dom.svelte';

// ── Motion ───────────────────────────────────────────────────────────────────
// A part that animates declares it here rather than reaching for the WAAPI helper by path.
export {
	animate,
	type AnimationController,
	type AnimationKeyframes,
	type AnimationOptions,
	type Easing
} from '$ixirjs/ui/utils/animate';
export { DURATION } from '$ixirjs/ui/constants/motion';
