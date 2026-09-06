import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { format, resolveConfig } from 'prettier';
import * as root from '$ixirjs/ui/index';
import * as preset from '$ixirjs/ui/preset';
import * as experimental from './experimental';
import * as shared from './shared';
import * as utils from './utils';

// The 267 published symbol names used to be written out twice — as four literal arrays here, and
// again in `docs/public-surface.snapshot.json` — with this file asserting that the two hand-kept
// copies agreed. Every surface change was therefore two edits, and agreement between two copies of
// the same hand-typed list is not evidence of anything.
//
// The snapshot is now generated from the live modules and reviewed as a diff, which is the call
// `scripts/sync-props.mjs` already made for the prop tables. Regenerate with:
//
//     bun run test:unit -- --run public-surface -u
//
// What still carries weight is everything below the snapshot test: the negative assertions naming
// symbols that must *not* be published. Those encode intent no generator can derive, so they stay
// spelled out.

const SNAPSHOT = '../../../docs/public-surface.snapshot.json';

const componentFacades = import.meta.glob('./components/**/*.ts', { eager: true }) as Record<
	string,
	Record<string, unknown>
>;

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
	exports: Record<string, unknown>;
};

const sorted = (names: string[]) => [...names].sort();

const surface = {
	packageExports: sorted(Object.keys(pkg.exports)),
	componentFacades: sorted(
		Object.keys(componentFacades).map((name) => name.slice('./components/'.length))
	),
	rootExports: sorted(Object.keys(root)),
	sharedExports: sorted(Object.keys(shared)),
	experimentalExports: sorted(Object.keys(experimental)),
	presetExports: sorted(Object.keys(preset)),
	utilsExports: sorted(Object.keys(utils))
};

describe('published source surfaces', () => {
	it('does not expose removed popup constructors or factory adapters', () => {
		for (const name of [
			'PopoverBond',
			'DropdownMenuBond',
			'SelectBond',
			'ComboboxBond',
			'TooltipBond',
			'ContextMenuBond',
			'DatePickerBond',
			'PopoverDialogBond',
			'mountFactory'
		])
			expect(experimental).not.toHaveProperty(name);
	});

	// Formatted through prettier with the repo's own config: the snapshot is a checked-in `.json`,
	// so `prettier --check` in `bun run lint` has an opinion about it (short arrays collapse onto
	// one line). Without this the formatter and the snapshot writer would each insist on their own.
	it('matches the checked-in public surface snapshot', async () => {
		const config = await resolveConfig('docs/public-surface.snapshot.json');
		const serialized = await format(JSON.stringify(surface), { ...config, parser: 'json' });
		await expect(serialized).toMatchFileSnapshot(SNAPSHOT);
	});

	it('keeps the root application surface curated', () => {
		expect(root).not.toHaveProperty('PopoverBond');
		expect(root).not.toHaveProperty('PopoverOverlayAtom');
		expect(root).not.toHaveProperty('Bond');
	});

	it('keeps stable authoring factory-based and curated', () => {
		expect(shared).not.toHaveProperty('CapabilityRegistry');
		expect(shared).not.toHaveProperty('decorateCapability');
		expect(shared).not.toHaveProperty('useCapabilities');
	});

	it('isolates concrete runtime and protocol exports in experimental', () => {
		for (const name of surface.experimentalExports) {
			expect(shared).not.toHaveProperty(name);
		}
	});

	it('keeps component facades application-facing', () => {
		for (const facade of Object.values(componentFacades)) {
			expect(Object.keys(facade).filter((name) => name.endsWith('Bond'))).toEqual([]);
		}
		expect(componentFacades['./components/select.ts']).toHaveProperty('Select');
		expect(componentFacades['./components/select.ts']).toHaveProperty('filterSelectData');
		expect(componentFacades['./components/form/field.ts']).toHaveProperty('Field');
	});

	it('keeps preset and utility operations narrow', () => {
		expect(Object.keys(utils).sort()).toEqual(['cn', 'defineVariants', 'isBrowser']);
	});
});

describe('package export manifest', () => {
	it('reserves wildcard publication for curated component facades', () => {
		for (const [subpath, target] of Object.entries(pkg.exports)) {
			expect(target).not.toBeNull();
			if (subpath === './components/*') {
				expect(JSON.stringify(target)).toContain('*');
			} else {
				expect(subpath).not.toContain('*');
				expect(JSON.stringify(target)).not.toContain('*');
			}
		}
	});

	it.each([
		'./types',
		'./menu',
		'./dropdown',
		'./virtual',
		'./internal',
		'./button',
		'./form/field'
	])('does not publish %s', (subpath) => expect(pkg.exports).not.toHaveProperty(subpath));
});
