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
		// The seed reaches the Bond through the live-props getters, never as a rendered id prop.
		expect(root).toContain('get id() {');
		expect(root).toContain('return ID;');
	});

	it('shares one plain state class under the family context', () => {
		const root = files['date-picker-root.svelte'];
		expect(root).toContain('DatePickerContext.share(');
		expect(root).toContain('DatePickerBond.create(bondProps)');
		// The seams the old runtime authored with are gone; a scaffold that names one does not compile.
		expect(root).not.toContain('useRoot(');
		expect(root).not.toContain('bindBond');
	});

	// Pin exact call shape: `bun run check` does not see dry-run scaffold output. Whoever changes
	// `Kernel.element`'s config must scaffold once and typecheck it.
	it('builds each descendant through Kernel.element against the family context', () => {
		const header = files['date-picker-header.svelte'];
		expect(header).toContain('DatePickerContext.getOrThrow(');
		expect(header).toContain('Kernel.element(() => props, {');
		expect(header).toContain("preset: 'date-picker.header'");
		expect(header).not.toContain('presetLayer=');
		// A scaffolded part IS its element: no dispatch, no destructure to reassemble.
		expect(header).toContain('<div {...el.attrs}>');
		expect(header).not.toContain('...restProps');
	});

	it('names base classes once and lets the seam compose the list', () => {
		// The seam composes `[spec.class, '$preset', consumer class]`; a scaffolded file names its
		// own class once and never rebuilds that list. The consumer's class rides `restProps`/`props`
		// into the thunk, so it must not be destructured out.
		expect(files['date-picker-root.svelte']).toContain("class: 'date-picker'");
		expect(files['date-picker-root.svelte']).not.toContain('class: klass = ');
		expect(files['date-picker-header.svelte']).toContain("class: 'date-picker-header'");
	});

	it('reads the root factory once, at init, and falls back to create', () => {
		// `factory` is read through `untrack` by design: the Bond takes its parent from context
		// BEFORE this root shares its own, so a reactive read here would re-run that.
		const root = files['date-picker-root.svelte'];
		expect(root).toContain('const build = untrack(() => factory);');
		expect(root).toContain('build ? build(bondProps) : DatePickerBond.create(bondProps)');
		expect(root).toContain('factory = undefined');
	});

	it('renders a literal element, never an inline dispatch', () => {
		// A scaffolded part has no reason to dispatch (no transition, no `base`, no polymorphic tag),
		// and the literal tag is a block, a branch and a hydration anchor cheaper. A part that grows
		// one binds its leaf ONCE — `const leaf = Kernel.render(el)` — never the inline call form.
		for (const file of ['date-picker-root.svelte', 'date-picker-header.svelte']) {
			expect(files[file]).toContain('Kernel.element(');
			expect(files[file]).toContain('{...el.attrs}');
			expect(files[file]).not.toContain('{@render Kernel.render(');
			expect(files[file]).not.toContain('...part.props');
		}
	});

	it('derives one element id per slot from the family seed', () => {
		const bond = files['bond.svelte.ts'];
		// Cross-part ARIA resolves from the seed, on the server too — there is no registry to ask.
		expect(bond).toContain("return Kernel.id(this.id, 'date-picker-root');");
		expect(bond).toContain("return Kernel.id(this.id, 'date-picker-header');");
		expect(bond).toContain("return Kernel.id(this.id, 'date-picker-body');");
		expect(bond).not.toContain('defineAtom');
		expect(bond).not.toContain('defineBond');
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
			expect(types).toContain(`export type DatePicker${slot}Props = PlainPartProps<`);
		}
	});

	it('never emits a per-root effect for cross-cutting behaviour', () => {
		expect(files['date-picker-root.svelte']).not.toContain('$effect');
	});

	// Two conventions the generator had drifted off, both invisible to a text-contains assertion
	// that only looks for the happy string, so each is asserted as an absence of the old form.
	// A scaffolded part IS its element, so its props carry no element generic at all — `as` and
	// `base` are typed `never` by `PlainPartProps`. A raw `keyof HTMLElementTagNameMap` would still
	// be wrong wherever a generic does appear.
	it('emits no element generic, and never the raw tag map', () => {
		for (const file of Object.values(files)) {
			expect(file).not.toContain('keyof HTMLElementTagNameMap');
		}
		expect(files['types.ts']).not.toContain("E extends HtmlElementTagName = 'div'");
		expect(files['types.ts']).toContain("PlainPartProps<'div', DatePickerChildren>");
	});

	it('emits no eslint-disable for empty interfaces — the rule allows them outright', () => {
		for (const file of Object.values(files)) {
			expect(file).not.toContain('no-empty-object-type');
		}
	});

	it('exports the Bond accessor over the shared instance', () => {
		const root = files['date-picker-root.svelte'];
		expect(root).toContain('export const getBond = () => datePicker;');
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
		expect(files['badge-lite.svelte']).toContain("preset: 'badge-lite'");
	});

	it('resolves the preset and renders a literal element', () => {
		// One seam: `Kernel.element` caches its config thunk, so there is no `$derived` cell holding
		// a merged packet and no dispatch to choose a leaf for a static module.
		expect(files['badge-lite.svelte']).toContain('Kernel.element(() => props, {');
		expect(files['badge-lite.svelte']).not.toContain('mergePresetProps');
		expect(files['badge-lite.svelte']).not.toContain('{@render Kernel.render(');
		expect(files['badge-lite.svelte']).toContain('{...el.attrs}');
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
