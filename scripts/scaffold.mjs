#!/usr/bin/env node
/**
 * Scaffold a component family.
 *
 * Authoring a bonded family means writing the same eight-ish files every time: a barrel, an atom
 * namespace, four prop-type aliases and four extension interfaces, and one ~25-line part component
 * per slot whose entire body is `usePart` plus an `<HtmlAtom>` with the `$preset` sentinel. The
 * mechanical share of that was measured at roughly 70%; the remaining 30% — ARIA and keyboard
 * logic, Bond methods, capability choice, motion, markup — is the part worth a human.
 *
 * This emits the 70% in the canonical shape, so "copy the nearest sibling and edit" stops being
 * the only template. It deliberately does NOT introduce a shared runtime `<Part>` wrapper: a
 * component between the family part and `HtmlAtom` costs ~1 µs per part (about +9% on Card), so
 * the duplication between part files is a measured performance floor, not an accident. The fix for
 * repetitive files is to generate them, not to wrap them.
 *
 * Usage:
 *   node scripts/scaffold.mjs <name> --slots root,header:trigger,body:content,indicator
 *   node scripts/scaffold.mjs <name> --slots root,item --static
 *   node scripts/scaffold.mjs <name> --slots root,header --out /tmp/preview --dry
 *
 * A slot is `name` or `name:role`. `role` is the relationship role a capability responds to
 * (`trigger`, `content`, `item`, …) and is passed straight through to `defineBond`'s atom map.
 * `root` is implied and always emitted first.
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
		.map(
			(s) =>
				`// eslint-disable-next-line @typescript-eslint/no-empty-object-type\n` +
				`export interface ${n.Pascal}${pascal(s.slot)}ExtendProps {}`
		)
		.join('\n\n');

	// Emitted already Prettier-clean: a root's extra members push the intersection onto its own
	// line, a bare part's does not. Generating output that `bun run lint` immediately rewrites
	// makes every scaffold start with a spurious diff.
	const propsFor = (s) => {
		const head = `export type ${n.Pascal}${pascal(s.slot)}Props<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B, ${n.Pascal}Children> &`;
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
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
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
	const atomDecls = slots
		.map(
			(
				s
			) => `export const ${n.Pascal}${pascal(s.slot)}Atom = defineAtom<${n.Pascal}BondView>('${s.slot}');
export type ${n.Pascal}${pascal(s.slot)}Atom = InstanceType<typeof ${n.Pascal}${pascal(s.slot)}Atom>;`
		)
		.join('\n\n');

	const atomMap = slots
		.map((s) =>
			s.role
				? `\t\t${s.slot}: { atom: ${n.Pascal}${pascal(s.slot)}Atom, role: '${s.role}' }`
				: `\t\t${s.slot}: ${n.Pascal}${pascal(s.slot)}Atom`
		)
		.join(',\n');

	const domElements = slots.map((s) => `\t${s.slot}: HTMLElement;`).join('\n');

	return `import { Bond, defineAtom } from '$ixirjs/ui/shared/bond';
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
// Internal types
// -----------------------------------------------------------------------------

type ${n.Pascal}BondView = ${n.Pascal}BondBase;

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

${atomDecls}

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
	return `<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { useRoot } from '$ixirjs/ui/shared';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { ${n.Pascal}Bond, type ${n.Pascal}StateProps } from './bond.svelte';
	import type { ${n.Pascal}RootProps } from './types';

	const ID = $props.id();

	let {
		class: klass = '',
		preset = undefined,
		disabled = false,
		factory = defaultFactory,
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
			factory: (props) => factory(props)
		}
	);
	const bond = root.bond;

	function defaultFactory(props: ${n.Pascal}StateProps) {
		return ${n.Pascal}Bond.create(props);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom class={['${n.kebab}', '$preset', klass]} {...root.props} {...restProps} part={root}>
	{@render children?.({ ${n.camel}: bond })}
</HtmlAtom>
`;
}

function partFile(n, slot) {
	return `<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { ${n.Pascal}Bond } from './bond.svelte';
	import type { ${n.Pascal}${pascal(slot)}Props } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: ${n.Pascal}${pascal(slot)}Props<E, B> = $props();

	const part = usePart(${n.Pascal}Bond, '${slot}', () => restProps, {
		preset: () => preset
	});
</script>

<HtmlAtom class={['${n.kebab}-${slot}', '$preset', klass]} {...restProps} {part}>
	{@render children?.({ ${n.camel}: part.bond })}
</HtmlAtom>
`;
}

/** A static module: component + types + index, no Bond, no Atom (the Button shape). */
function staticFile(n) {
	return `<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, mergePresetProps, type Base } from '$ixirjs/ui/components/atom';
	import type { ${n.Pascal}Props } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: ${n.Pascal}Props<E, B> = $props();

	const ${n.camel}Props = $derived(mergePresetProps(preset, '${n.kebab}', restProps));
</script>

<HtmlAtom class={['${n.kebab}', '$preset', klass]} {...${n.camel}Props}>
	{@render children?.()}
</HtmlAtom>
`;
}

