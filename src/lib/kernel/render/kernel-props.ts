/**
 * The kernel prop vocabulary, owned once.
 *
 * Three lists used to spell the same facts in three places: `KERNEL_PROP_NAMES` in
 * `kernel/element.svelte.ts` (which props are not element attributes), `hasRichProps` in
 * `kernel/index.svelte.ts` (which props force full presentation), and the motion tests spread
 * across `renderMode`/`declaresTransition`. They had to be edited together and nothing enforced
 * it: a name added to one list and missed in another silently changes which lane a part takes,
 * which is invisible in the rendered output and shows up only as a performance or resolution bug.
 *
 * This module is the single source. It is plain TypeScript with no Svelte or runtime imports so
 * every seam can reach it without a cycle.
 */

/**
 * Props Kernel interprets. Everything else in a config is an element attribute.
 *
 * `part` is here and is *also* a real HTML attribute — the attrs assembler re-adds it when it is a
 * string. `children` is here because a body is dispatched, never spread.
 */
export const KERNEL_PROP_NAMES: ReadonlySet<string> = new Set([
	'class',
	'as',
	'base',
	'variants',
	'variantProps',
	'defaults',
	'motion',
	'oninit',
	'preset',
	'presetLayer',
	'bond',
	'atom',
	'part',
	'children'
]);

/**
 * Presentation props: a defined value on any of these means the class-only lane cannot express the
 * part, because each one feeds a resolution stage that lane skips.
 *
 * `preset` and `class` are deliberately absent — the fast lane resolves both. `as` is absent
 * because it is compared against the plan's own tag rather than merely being present.
 */
export const PRESENTATION_PROP_NAMES: ReadonlySet<string> = new Set([
	'base',
	'variants',
	'variantProps',
	'defaults',
	'oninit',
	'presetLayer',
	'bond',
	'atom'
]);

/**
 * Motion and element-lifecycle props. `null` counts as absent here, alongside `undefined`:
 * `enter={null}` turns a preset-declared transition off, and the class-only lane only ever serves a
 * part whose preset entry is class-only — so there is no transition for it to cancel.
 */
export const MOTION_PROP_NAMES: ReadonlySet<string> = new Set([
	'motion',
	'initial',
	'enter',
	'exit',
	'animate',
	'onmount',
	'ondestroy',
	'onintroend',
	'onexitend'
]);

/**
 * Does this part need full presentation resolution, or can the class-only lane serve it?
 *
 * Iterates the caller's props once rather than probing each known name: the input is usually a
 * rest-props proxy, where one walk is cheaper than twenty-six lookups, and the common answer is
 * "no rich prop present" so the walk exits having found nothing.
 *
 * `global` returns true on presence alone, not on value: it selects a transition scope, and a part
 * that mentions it is asking for the transition machinery either way.
 */
export function needsPresentation(props: Record<string | symbol, unknown>): boolean {
	for (const key in props) {
		if (key === 'global') return true;
		const value = props[key];
		if (value === undefined) continue;
		if (PRESENTATION_PROP_NAMES.has(key)) return true;
		if (value !== null && MOTION_PROP_NAMES.has(key)) return true;
	}
	return false;
}
