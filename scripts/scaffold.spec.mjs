import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	parseSlots,
	planFamily,
	planDocs,
	presetKeysFor,
	withPresetKeys,
	pascal
} from './scaffold.mjs';

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

	// Pin exact call shape and arity: `bun run check` does not see dry-run scaffold output.
	// Whoever changes `definePart`/`useRoot` must scaffold once and typecheck it.
	it('binds each descendant with definePart, naming its slot exactly once', () => {
		const header = files['date-picker-header.svelte'];
		expect(header).toContain("definePart(DatePickerBond, 'header', () => props, {");
		// The slot string must not be restated — a second copy silently degrades when one is renamed.
		expect(header.match(/'header'/g)).toHaveLength(1);
		expect(header).not.toContain('presetLayer=');
		// definePart owns the destructure; reintroducing one is the boilerplate it removed.
		expect(header).not.toContain('...restProps');
	});

	it('orders the class list base → $preset → consumer', () => {
		// The root composes the list itself; a `definePart` part hands its base classes to the
		// helper, which composes exactly the same three-element list.
		expect(files['date-picker-root.svelte']).toContain("'$preset', klass]");
		expect(files['date-picker-header.svelte']).toContain("class: 'date-picker-header'");
	});

	it('forwards the root factory prop as a getter, not as a call', () => {
		// `useRoot`'s `factory` option is `() => BondFactory | undefined`. Passing
		// `(props) => factory(props)` type-errors and silently defeats the Bond.create fallback.
		expect(files['date-picker-root.svelte']).toContain('factory: () => factory');
		expect(files['date-picker-root.svelte']).toContain('factory = undefined');
	});

	it('renders directly through Kernel rather than compatibility adapters', () => {
		expect(files['date-picker-root.svelte']).toContain('Kernel.element(root, () => ({');
		for (const file of ['date-picker-root.svelte', 'date-picker-header.svelte']) {
			expect(files[file]).toContain('{@render Kernel.render(el)(');
			expect(files[file]).not.toContain('{#snippet body()}');
			expect(files[file]).not.toContain('...part.props');
		}
	});

	it('declares roles in the atom map so relationships can respond to them', () => {
		const bond = files['bond.svelte.ts'];
		// Slots start presentation-free: no `atom`, so `defineBond` synthesizes one from the slot
		// name and the definition's `name`.
		expect(bond).toContain("header: { role: 'trigger' }");
		expect(bond).toContain("body: { role: 'content' }");
		expect(bond).toContain('root: {}');
		expect(bond).not.toContain('defineAtom');
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

	// Two conventions the generator had drifted off, both invisible to a text-contains assertion
	// that only looks for the happy string, so each is asserted as an absence of the old form.
	it('constrains element generics on the exported alias, not on the raw tag map', () => {
		for (const file of Object.values(files)) {
			expect(file).not.toContain('keyof HTMLElementTagNameMap');
		}
		expect(files['types.ts']).toContain("E extends HtmlElementTagName = 'div'");
		expect(files['types.ts']).toContain('HtmlElementTagName');
	});

	it('emits no eslint-disable for empty interfaces — the rule allows them outright', () => {
		for (const file of Object.values(files)) {
			expect(file).not.toContain('no-empty-object-type');
		}
	});

	it('re-exports useRoot’s own Bond accessor rather than rebuilding it', () => {
		const root = files['date-picker-root.svelte'];
		expect(root).toContain('export const getBond = root.getBond;');
		expect(root).not.toContain('() => bond;');
	});

	it('imports library internals through the $ alias, never the published package specifier', () => {
		for (const file of Object.values(files)) {
			expect(file).not.toContain("from '@ixirjs/ui");
		}
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

	it('resolves the preset and renders directly through Kernel', () => {
		expect(files['badge-lite.svelte']).toContain('$derived(mergePresetProps(');
		expect(files['badge-lite.svelte']).toContain('Kernel.element(Kernel.static');
		expect(files['badge-lite.svelte']).toContain('{@render Kernel.render(el)(');
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

describe('scaffold — docs page', () => {
	const docs = planDocs('date-picker', 'root,header:trigger,body:content', {
		category: 'Form'
	});

	it('emits the four files a docs page is made of, and not props.ts', () => {
		expect(Object.keys(docs).sort()).toEqual([
			'+page.svelte',
			'content.svelte',
			'examples/basic.svelte',
			'shared.ts'
		]);
		// sync-props.mjs owns props.ts. A scaffolded copy would be a second source, stale on write.
		expect(Object.keys(docs)).not.toContain('props.ts');
	});

	it('names the prop tables sync-props will actually export', () => {
		// `DatePickerHeaderProps` -> `datePickerHeaderProps`, the script's `exportNameFor`.
		expect(docs['content.svelte']).toContain(
			"import { datePickerRootProps, datePickerHeaderProps, datePickerBodyProps } from './props';"
		);
	});

	it('keys the page to its slug so the registry can find its siblings', () => {
		// `siblingsOf(frontmatter.id)` is what replaced 41 hand-wired prev/next pairs.
		expect(docs['content.svelte']).toMatch(/id: 'date-picker'/);
	});

	it('declares the metadata the registry derives nav, catalog and breadcrumbs from', () => {
		for (const field of ['componentTitle', 'summary', 'category', 'status']) {
			expect(docs['shared.ts']).toContain(`${field}:`);
		}
		expect(docs['shared.ts']).toContain("category: 'Form' as const");
		// Widened to `string`, `category` no longer satisfies ComponentCategory — svelte-check
		// caught exactly this across all 41 pages during the migration.
		expect(docs['shared.ts']).toMatch(/category: '[A-Z][a-z]+' as const/);
	});

	it('does not hand-wire prev, next or breadcrumbs — the registry derives all three', () => {
		expect(docs['content.svelte']).not.toContain('prev=');
		expect(docs['content.svelte']).not.toContain('next=');
		expect(docs['shared.ts']).not.toContain('breadcrumbs');
	});

	it('resolves preset keys the same way the family does', () => {
		expect(docs['content.svelte']).toContain("presetKey: 'date-picker'");
		expect(docs['content.svelte']).toContain("presetKey: 'date-picker.header'");
	});

	it('gives a static module one table and no compound markup', () => {
		const staticDocs = planDocs('kbd', 'root', { static: true });
		expect(staticDocs['content.svelte']).toContain("import { kbdProps } from './props';");
		expect(staticDocs['examples/basic.svelte']).not.toContain('.Root>');
	});
});
