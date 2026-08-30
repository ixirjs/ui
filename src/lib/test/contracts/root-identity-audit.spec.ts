import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Every Bond-owning root seeds its identity from `$props.id()`.
 *
 * The seed is what makes server output reproducible: without it a Bond falls back to
 * `generateId()`, a module-scoped counter that keeps incrementing across requests in a server
 * process, so the same component renders `ix47` on the server and `ix1` in the browser and every
 * element id derived from it mismatches on hydration.
 *
 * This was documented prose and drifted — one root had fallen through it. The rule is narrow and
 * mechanical, so it belongs in a test rather than in a guide: a root that binds no Bond owns no
 * identity and needs no seed, which is why the delegating wrapper roots are not flagged.
 *
 * Both binding seams count. `useRoot` wraps `bindBond`, so a root that switched to it still owns a
 * Bond and still needs the seed — matching only the inner call would have quietly dropped every
 * migrated root out of this audit while it kept reporting green.
 *
 * That failure mode is the reason for `declares every binding seam` below. This list selects which
 * roots get audited, so an unlisted seam does not fail the audit — it removes roots from it, and
 * the suite still reports green while guarding less. The list is therefore checked against the
 * authoring barrel's own exports: adding a seam there fails this spec until the seam is classified
 * here, which turns a silent loss of coverage into a loud one.
 */
const BINDING_SEAMS = ['bindBond', 'useRoot'];

/**
 * Authoring exports that are deliberately not Bond-binding seams. `defineBond` is declaration-time
 * and renders nothing. Anything not listed in either set is unclassified and fails.
 */
const NON_BINDING_EXPORTS = [
	// Declaration-time. Renders nothing, binds nothing.
	'defineBond',
	'defineAtom',
	'Bond',
	'Atom',
	'Collection',
	'bondContextKey',
	'generateId',
	// Descendant seams. They resolve a Bond from context — they never construct or bind one, which
	// is exactly why a part needs no identity seed of its own.
	'definePart',
	'defineLeaf',
	'Kernel',
	'createAtomInstance',
	// A prop cell. It is *placed in* a root's props spec and adopted by `useRoot`; on its own it
	// binds nothing, so a file mentioning it without `useRoot` owns no Bond.
	'controlledProp',
	// Presentation and lifecycle helpers. No Bond involvement.
	'resolvePreset',
	'mergeAtomProps',
	'mergePresetProps',
	'componentBase',
	'createLifecycleKey',
	'isLifecycleKey',
	'lifecycleType',
	'getLifecycleProps',
	'runLifecycle',
	'getElementId',
	// Type-level only: re-introduces a generic parameter `typeof` erases. Returns its argument.
	'specializeDefinition',
	// Motion. A part animating itself owns no Bond.
	'animate',
	'DURATION'
];

const AUTHORING_BARREL = join(process.cwd(), 'src/lib/authoring/index.ts');
const COMPONENTS = join(process.cwd(), 'src/lib/components');

/** Value exports only: a seam is something a root calls, and `export type` declares no callable. */
function authoringValueExports(): string[] {
	const source = readFileSync(AUTHORING_BARREL, 'utf8');
	const names = new Set<string>();
	for (const block of source.matchAll(/export\s*\{([^}]*)\}/g)) {
		for (const entry of block[1]!.split(',')) {
			const name = entry.trim();
			if (!name || name.startsWith('type ')) continue;
			names.add(name.split(/\s+as\s+/)[0]!.trim());
		}
	}
	return [...names];
}

function rootFiles(directory: string): string[] {
	const found: string[] = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) found.push(...rootFiles(path));
		else if (entry.name.endsWith('-root.svelte')) found.push(path);
	}
	return found;
}

describe('bond root identity seeding', () => {
	const roots = rootFiles(COMPONENTS);

	it('finds the root modules to audit', () => {
		expect(roots.length).toBeGreaterThan(20);
	});

	it('declares every binding seam the authoring barrel exports', () => {
		const classified = new Set([...BINDING_SEAMS, ...NON_BINDING_EXPORTS]);
		const unclassified = authoringValueExports().filter((name) => !classified.has(name));
		// A new authoring export is either a Bond-binding seam (add it to BINDING_SEAMS, so roots
		// using it are audited) or it is not (add it to NON_BINDING_EXPORTS, with the reason).
		expect(unclassified).toEqual([]);
	});

	it('declares only seam names the library still exports', () => {
		// Guards the other direction: a renamed seam would stop matching any source and silently
		// audit nothing. Existence is checked against the exports rather than against current root
		// usage — every root binds through `useRoot` today, but `bindBond` remains the experimental
		// primitive, and it must stay listed so a root that reaches for it directly is still audited.
		const exported = [
			readFileSync(AUTHORING_BARREL, 'utf8'),
			readFileSync(join(process.cwd(), 'src/lib/public/shared.ts'), 'utf8'),
			readFileSync(join(process.cwd(), 'src/lib/public/experimental.ts'), 'utf8')
		].join('\n');
		const missing = BINDING_SEAMS.filter((seam) => !exported.includes(seam));
		expect(missing).toEqual([]);
	});

	for (const path of roots) {
		const name = relative(COMPONENTS, path);
		const source = readFileSync(path, 'utf8');
		if (!BINDING_SEAMS.some((seam) => source.includes(seam))) continue;

		it(`${name} seeds its Bond from $props.id()`, () => {
			expect(source).toContain('$props.id()');
		});
	}

	/**
	 * One seam, enforced rather than observed.
	 *
	 * `useRoot` is the seam every root binds through — with `atom: false` for a root that renders no
	 * element of its own. `bindBond` is the experimental primitive `useRoot` delegates to, and stays
	 * listed in BINDING_SEAMS so that a root reaching for it directly is still identity-audited. But
	 * a root reaching for it directly is exactly what this rule exists to prevent: it re-splits the
	 * root story into two shapes and re-opens the hand-written share/adopt sequence that
	 * `controlledProp` and `useRoot` removed.
	 *
	 * Kept as a test, not prose, because the previous version of this rule WAS prose and drifted.
	 */
	it('binds every root through useRoot, not bindBond directly', () => {
		const offenders = roots
			.filter((path) => readFileSync(path, 'utf8').includes('bindBond'))
			.map((path) => relative(COMPONENTS, path));
		expect(offenders).toEqual([]);
	});
});
