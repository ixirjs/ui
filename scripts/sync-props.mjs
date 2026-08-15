#!/usr/bin/env node
/**
 * Generate the docs prop tables from the library's own types.
 *
 * Source of truth is the JSDoc on each prop declaration in `src/lib/components/**\/types.ts`.
 * This script only reads it — there is no merge step and no hand-editing of the output, so a
 * description can never drift from the type it documents. Its predecessor parsed the existing
 * tables back in and merged them with a "which description looks better" heuristic; that is what
 * let the generated files rot into hand-maintained ones.
 *
 * Usage:
 *   node scripts/sync-props.mjs [component]   write the tables
 *   node scripts/sync-props.mjs --check       exit 1 if any table is stale
 *   node scripts/sync-props.mjs --check --strict   also fail on any prop lacking a description
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project } from 'ts-morph';
import { format, resolveConfig } from 'prettier';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMPONENTS_DIR = join(ROOT, 'src/lib/components');
const DOCS_DIR = join(ROOT, 'src/routes/docs/components');

// A family's table lists the props that family declares. Everything reached by inheritance —
// the rich render/element base types, and through them every native HTML attribute in
// `svelte/elements` — collapses into one `...renderProps` row. That is
// the convention already in the committed tables, and without it Dialog alone resolves to 2998
// rows of `accesskey` / `on:auxclick` noise.
const BASE_TYPE_FILES = [
	join(COMPONENTS_DIR, 'atom/types.ts'),
	join(COMPONENTS_DIR, 'element/types.ts')
];

const isLibrarySource = (path) => path.startsWith(COMPONENTS_DIR) && !path.includes('node_modules');

const RENDER_SPREAD = {
	name: '...renderProps',
	type: 'RenderProps',
	default: '-',
	description:
		'All rich render and HTML element props are supported. See [Styling](/docs/styling) for presets, variants, classes, and attributes.'
};

// Docs dirs that are routing machinery, not components.
const NOT_COMPONENTS = new Set(['[component]', 'previews']);

const project = new Project({
	tsConfigFilePath: join(ROOT, 'tsconfig.json'),
	skipAddingFilesFromTsConfig: true
});

// Every family's types up front, not just the one being generated. Props types reach across
// families (`DatagridCheckboxProps extends Omit<CheckboxProps, 'children'>`,
// `TooltipContentProps = PopoverContentProps`), and a type whose source file is absent from the
// project resolves to zero properties — silently emitting an empty table rather than failing.
project.addSourceFilesAtPaths(`${COMPONENTS_DIR}/**/types.ts`);

/** `DialogContentProps` -> `dialogContentProps`. Matches every committed export name. */
const exportNameFor = (typeName) => typeName.charAt(0).toLowerCase() + typeName.slice(1);

function findTypesFiles(dir) {
	const found = [];
	const walk = (current) => {
		for (const entry of readdirSync(current)) {
			if (entry.startsWith('.') || entry === 'node_modules') continue;
			const full = join(current, entry);
			if (statSync(full).isDirectory()) walk(full);
			else if (entry === 'types.ts') found.push(full);
		}
	};
	walk(dir);
	return found;
}

function readableType(type, at) {
	return type
		.getText(at)
		.replace(/import\("[^"]*"\)\./g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * A JSDoc comment is a plain string only while it contains no inline tags. One `{@link Overlay}`
 * and ts-morph returns an array of nodes instead, so a `typeof comment === 'string'` test drops the
 * whole description — silently, and only for the props whose authors documented them most
 * carefully. `popover`'s `width`/`minWidth`/`maxWidth` each shipped an empty table cell that way.
 *
 * Inline tags render as their display text, which is what the prop tables want: `{@link AnchorSizeFn}`
 * reads as `AnchorSizeFn`, not as a dangling brace.
 */
function jsDocText(comment) {
	if (typeof comment === 'string') return comment;
	if (!Array.isArray(comment)) return '';
	// `getText()` on these nodes spans the raw comment, delimiters and leading `*` included.
	// `compilerNode.text` is the parsed content: the prose for a JSDocText, and for a JSDocLink the
	// label following the target (empty for a bare `{@link Target}`, where `name` carries it).
	return comment
		.map((node) => {
			const compiler = node.compilerNode ?? {};
			const text = compiler.text ?? '';
			const target = compiler.name ? compiler.name.getText() : '';
			return target ? `${target}${text}` : text;
		})
		.join('');
}

/**
 * Pull description and `@default` off a property's own JSDoc.
 *
 * `getJsDocTags()` on the symbol resolves through the declaration, so this works the same for a
 * property declared on an interface and one reached through a type alias or intersection.
 */
function docsFor(symbol) {
	const decl = symbol.getValueDeclaration() ?? symbol.getDeclarations()[0];
	let description = '';
	let defaultValue;

	if (decl && typeof decl.getJsDocs === 'function') {
		for (const jsDoc of decl.getJsDocs()) {
			const comment = jsDocText(jsDoc.getComment());
			if (comment.trim()) description = comment.trim();
			for (const tag of jsDoc.getTags()) {
				if (tag.getTagName() === 'default') {
					defaultValue = tag.getComment()?.toString().trim() || undefined;
				}
			}
		}
	}

	return { decl, description, default: defaultValue };
}

/**
 * Resolve a props type to its rows.
 *
 * Resolution goes through the *type*, not the declaration, so interfaces, type aliases and
 * intersections all take one path and inheritance comes for free. Many families declare props as
 * aliases (`context-menu` has 8, `tree` 4) — walking `extends` clauses would silently skip them.
 */
function resolveProps(decl, { isBaseFamily = false } = {}) {
	const rows = [];
	let inheritsBase = false;

	for (const symbol of decl.getType().getProperties()) {
		const { decl: propDecl, description, default: declaredDefault } = docsFor(symbol);
		if (!propDecl) continue;

		// Anything declared outside the library's own components — the atom/element base types,
		// and everything they pull in from `svelte/elements` — collapses into the spread row.
		// A family that redeclares an inherited prop keeps its own declaration, since that
		// declaration is library source.
		//
		// The atom and element families are the exception: the base props are their subject rather
		// than inherited noise.
		const declPath = propDecl.getSourceFile().getFilePath();
		const isBaseDecl = BASE_TYPE_FILES.includes(declPath);
		if (!isLibrarySource(declPath) || (isBaseDecl && !isBaseFamily)) {
			inheritsBase = true;
			continue;
		}

		rows.push({
			name: symbol.getName(),
			type: readableType(symbol.getTypeAtLocation(decl), decl),
			default: declaredDefault ?? 'undefined',
			description,
			undocumented: !description
		});
	}

	rows.sort((a, b) => a.name.localeCompare(b.name));
	if (inheritsBase) rows.push({ ...RENDER_SPREAD });
	return rows;
}

// Multi-line JSDoc arrives with real newlines; a raw one would terminate the string literal.
const quote = (value) =>
	`'${value
		.replace(/\\/g, '\\\\')
		.replace(/'/g, "\\'")
		.replace(/\r?\n/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()}'`;

// Formatted through prettier with the repo's own config, so generated output is byte-identical
// to what `prettier --check` expects. Without this, `bun run lint` fails on every run: the
// formatter and the generator would each insist on their own wrapping.
const prettierConfig = await resolveConfig(join(DOCS_DIR, 'button/props.ts'));

// One fact repeated in 180 tables. Emit one shared row instead of ~1,200 generated lines.
const isRenderSpread = (row) => row.name === RENDER_SPREAD.name;

async function renderFile(tables) {
	const usesRenderSpread = tables.some(([, rows]) => rows.some(isRenderSpread));

	let out = usesRenderSpread
		? `import { renderPropsRow, type PropDefinition } from '$docs/types';\n`
		: `import type { PropDefinition } from '$docs/types';\n`;

	for (const [exportName, rows] of tables) {
		out += `\nexport const ${exportName}: PropDefinition[] = [\n`;
		out += rows
			.map((row) =>
				isRenderSpread(row)
					? `\trenderPropsRow`
					: `\t{\n\t\tname: ${quote(row.name)},\n\t\ttype: ${quote(row.type)},\n` +
						`\t\tdefault: ${quote(row.default)},\n\t\tdescription: ${quote(row.description)}\n\t}`
			)
			.join(',\n');
		out += `\n];\n`;
	}

	return format(out, { ...prettierConfig, parser: 'typescript' });
}

const skippedEmpty = [];

function collectTables(componentName) {
	const componentDir = join(COMPONENTS_DIR, componentName);
	if (!existsSync(componentDir)) return null;

	const tables = [];
	const undocumented = [];

	for (const typesPath of findTypesFiles(componentDir)) {
		const sourceFile = project.getSourceFile(typesPath) ?? project.addSourceFileAtPath(typesPath);

		const declarations = [...sourceFile.getInterfaces(), ...sourceFile.getTypeAliases()].filter(
			(decl) => {
				const name = decl.getName();
				// `*ExtendProps` are consumer declaration-merging seams with no props of their own.
				// `*SnippetProps` is a snippet's payload, not a component's props.
				return (
					name.endsWith('Props') &&
					!name.includes('Extend') &&
					!name.endsWith('SnippetProps') &&
					decl.isExported()
				);
			}
		);

		const isBaseFamily = componentName === 'atom' || componentName === 'element';

		for (const decl of declarations) {
			const rows = resolveProps(decl, { isBaseFamily });

			// No named props and no inherited element props: not a component's props type at all
			// but a payload bag (`SliderResolvedPartProps = Record<string, unknown>`). Emitting a
			// `...renderProps` row for one would state in the docs that it accepts every HTML
			// attribute, which is false. Skip it and name it, so a type that lands here by mistake
			// is visible rather than silently absent.
			if (!rows.length) {
				skippedEmpty.push(`${componentName}.${decl.getName()}`);
				continue;
			}
			for (const row of rows) {
				if (row.undocumented) undocumented.push(`${componentName}.${decl.getName()}.${row.name}`);
			}
			tables.push([exportNameFor(decl.getName()), rows]);
		}
	}

	return { tables, undocumented };
}

const args = process.argv.slice(2);
const check = args.includes('--check');
const strict = args.includes('--strict');
const only = args.find((arg) => !arg.startsWith('--'));

const docsComponents = readdirSync(DOCS_DIR)
	.filter((entry) => !NOT_COMPONENTS.has(entry) && statSync(join(DOCS_DIR, entry)).isDirectory())
	.filter((entry) => (only ? entry === only : true));

let stale = 0;
let missing = 0;
const allUndocumented = [];

for (const component of docsComponents) {
	const result = collectTables(component);
	if (!result || !result.tables.length) {
		console.log(`  skip  ${component} (no props types found)`);
		missing++;
		continue;
	}

	allUndocumented.push(...result.undocumented);

	const target = join(DOCS_DIR, component, 'props.ts');
	const next = await renderFile(result.tables);
	const current = existsSync(target) ? readFileSync(target, 'utf8') : '';

	if (current === next) continue;

	if (check) {
		console.error(`  stale ${component}/props.ts`);
		stale++;
	} else {
		writeFileSync(target, next, 'utf8');
		console.log(`  write ${component}/props.ts (${result.tables.length} tables)`);
	}
}

if (allUndocumented.length) {
	console.warn(
		`\n${allUndocumented.length} props have no JSDoc description (backlog, not a failure):`
	);
	for (const entry of allUndocumented.slice(0, 40)) console.error(`  - ${entry}`);
	if (allUndocumented.length > 40) console.error(`  … ${allUndocumented.length - 40} more`);
}

// A stale table is a real failure: the committed output no longer matches the types.
// An undocumented prop is a backlog, not a regression — 282 of them predate this generator, and
// failing on those would leave `bun run lint` permanently red and unlandable. `--strict` is for
// once that backlog reaches zero.
if (check && stale) {
	console.error(`\n${stale} prop table(s) are stale. Run \`bun run sync:props\`.`);
	process.exit(1);
}

if (check && strict && allUndocumented.length) {
	console.error(`\n--strict: every prop must carry a JSDoc description.`);
	process.exit(1);
}

if (missing) console.log(`\n${missing} docs dirs had no matching props types.`);

if (skippedEmpty.length) {
	console.log(
		`\n${skippedEmpty.length} type(s) had no named or inherited props; no table emitted:`
	);
	for (const name of skippedEmpty) console.log(`  - ${name}`);
}
