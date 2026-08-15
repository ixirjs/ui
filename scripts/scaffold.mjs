#!/usr/bin/env node
/**
 * Scaffold a component family.
 *
 * Authoring a bonded family means writing the same eight-ish files every time: a barrel, an atom
 * namespace, four prop-type aliases and four extension interfaces, and one part component per
 * slot. The mechanical share of that was measured at roughly 70%; the remaining 30% — ARIA and
 * keyboard logic, Bond methods, capability choice, motion, markup — is the part worth a human.
 *
 * This emits the 70% in the canonical shape, so "copy the nearest sibling and edit" stops being
 * the only template. It deliberately does NOT introduce a shared runtime `<Part>` wrapper: a
 * component boundary between the family part and Kernel costs ~1 µs per part (about +9% on Card).
 * `definePart` is the answer instead — a function call inside the part's own init, no second
 * component boundary — which is why a generated part is now ~14 lines rather than ~30.
 *
 * Usage:
 *   node scripts/scaffold.mjs <name> --slots root,header:trigger,body:content,indicator
 *   node scripts/scaffold.mjs <name> --slots root,item --static
 *   node scripts/scaffold.mjs <name> --slots root,header --out /tmp/preview --dry
 *
 * A slot is `name` or `name:role`. `role` is the relationship role a capability responds to
 * (`trigger`, `content`, `item`, …) and is passed straight through to `defineBond`'s atom map.
 * `root` is implied and always emitted first.
 *
 * A docs page under `src/routes/docs/components/<name>/` is emitted too — `--no-docs` skips it,
 * `--category` picks its catalog group (default `Display`). The sidebar entry, catalog card,
 * breadcrumbs and prev/next links all derive from that page's `shared.ts` via `$docs/registry`,
 * so the directory is the whole registration.
 */
