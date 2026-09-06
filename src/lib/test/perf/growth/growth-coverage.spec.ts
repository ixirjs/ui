import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { FIXTURES } from './fixtures.js';

/**
 * Keeps `bun run bench:growth` honest about its own scope.
 *
 * The growth gate can only catch an O(n²) in a family it has a fixture for, and the defect class it
 * exists for — a per-child read of something owner-wide — is possible exactly when a Bond owns a
 * child `Collection`. So the fixture list is checked against the source rather than maintained by
 * memory: add `this.collection<…>(…)` to a new family and this fails until a growth fixture exists.
 *
 * Same reasoning as `root-identity-audit.spec.ts`, and for the same failure mode: a benchmark that
 * silently stops covering a new family keeps reporting green while the thing it guards walks out.
 */
const COMPONENTS = join(process.cwd(), 'src/lib/components');
// `this.collection<…>` on the older runtime; a mount-ordered `items` map on the redesigned Kernel.
// The menu families' map is a `SvelteMap` — roving and typeahead read the membership itself, not
// just facts derived from it — so the reactive spelling counts as ownership too.
const OWNS_COLLECTION =
	/\bthis\.collection<|(?:readonly|const) items = new (Svelte)?Map<|new Collection</;

function familiesOwningACollection(): string[] {
	const owners = new Set<string>();
	for (const family of readdirSync(COMPONENTS)) {
		const dir = join(COMPONENTS, family);
		if (!statSync(dir).isDirectory()) continue;
		for (const file of walk(dir)) {
			if (!file.endsWith('.svelte.ts') && !file.endsWith('.ts')) continue;
			if (file.includes('.spec.')) continue;
			if (OWNS_COLLECTION.test(readFileSync(file, 'utf8'))) {
				// Popup profiles share exactly two collection paths: menu and selection. These fixtures
				// cover the canonical map, including ContextMenu/Combobox's shared item implementation.
				if (file.endsWith('/overlay/popup/bond.svelte.ts')) {
					owners.add('dropdown-menu');
					owners.add('select');
				} else owners.add(family);
			}
		}
	}
	return [...owners].sort();
}

function* walk(dir: string): Generator<string> {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) yield* walk(path);
		else yield path;
	}
}

describe('growth benchmark coverage', () => {
	it('has a fixture for every family whose Bond owns a child collection', () => {
		const covered = new Set(FIXTURES.map((fixture) => fixture.name));
		// `form` fields register through the same `Collection`, but a form is composed per field
		// rather than by repeating one child component, so its fixture is a different shape and is
		// tracked separately. Listed here rather than omitted silently.
		const deferred = new Set(['form']);
		const missing = familiesOwningACollection().filter(
			(family) => !covered.has(family) && !deferred.has(family)
		);

		expect(
			missing,
			`These families own a child Collection but have no growth fixture in ` +
				`src/lib/test/perf/growth/. A Bond that registers n children can develop the O(n²) ` +
				`described in docs/research/perf-vs-shadcn-2026-08.md §7, and bench:growth cannot see ` +
				`a family it has no fixture for. Add one (one owner, n children) and register it in ` +
				`fixtures.ts.`
		).toEqual([]);
	});

	it('lists no fixture for a family that no longer owns a collection', () => {
		const owners = new Set(familiesOwningACollection());
		// Menu and selection paths now come from the shared popup runtime scan above.
		// `datagrid-columns` and `tree-depth` are SECOND axes of their families, not families of
		// their own: neither name can match a directory and neither must read as stale. A family
		// earns more than one growth shape when a child reads more than one owner-wide thing --
		// `datagrid` a second collection, `tree` its ancestor chain.
		const inherited = new Set(['datagrid-columns', 'tree-depth']);
		const stale = FIXTURES.map((fixture) => fixture.name).filter(
			(name) => !owners.has(name) && !inherited.has(name)
		);

		expect(stale, 'growth fixtures for families that no longer own a collection').toEqual([]);
	});
});
