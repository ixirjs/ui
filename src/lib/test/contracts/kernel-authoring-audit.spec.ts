import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, it } from 'vitest';

/**
 * Two ratchets on how family code reaches the authoring infrastructure.
 *
 * This spec used to test for four module paths — `components/atom/html-atom`, `part-element`,
 * `use-part-element`, `shared/authoring/use-part` — and two call shapes, `usePartElement(` and
 * `partElement(`. Every one of them had already been deleted from the library. The spec passed on
 * every run and guarded nothing: a test whose offender set is unreachable is a green light wired to
 * no sensor. It is replaced here by counts of things that actually exist.
 *
 * Both numbers are ceilings that may only go DOWN. They fall as
 * `docs/research/authoring-seam-consolidation-2026-08.md` proceeds; a rise means a family reached
 * past the seam, which is the decay this exists to catch.
 */

const COMPONENTS = join(process.cwd(), 'src/lib/components');

/**
 * Files allowed to reach infrastructure by deep path, each because it *is* infrastructure that
 * happens to sit under `components/`.
 *
 * Named rather than counted: a bare ceiling says "seven are fine" without saying which, so the next
 * offender slots into the allowance unnoticed. These seven consume Kernel internals
 * (`createPresentation`, `extractMotion`, the element branches, `resolveBondPart`) that are not
 * authoring seams and must not be promoted into the barrel just to satisfy a lint rule — doing so
 * would publish the render machinery as though a family were meant to call it.
 *
 * `element/{html,svg}-element.svelte` are ADR 0009's low-level DOM/motion leaves. The controls
 * carry their own presentation plumbing. `popover/bond.svelte.ts` resolves a part declaration to
 * project overlay ARIA.
 */
const RENDER_MACHINERY = new Set([
	'element/html-element.svelte',
	'element/svg-element.svelte',
	'input/shared.ts',
	'popover/bond.svelte.ts',
	'slider/slider.svelte',
	'switch/switch.svelte',
	'textarea/textarea-input.svelte'
]);

/**
 * Names from the deleted runtime. It went on 2026-08-27 with the last family that used it, so a
 * file naming one of these does not compile — but a re-introduction would arrive as a NEW module
 * with the old shape, which compiles fine and quietly forks the authoring model in two. This is the
 * sensor for that; it is a list of names, not a ceiling, because the answer is zero forever.
 */
const DELETED_RUNTIME =
	/\b(?:defineBond|definePart|defineLeaf|useRoot|createAtomInstance|createAtomInstanceOptions|bindBond|defineAtom|registerCapabilities)\s*\(|from '\$ixirjs\/ui\/bond'/;

function componentFiles(directory: string): string[] {
	const found: string[] = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			if (entry.name !== 'stories') found.push(...componentFiles(path));
		} else if (entry.name.endsWith('.svelte') || entry.name.endsWith('.ts')) found.push(path);
	}
	return found;
}

// Comments are stripped before matching: a file is allowed to SAY `defineBond` — several explain
// what the fusion used to be — and the sensor is about code that calls it.
function withoutComments(source: string): string {
	return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

const families = componentFiles(COMPONENTS).map((path) => ({
	name: relative(COMPONENTS, path),
	source: readFileSync(path, 'utf8')
}));

/**
 * The element seam (`docs/research/whiteboard-2026-08.md`). It IS the authoring surface —
 * `Kernel.element`/`render`/`context`/`id`/`claimId` — and every family imports it from this exact
 * path, so the deep-path rule below does not apply to it.
 */
const REDESIGNED_SEAM = /from '\$ixirjs\/ui\/kernel\/kernel\.svelte'/g;

it('reaches infrastructure through the authoring barrel, not by deep path', () => {
	const offenders = families
		.filter(({ name }) => !RENDER_MACHINERY.has(name))
		.filter(({ source }) =>
			/from '\$ixirjs\/ui\/(?:kernel|bond|authoring)\//.test(source.replace(REDESIGNED_SEAM, ''))
		)
		.map(({ name }) => name);

	expect(offenders).toEqual([]);
});

it('keeps the render-machinery allowance honest', () => {
	// The other direction: a file that stops needing its exemption must lose it, or the allowance
	// grows into a place offenders can hide.
	const stale = [...RENDER_MACHINERY].filter((name) => {
		const file = families.find((f) => f.name === name);
		return !file || !/from '\$ixirjs\/ui\/(?:kernel|bond|authoring)\//.test(file.source);
	});

	expect(stale).toEqual([]);
});

it('never re-introduces the deleted Bond/Atom authoring runtime', () => {
	const offenders = families
		.filter(({ source }) => DELETED_RUNTIME.test(withoutComments(source)))
		.map((f) => f.name);

	expect(offenders).toEqual([]);
});