function staticTypesFile(n) {
	return `import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base } from '$ixirjs/ui/components/atom';

// Extension point: merge custom props by augmenting this interface.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ${n.Pascal}ExtendProps {}

export type ${n.Pascal}Props<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = HtmlAtomProps<E, B, Snippet> & ${n.Pascal}ExtendProps;
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
		presets: true
	};
	for (let index = 0; index < argv.length; index++) {
		const arg = argv[index];
		if (arg === '--static') options.static = true;
		else if (arg === '--dry') options.dry = true;
		else if (arg === '--no-presets') options.presets = false;
		else if (arg === '--slots') options.slots = argv[++index];
		else if (arg === '--out') options.out = argv[++index];
		else if (!arg.startsWith('-') && !options.name) options.name = arg;
		else throw new Error(`unexpected argument "${arg}"`);
	}
	if (!options.name) throw new Error('a component name is required');
	return options;
}

function main() {
	const options = parseArgs(process.argv.slice(2));
	const files = planFamily(options.name, options.slots, { static: options.static });
	const target = options.out ? join(options.out, options.name) : join(COMPONENTS_DIR, options.name);

	if (options.dry) {
		for (const [file, content] of Object.entries(files)) {
			console.log(`\n─── ${join(target, file)} ${'─'.repeat(Math.max(0, 60 - file.length))}`);
			console.log(content);
		}
		return;
	}

	// Never overwrite: scaffolding is for new families, and a half-generated directory over an
	// authored one is far worse than a refusal.
	if (existsSync(target) && readdirSync(target).length > 0) {
		throw new Error(`${target} already exists and is not empty`);
	}
	mkdirSync(target, { recursive: true });
	for (const [file, content] of Object.entries(files)) {
		writeFileSync(join(target, file), content);
	}

	console.log(`scaffolded ${Object.keys(files).length} files → ${target}\n`);
	for (const file of Object.keys(files)) console.log(`  ${file}`);

	// Skipped for an out-of-tree preview: registering keys for a family that does not live in the
	// components directory would leave the manifest describing something that is not there.
	let added = [];
	if (options.presets && !options.out) {
		const keys = presetKeysFor(options.name, options.slots, { static: options.static });
		const result = withPresetKeys(readFileSync(MANIFEST_PATH, 'utf8'), keys);
		if (result.added.length > 0) writeFileSync(MANIFEST_PATH, result.source);
		added = result.added;
		if (added.length > 0) {
			console.log(`\nregistered ${added.length} preset keys → src/lib/preset/manifest.ts`);
			for (const key of added) console.log(`  ${key}`);
		}
	}

	const steps = [
		`fill the ${TODO}s in bond.svelte.ts — capabilities, state methods, predicates`,
		'add default styling for the new preset keys in src/lib/preset/default.ts',
		'add the family to src/lib/index.ts and src/lib/public/ if it is public',
		'bun run check && bun run lint && bun run test:unit -- --run'
	];
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
