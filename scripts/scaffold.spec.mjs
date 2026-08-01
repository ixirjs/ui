import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSlots, planFamily, presetKeysFor, withPresetKeys, pascal } from './scaffold.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The scaffolder's output has to satisfy the same conventions the audits enforce on authored
 * families, or it hands every new component a set of failures to clean up. These assert the
 * mechanical invariants directly on the generated text — cheap, and they fail on the exact rule
 * that broke rather than on a downstream typecheck error.
 */
describe('scaffold — slot parsing', () => {
	it('implies a root slot and preserves declared order', () => {
		expect(parseSlots('header:trigger,body:content').map((s) => s.slot)).toEqual([
			'root',
			'header',
			'body'
		]);
	});

	it('keeps an explicit root where the author put it and carries roles through', () => {
		expect(parseSlots('root,header:trigger')).toEqual([
			{ slot: 'root', role: undefined },
			{ slot: 'header', role: 'trigger' }
		]);
	});

	it('rejects duplicates and non-kebab slots', () => {
		expect(() => parseSlots('root,header,header')).toThrow(/duplicate/);
		expect(() => parseSlots('Header')).toThrow(/kebab-case/);
	});
});

describe('scaffold — bonded family', () => {
	const files = planFamily('date-picker', 'root,header:trigger,body:content');

	it('emits one component per slot plus the four module files', () => {
		expect(Object.keys(files).sort()).toEqual(
			[
				'atoms.ts',
				'bond.svelte.ts',
				'date-picker-body.svelte',
				'date-picker-header.svelte',
				'date-picker-root.svelte',
				'index.ts',
				'types.ts'
			].sort()
		);
	});

	it('seeds the root Bond from $props.id(), which root-identity-audit requires', () => {
		const root = files['date-picker-root.svelte'];
		expect(root).toContain('const ID = $props.id();');
		expect(root).toContain('id: () => ID');
	});

	it('binds the root through useRoot and never through bindBond', () => {
		expect(files['date-picker-root.svelte']).toContain('useRoot(');
		expect(files['date-picker-root.svelte']).not.toContain('bindBond');
	});

	it('binds each descendant with usePart, naming its slot exactly once', () => {
		const header = files['date-picker-header.svelte'];
		expect(header).toContain("usePart(DatePickerBond, 'header', () => restProps");
		// The slot string must not be restated — a second copy silently degrades when one is renamed.
		expect(header.match(/'header'/g)).toHaveLength(1);
		expect(header).not.toContain('presetLayer=');
	});

	it('orders the class list base → $preset → consumer', () => {
		for (const file of ['date-picker-root.svelte', 'date-picker-header.svelte']) {
			expect(files[file]).toContain("'$preset', klass]");
		}
	});

	it('passes the part across the seam rather than spreading a merged packet', () => {
		expect(files['date-picker-header.svelte']).toContain('{part}');
		expect(files['date-picker-root.svelte']).toContain('part={root}');
	});

	it('declares roles in the atom map so relationships can respond to them', () => {
		const bond = files['bond.svelte.ts'];
		expect(bond).toContain("header: { atom: DatePickerHeaderAtom, role: 'trigger' }");
		expect(bond).toContain("body: { atom: DatePickerBodyAtom, role: 'content' }");
		expect(bond).toContain('root: DatePickerRootAtom');
	});

	it('derives every identifier from the kebab name', () => {
		expect(pascal('date-picker')).toBe('DatePicker');
		expect(files['index.ts']).toContain("export * as DatePicker from './atoms';");
		expect(files['atoms.ts']).toContain(
			"export { default as Header } from './date-picker-header.svelte';"
		);
	});

	it('gives every slot an extension interface and a props alias', () => {
		const types = files['types.ts'];
		for (const slot of ['Root', 'Header', 'Body']) {
			expect(types).toContain(`export interface DatePicker${slot}ExtendProps {}`);
			expect(types).toContain(`export type DatePicker${slot}Props<`);
		}
	});

	it('never emits a per-root effect for cross-cutting behaviour', () => {
		expect(files['date-picker-root.svelte']).not.toContain('$effect');
	});
});

describe('scaffold — static module', () => {
	const files = planFamily('badge-lite', 'root', { static: true });

	it('emits the smaller Button-shaped layout with no Bond', () => {
		expect(Object.keys(files).sort()).toEqual(['badge-lite.svelte', 'index.ts', 'types.ts']);
		expect(files['badge-lite.svelte']).not.toContain('Bond');
		expect(files['badge-lite.svelte']).toContain(
			"mergePresetProps(preset, 'badge-lite', restProps)"
		);
	});

	it('resolves the preset in the script, not inline in markup', () => {
		expect(files['badge-lite.svelte']).toContain('$derived(mergePresetProps(');
		expect(files['badge-lite.svelte']).not.toMatch(/<HtmlAtom[^>]*preset \?\?/);
	});
});

describe('scaffold — preset manifest registration', () => {
	it('derives the keys an Atom will actually look up', () => {
		expect(presetKeysFor('date-picker', 'root,header:trigger,body')).toEqual([
			'date-picker',
			'date-picker.header',
			'date-picker.body'
		]);
		expect(presetKeysFor('badge-lite', 'root', { static: true })).toEqual(['badge-lite']);
	});

	it('inserts keys sorted and unique, matching what manifest.spec asserts', () => {
		const source = readFileSync(join(ROOT, 'src/lib/preset/manifest.ts'), 'utf8');
		const { source: next, added } = withPresetKeys(source, ['zz-widget', 'zz-widget.header']);
		expect(added).toEqual(['zz-widget', 'zz-widget.header']);

		const keys = [...next.matchAll(/'([^']+)'/g)].map((m) => m[1]);
		expect(keys).toEqual([...new Set(keys)].sort());
	});

	it('is a no-op when every key is already registered', () => {
		const source = readFileSync(join(ROOT, 'src/lib/preset/manifest.ts'), 'utf8');
		const { source: next, added } = withPresetKeys(source, ['button', 'card.title']);
		expect(added).toEqual([]);
		expect(next).toBe(source);
	});
});
