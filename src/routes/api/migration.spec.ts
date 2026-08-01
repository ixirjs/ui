import { describe, expect, it } from 'vitest';
import {
	archivedVersions,
	compareVersions,
	diffSurfaces,
	latestVersion,
	nearestArchived,
	notesFor,
	planMigration,
	renderPlan
} from './migration';

const surface = (version: string, over: Record<string, string[]> = {}) => ({
	version,
	packageExports: [],
	componentFacades: [],
	rootExports: [],
	sharedExports: [],
	experimentalExports: [],
	presetExports: [],
	utilsExports: [],
	...over
});

describe('compareVersions', () => {
	it('orders core versions numerically, not lexically', () => {
		expect(compareVersions('1.0.0-alpha.9', '1.0.0-alpha.10')).toBe(-1);
		expect(compareVersions('1.2.0', '1.10.0')).toBe(-1);
		expect(compareVersions('2.0.0', '10.0.0')).toBe(-1);
	});

	it('ranks a release above any prerelease of the same core version', () => {
		expect(compareVersions('1.0.0-alpha.48', '1.0.0')).toBe(-1);
		expect(compareVersions('1.0.0', '1.0.0-alpha.48')).toBe(1);
	});

	it('treats equal versions as equal, with or without a v prefix', () => {
		expect(compareVersions('1.0.0-alpha.48', 'v1.0.0-alpha.48')).toBe(0);
	});

	it('sorts a realistic tag list correctly', () => {
		const sorted = ['1.0.0', '1.0.0-alpha.10', '1.0.0-alpha.2', '1.0.0-alpha.48'].sort(
			compareVersions
		);
		expect(sorted).toEqual(['1.0.0-alpha.2', '1.0.0-alpha.10', '1.0.0-alpha.48', '1.0.0']);
	});
});

describe('diffSurfaces', () => {
	it('reports removals and additions per entrypoint', () => {
		const changes = diffSurfaces(
			surface('1.0.0-alpha.1', { rootExports: ['Button', 'Dropdown'] }),
			surface('1.0.0-alpha.2', { rootExports: ['Button', 'Select'] })
		);

		expect(changes).toHaveLength(1);
		expect(changes[0]!.entrypoint).toBe('@ixirjs/ui');
		expect(changes[0]!.removed).toEqual(['Dropdown']);
		expect(changes[0]!.added).toEqual(['Select']);
	});

	it('hints a rename when the removed and added names share a stem', () => {
		const [change] = diffSurfaces(
			surface('1.0.0-alpha.1', { sharedExports: ['bindBond'] }),
			surface('1.0.0-alpha.2', { sharedExports: ['bindBondProps'] })
		);

		expect(change!.renameHints).toEqual({ bindBond: ['bindBondProps'] });
	});

	it('offers no hint for an unrelated replacement', () => {
		const [change] = diffSurfaces(
			surface('1.0.0-alpha.1', { rootExports: ['Dropdown'] }),
			surface('1.0.0-alpha.2', { rootExports: ['Select'] })
		);

		expect(change!.renameHints).toEqual({});
	});

	it('says nothing when the surface is unchanged', () => {
		expect(
			diffSurfaces(
				surface('1.0.0-alpha.1', { rootExports: ['Button'] }),
				surface('1.0.0-alpha.2', { rootExports: ['Button'] })
			)
		).toEqual([]);
	});
});

describe('notesFor', () => {
	it('includes undated notes for anyone older than the earliest archived surface', () => {
		const notes = notesFor('1.0.0-alpha.20', latestVersion);
		expect(notes.map((note) => note.id)).toContain('bondstate-to-bond');
	});

	it('excludes them once the consumer is already past that boundary', () => {
		expect(notesFor(latestVersion, latestVersion)).toEqual([]);
	});
});

describe('planMigration', () => {
	it('diffs from the nearest archived version at or below the given one', () => {
		expect(nearestArchived('0.0.1')).toBeNull();
		expect(nearestArchived(latestVersion)).toBe(latestVersion);
		expect(nearestArchived('99.0.0')).toBe(archivedVersions[archivedVersions.length - 1]);
	});

	it('still returns hand-written steps when no surface is archived that far back', () => {
		const plan = planMigration('1.0.0-alpha.20');
		expect(plan.diffedFrom).toBeNull();
		expect(plan.notes.length).toBeGreaterThan(0);

		const rendered = renderPlan(plan);
		expect(rendered).toContain('Migrating @ixirjs/ui 1.0.0-alpha.20');
		expect(rendered).toContain('## Steps');
		expect(rendered).toContain('Find:');
	});
});