import { writeFileSync, readFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const COMPONENTS_DIR = join(ROOT, 'src/lib/components');

// ─── naming ────────────────────────────────────────────────────────────────────

/** kebab-case is the file and directory convention; every other casing derives from it. */
export function pascal(value) {
	let out = '';
	for (const segment of String(value).split('-')) {
		if (segment) out += segment[0].toUpperCase() + segment.slice(1);
	}
	return out;
}

export function camel(value) {
	const p = pascal(value);
	return p ? p[0].toLowerCase() + p.slice(1) : p;
}

/** `date-picker` → `DatePickerBond`, `datePicker`, `DatePicker`. */
export function names(name) {
	return { kebab: name, Pascal: pascal(name), camel: camel(name) };
}

// ─── slot parsing ──────────────────────────────────────────────────────────────

export function parseSlots(input) {
	const slots = [];
	const seen = new Set();
	for (const raw of String(input ?? '').split(',')) {
		const entry = raw.trim();
		if (!entry) continue;
		const [slot, role] = entry.split(':').map((part) => part.trim());
		if (!/^[a-z][a-z0-9-]*$/.test(slot)) {
			throw new Error(`invalid slot "${slot}": use kebab-case starting with a letter`);
		}
		if (seen.has(slot)) throw new Error(`duplicate slot "${slot}"`);
		seen.add(slot);
		slots.push({ slot, role: role || undefined });
	}
	// `root` is not optional: it owns the Bond, the identity seed and the context publication.
	if (!seen.has('root')) slots.unshift({ slot: 'root', role: undefined });
	return slots;
}

// ─── templates ─────────────────────────────────────────────────────────────────

const TODO = 'TODO';

function atomsFile(n, slots) {
	return (
		slots
			.map((s) => `export { default as ${pascal(s.slot)} } from './${n.kebab}-${s.slot}.svelte';`)
			.join('\n') + '\n'
	);
}

function indexFile(n) {
	return `export * as ${n.Pascal} from './atoms';

// Bond/state — part of the extension contract (extend/fuse).
export * from './bond.svelte';

export * from './types';
`;
}

function typesFile(n, slots) {
	const extend = slots
		.map((s) => `export interface ${n.Pascal}${pascal(s.slot)}ExtendProps {}`)
		.join('\n\n');

	// Emitted already Prettier-clean: a root's extra members push the intersection onto its own
	// line, a bare part's does not. Generating output that `bun run lint` immediately rewrites
	// makes every scaffold start with a spurious diff.
	const propsFor = (s) => {
		const head = `export type ${n.Pascal}${pascal(s.slot)}Props<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = RenderProps<E, B, ${n.Pascal}Children> &`;
		if (s.slot !== 'root') {
			return `${head} ${n.Pascal}${pascal(s.slot)}ExtendProps;`;
		}
		return `${head}
	${n.Pascal}RootExtendProps & {
		disabled?: boolean;
		factory?: Factory<${n.Pascal}Bond>;
	};`;
	};

	return `import type { Snippet } from 'svelte';
import type {
	RenderProps,
	Base,
	HtmlElementTagName,
	SnippetProps
} from '$ixirjs/ui/components/atom';
import type { Factory } from '$ixirjs/ui/types';
import type { ${n.Pascal}Bond } from './bond.svelte';

// Extension points: merge custom props into ${n.kebab} parts by augmenting these interfaces.
${extend}

// Snippet props
export interface ${n.Pascal}SnippetProps extends SnippetProps {
	${n.camel}: ${n.Pascal}Bond;
}

export type ${n.Pascal}Children = Snippet<[${n.Pascal}SnippetProps]>;

${slots.map(propsFor).join('\n\n')}
`;
}

function bondFile(n, slots) {
	// Every scaffolded slot starts presentation-free, so none declares an `atom`: `defineBond`
	// synthesizes `defineAtom({ key: slot, namespace: name })` for it. Declare one — a `defineAtom`
	// with an `attrs`/`handlers` spec, or an `Atom` subclass — at the point a slot grows behavior.
	const atomMap = slots
		.map((s) => (s.role ? `\t\t${s.slot}: { role: '${s.role}' }` : `\t\t${s.slot}: {}`))
		.join(',\n');

	const domElements = slots.map((s) => `\t${s.slot}: HTMLElement;`).join('\n');

	return `import { Bond } from '$ixirjs/ui/shared/bond';
import { defineBond } from '$ixirjs/ui/shared';
import type { BondStateProps } from '$ixirjs/ui/shared/bond';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type ${n.Pascal}StateProps = BondStateProps & {
	disabled?: boolean;
};

export type ${n.Pascal}DomElements = {
${domElements}
};

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class ${n.Pascal}BondBase extends Bond<${n.Pascal}StateProps> {
	constructor(props: ${n.Pascal}StateProps, name = '${n.kebab}') {
		super(props, name);
		// ${TODO}: compose cross-cutting behaviour here with this.capability(...) — disclosure,
		// selection, relationship links. Never with a per-root $effect in the root component.
	}

	// Read through predicates: is*/has*/can* for booleans, plain nouns otherwise.
	get isDisabled(): boolean {
		return this.props.disabled ?? false;
	}

	// ${TODO}: mutate through methods (open(), toggle(), select()); parts call these and never
	// write props directly.
}

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const ${n.camel}Spec = {
	name: '${n.kebab}',
	base: ${n.Pascal}BondBase,
	atoms: {
${atomMap}
	}
};

export const ${n.Pascal}Bond = defineBond(${n.camel}Spec);

export type ${n.Pascal}Bond = ${n.Pascal}BondBase;
`;
}

function rootFile(n) {
	return `<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { useRoot } from '$ixirjs/ui/shared';
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { ${n.Pascal}Bond } from './bond.svelte';
	import type { ${n.Pascal}RootProps } from './types';

	const ID = $props.id();

	let {
		class: klass = '',
		preset = undefined,
		disabled = false,
		factory = undefined,
		children = undefined,
		...restProps
	}: ${n.Pascal}RootProps<E, B> = $props();

	const root = useRoot(
		${n.Pascal}Bond,
		{
			disabled: () => disabled
		},
		{
			preset: () => preset,
			id: () => ID,
			// A getter, like preset and id: useRoot falls back to ${n.Pascal}Bond.create when the
			// consumer passes none, so there is no local default to declare.
			factory: () => factory
		}
	);
	const bond = root.bond;

	// The accessor useRoot already returns — assign it rather than rebuilding an arrow over bond.
	export const getBond = root.getBond;

	const el = Kernel.element(root, () => ({
		class: ['${n.kebab}', '$preset', klass],
		...root.props,
		...restProps
	}));
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children,
	{ ${n.camel}: bond },
	el.motion(),
	el
)}
`;
}

function partFile(n, slot) {
	return `<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { ${n.Pascal}Bond } from './bond.svelte';
	import type { ${n.Pascal}${pascal(slot)}Props } from './types';

	const props: ${n.Pascal}${pascal(slot)}Props<E, B> = $props();

	const el = definePart(${n.Pascal}Bond, '${slot}', () => props, {
		class: '${n.kebab}-${slot}'
	});
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	props.children,
	{ ${n.camel}: el.bond },
	el.motion(),
	el
)}
`;
}

/** A static module: component + types + index, no Bond, no Atom (the Button shape). */
function staticFile(n) {
	return `<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { mergePresetProps, type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import type { ${n.Pascal}Props } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: ${n.Pascal}Props<E, B> = $props();

	const ${n.camel}Props = $derived(mergePresetProps(preset, '${n.kebab}', restProps));
	const el = Kernel.element(Kernel.static, () => ({
		class: ['${n.kebab}', '$preset', klass],
		...${n.camel}Props
	}));
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children,
	undefined,
	el.motion(),
	el
)}
`;
}

function staticTypesFile(n) {
	return `import type { Snippet } from 'svelte';
import type { RenderProps, Base } from '$ixirjs/ui/components/atom';

// Extension point: merge custom props by augmenting this interface.
export interface ${n.Pascal}ExtendProps {}

export type ${n.Pascal}Props<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = RenderProps<E, B, Snippet> & ${n.Pascal}ExtendProps;
`;
}

function staticIndexFile(n) {
	return `export { default as ${n.Pascal} } from './${n.kebab}.svelte';
export * from './types';
`;
}

// ─── planning ──────────────────────────────────────────────────────────────────

/** Pure: returns the file map so the emitted shape is testable without touching disk. */
export function planFamily(name, slotInput, { static: isStatic = false } = {}) {
	const n = names(name);
	if (!/^[a-z][a-z0-9-]*$/.test(n.kebab)) {
		throw new Error(`invalid component name "${name}": use kebab-case starting with a letter`);
	}

	if (isStatic) {
		return {
			[`${n.kebab}.svelte`]: staticFile(n),
			'types.ts': staticTypesFile(n),
			'index.ts': staticIndexFile(n)
		};
	}

	const slots = parseSlots(slotInput);
	const files = {
		'bond.svelte.ts': bondFile(n, slots),
		'types.ts': typesFile(n, slots),
		'atoms.ts': atomsFile(n, slots),
		'index.ts': indexFile(n)
	};
	for (const { slot } of slots) {
		files[`${n.kebab}-${slot}.svelte`] = slot === 'root' ? rootFile(n) : partFile(n, slot);
	}
	return files;
}

// ─── docs page ─────────────────────────────────────────────────────────────────

const DOCS_DIR = join(ROOT, 'src/routes/docs/components');

/**
 * The four files a docs page is made of, in the shape the other 41 already have.
 *
 * `props.ts` is deliberately absent: `scripts/sync-props.mjs` generates it from the family's own
 * `types.ts`, and a scaffolded copy would be a second, immediately-stale source. That is also why
 * `sync:props` is the first of the printed next steps — `content.svelte` imports the tables this
 * plan does not write, so the page does not type-check until the generator has run once.
 *
 * Everything else the page needs is derived: the sidebar entry, the catalog card, the breadcrumb
 * trail and the prev/next links all come from `shared.ts` via `$docs/registry`, so creating this
 * directory is the whole of "add a component to the docs".
 */
export function planDocs(name, slotInput, { static: isStatic = false, category = 'Display' } = {}) {
	const n = names(name);
	const slots = isStatic ? [{ slot: 'root' }] : parseSlots(slotInput);

	// `sync-props.mjs` exports one table per `*Props` type, named by lowercasing the type's first
	// letter. For a bonded family that is `<Family><Slot>Props`; a static one declares `<Family>Props`.
	const tableFor = (slot) => (isStatic ? `${n.camel}Props` : `${n.camel}${pascal(slot)}Props`);
	const labelFor = (slot) =>
		isStatic ? n.Pascal : slot === 'root' ? `${n.Pascal}.Root` : `${n.Pascal}.${pascal(slot)}`;
	const presetFor = (slot) => (slot === 'root' ? n.kebab : `${n.kebab}.${slot}`);

	const tables = slots.map(({ slot }) => tableFor(slot));
	const sections = slots
		.map(
			({ slot }) =>
				`\t\t{ label: '${labelFor(slot)}', presetKey: '${presetFor(slot)}', props: ${tableFor(slot)} }`
		)
		.join(',\n');

	const usage = isStatic
		? `<${n.Pascal}>${TODO}</${n.Pascal}>`
		: slots
				.filter(({ slot }) => slot !== 'root')
				.map(({ slot }) => `\t<${n.Pascal}.${pascal(slot)}>${TODO}</${n.Pascal}.${pascal(slot)}>`)
				.join('\n') || `\t${TODO}`;

	const example = isStatic
		? `<script lang="ts">
	import { ${n.Pascal} } from '$lib/components/${n.kebab}';
</script>

${usage}
`
		: `<script lang="ts">
	import { ${n.Pascal} } from '$lib/components/${n.kebab}';
</script>

<${n.Pascal}.Root>
${usage}
</${n.Pascal}.Root>
`;

	return {
		'+page.svelte': `<script lang="ts">
	import { metadata } from './shared';
	import Content from './content.svelte';
</script>

<svelte:head>
	<title>{metadata.title}</title>
	<meta name="description" content={metadata.description} />
</svelte:head>

<Content contentType="html" />
`,

		'shared.ts': `const presetCode = \`import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
	'${presetFor('root')}': () => ({ class: '${TODO}' })
});\`;

export const metadata = {
	title: '${n.Pascal} - Svelte Atoms',
	description: '${TODO} — one sentence, used as the page <meta description>.',
	componentTitle: '${n.Pascal}',
	componentDescription: '${TODO} — the page subtitle, a sentence or two.',
	summary: '${TODO} — the terse catalog-card blurb, no trailing period',
	category: '${category}' as const,
	componentType: '${isStatic ? 'simple' : 'compound'}' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { ${n.Pascal} } from '@ixirjs/ui';",
	examples: {
		preset: presetCode
	},
	accessibility: ['${TODO} — one line per guarantee: roles, keyboard, focus, screen-reader']
};
`,

		'content.svelte': `<script lang="ts">
	import { createExampleLoader } from '$docs/utils/example-loader';
	import { DocComponentPage, DocExample, DocCode, DocPropsTabs } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { ${tables.join(', ')} } from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: '${n.kebab}',
		title: '${n.Pascal}',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	const apiSections: PropsSection[] = [
${sections}
	];

	const _loaders = import.meta.glob('./examples/*.svelte');
	const _sources = import.meta.glob('./examples/*.svelte', {
		query: '?raw',
		import: 'default',
		eager: true
	}) as Record<string, string>;
	const ex = createExampleLoader(_loaders, _sources);
</script>

<DocComponentPage {contentType} {metadata} {frontmatter}>
	{#snippet preset()}
		<DocCode code={metadata.examples.preset} lang="typescript" />
	{/snippet}

	{#snippet examples()}
		<DocExample
			title="Basic ${n.Pascal}"
			description="${TODO} — what this example shows."
			{...ex('./examples/basic.svelte')}
		/>
	{/snippet}

	{#snippet apiReference()}
		<DocPropsTabs sections={apiSections} />
	{/snippet}
</DocComponentPage>
`,

		'examples/basic.svelte': example
	};
}

// ─── preset manifest ───────────────────────────────────────────────────────────

const MANIFEST_PATH = join(ROOT, 'src/lib/preset/manifest.ts');

/**
 * The preset keys a generated family declares.
 *
 * `Atom.preset` resolves to the Bond's namespace for the root slot and `<namespace>.<slot>` for
 * every other, so those are exactly the keys the family will look up at runtime.
 */
export function presetKeysFor(name, slotInput, { static: isStatic = false } = {}) {
	const n = names(name);
	if (isStatic) return [n.kebab];
	return parseSlots(slotInput).map((s) => (s.slot === 'root' ? n.kebab : `${n.kebab}.${s.slot}`));
}

/**
 * Registering is not optional politeness — it is what makes the generated code compile.
 * `PresetKey` is a closed union over this manifest, so an unregistered key is a type error in a
 * static module, and `manifest.spec.ts` independently fails any production file that declares a
 * fallback the manifest does not contain. Leaving this to a follow-up step means every scaffold
 * starts red.
 */
export function withPresetKeys(source, keys) {
	const match = source.match(/export const BUILT_IN_PRESET_KEYS = \[([\s\S]*?)\n\] as const;/);
	if (!match) throw new Error('could not locate BUILT_IN_PRESET_KEYS in the preset manifest');

	const existing = [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
	const merged = [...new Set([...existing, ...keys])].sort();
	if (merged.length === existing.length) return { source, added: [] };

	const body = merged.map((key) => `\t'${key}'`).join(',\n');
	return {
		source: source.replace(match[0], `export const BUILT_IN_PRESET_KEYS = [\n${body}\n] as const;`),
		added: merged.filter((key) => !existing.includes(key))
	};
}

// ─── cli ───────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
	const options = {
		name: undefined,
		slots: 'root',
		static: false,
		dry: false,
		out: undefined,
		presets: true,
		docs: true,
		// For a family that already exists and only lacks its page — the ten that predate docs
		// emission. Skips the family files and the preset manifest, both already in place.
		docsOnly: false,
		category: 'Display'
	};
	for (let index = 0; index < argv.length; index++) {
		const arg = argv[index];
		if (arg === '--static') options.static = true;
		else if (arg === '--dry') options.dry = true;
		else if (arg === '--no-presets') options.presets = false;
		else if (arg === '--no-docs') options.docs = false;
		else if (arg === '--docs-only') options.docsOnly = true;
		else if (arg === '--slots') options.slots = argv[++index];
		else if (arg === '--category') options.category = argv[++index];
		else if (arg === '--out') options.out = argv[++index];
		else if (!arg.startsWith('-') && !options.name) options.name = arg;
		else throw new Error(`unexpected argument "${arg}"`);
	}
	if (!options.name) throw new Error('a component name is required');
	return options;
}

function main() {
	const options = parseArgs(process.argv.slice(2));
	const files = options.docsOnly
		? {}
		: planFamily(options.name, options.slots, { static: options.static });
	const target = options.out ? join(options.out, options.name) : join(COMPONENTS_DIR, options.name);

	// An out-of-tree preview gets its docs page beside the family rather than in the routes tree,
	// for the same reason `--out` skips the preset manifest: nothing outside the repo's own
	// directories should be written on the strength of a preview flag.
	const docs = options.docs
		? planDocs(options.name, options.slots, {
				static: options.static,
				category: options.category
			})
		: {};
	const docsTarget = options.out
		? join(options.out, options.name, 'docs')
		: join(DOCS_DIR, options.name);

	if (options.dry) {
		for (const [file, content] of Object.entries(files)) {
			console.log(`\n─── ${join(target, file)} ${'─'.repeat(Math.max(0, 60 - file.length))}`);
			console.log(content);
		}
		for (const [file, content] of Object.entries(docs)) {
			console.log(`\n─── ${join(docsTarget, file)} ${'─'.repeat(Math.max(0, 60 - file.length))}`);
			console.log(content);
		}
		return;
	}

	// Never overwrite: scaffolding is for new families, and a half-generated directory over an
	// authored one is far worse than a refusal.
	if (!options.docsOnly && existsSync(target) && readdirSync(target).length > 0) {
		throw new Error(`${target} already exists and is not empty`);
	}
	if (existsSync(docsTarget) && readdirSync(docsTarget).length > 0) {
		throw new Error(`${docsTarget} already exists and is not empty`);
	}
	if (Object.keys(files).length > 0) {
		mkdirSync(target, { recursive: true });
		for (const [file, content] of Object.entries(files)) {
			writeFileSync(join(target, file), content);
		}
	}
	for (const [file, content] of Object.entries(docs)) {
		const path = join(docsTarget, file);
		mkdirSync(dirname(path), { recursive: true });
		writeFileSync(path, content);
	}

	if (Object.keys(files).length > 0) {
		console.log(`scaffolded ${Object.keys(files).length} files → ${target}\n`);
		for (const file of Object.keys(files)) console.log(`  ${file}`);
	}
	if (Object.keys(docs).length > 0) {
		console.log(`\nscaffolded ${Object.keys(docs).length} files → ${docsTarget}\n`);
		for (const file of Object.keys(docs)) console.log(`  ${file}`);
	}

	// Skipped for an out-of-tree preview: registering keys for a family that does not live in the
	// components directory would leave the manifest describing something that is not there.
	let added = [];
	if (options.presets && !options.out && !options.docsOnly) {
		const keys = presetKeysFor(options.name, options.slots, { static: options.static });
		const result = withPresetKeys(readFileSync(MANIFEST_PATH, 'utf8'), keys);
		if (result.added.length > 0) writeFileSync(MANIFEST_PATH, result.source);
		added = result.added;
		if (added.length > 0) {
			console.log(`\nregistered ${added.length} preset keys → src/lib/preset/manifest.ts`);
			for (const key of added) console.log(`  ${key}`);
		}
	}

	const steps = options.docsOnly
		? ['bun run check && bun run lint']
		: [
				`fill the ${TODO}s in bond.svelte.ts — capabilities, state methods, predicates`,
				'add default styling for the new preset keys in src/lib/preset/default.ts',
				'add the family to src/lib/index.ts and src/lib/public/ if it is public',
				'bun run check && bun run lint && bun run test:unit -- --run'
			];
	// First, not last: `content.svelte` imports the prop tables, and nothing generates them until
	// this runs — so the page does not type-check in between.
	if (Object.keys(docs).length > 0) {
		steps.unshift(
			'bun run sync:props — writes the props.ts the docs page imports',
			`fill the ${TODO}s in the docs page — shared.ts copy, the basic example, accessibility`
		);
	}
	if (!options.presets || options.out) {
		steps.unshift('register this family’s preset keys in src/lib/preset/manifest.ts');
	}
	console.log('\nNext:');
	steps.forEach((step, index) => console.log(`  ${index + 1}. ${step}`));
	console.log('');
}

// Only run as a CLI; importing this module (the spec does) must have no side effects.
if (process.argv[1] && process.argv[1].endsWith('scaffold.mjs')) {
	try {
		main();
	} catch (error) {
		console.error(`[scaffold] ${error.message}`);
		process.exit(1);
	}
}
