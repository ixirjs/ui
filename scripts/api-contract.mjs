// Conservative declaration review gate. Reads the built package, never source aliases.
// A declaration diff is a review request, not a semantic compatibility verdict.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project, ts } from 'ts-morph';
import { createHash } from 'node:crypto';

export const fingerprint = (value) =>
	createHash('sha256')
		.update(JSON.stringify(value) ?? '<absent>')
		.digest('hex');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const baselinePath = join(root, 'docs/api/current-baseline.json');
const json = (path) => JSON.parse(readFileSync(path, 'utf8'));
const sorted = (entries) =>
	Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b, 'en')));

export function packageMetadata(pkg) {
	return Object.fromEntries(
		[
			'name',
			'type',
			'files',
			'sideEffects',
			'svelte',
			'types',
			'dependencies',
			'optionalDependencies',
			'engines',
			'main',
			'module',
			'browser',
			'imports',
			'os',
			'cpu'
		].map((key) => [key, pkg[key] ?? null])
	);
}

export function inspectPackage(directory = root) {
	const pkg = json(join(directory, 'package.json'));
	const project = new Project({
		compilerOptions: { moduleResolution: ts.ModuleResolutionKind.Bundler, strict: true },
		skipAddingFilesFromTsConfig: true
	});
	const entries = [];
	for (const [key, target] of Object.entries(pkg.exports)) {
		if (!target.types) continue;
		if (key.includes('*')) {
			const folder = join(directory, dirname(target.types));
			for (const file of readdirSync(folder, { recursive: true }).sort()) {
				if (!file.endsWith('.d.ts')) continue;
				entries.push([key.replace('*', file.slice(0, -5)), join(folder, file)]);
			}
		} else entries.push([key, join(directory, target.types)]);
	}
	if (!entries.length) throw new Error('No typed package entry points');
	for (const [, file] of entries) {
		if (!existsSync(file)) throw new Error(`Missing declaration: ${file}`);
		project.addSourceFileAtPath(file);
	}
	project.resolveSourceFileDependencies();
	const printer = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed });
	const declarations = [];
	for (const source of project.getSourceFiles()) {
		const path = relative(directory, source.getFilePath()).replaceAll('\\', '/');
		if (!path.startsWith('dist/')) continue;
		declarations.push([path, printer.printFile(source.compilerNode).trim()]);
	}
	const surfaces = entries.map(([entry, file]) => {
		const source = project.getSourceFileOrThrow(file);
		const exports = [...source.getExportedDeclarations()].map(([name, nodes]) => [
			name,
			[
				...new Set(
					nodes.map((node) =>
						relative(directory, node.getSourceFile().getFilePath()).replaceAll('\\', '/')
					)
				)
			].sort()
		]);
		if (!exports.length) throw new Error(`Empty public entry: ${entry}`);
		return [entry, sorted(exports)];
	});
	return {
		schema: 1,
		metadata: packageMetadata(pkg),
		exports: pkg.exports,
		peerDependencies: pkg.peerDependencies,
		peerDependenciesMeta: pkg.peerDependenciesMeta,
		surfaces: sorted(surfaces),
		declarations: sorted(declarations)
	};
}

export function differences(baseline, candidate) {
	if (
		baseline.schema !== 1 ||
		candidate.schema !== 1 ||
		!Object.keys(baseline.declarations ?? {}).length ||
		!Object.keys(candidate.declarations ?? {}).length
	)
		throw new Error('Missing or unsupported API evidence');
	const changes = [];
	for (const section of [
		'metadata',
		'exports',
		'peerDependencies',
		'peerDependenciesMeta',
		'surfaces',
		'declarations'
	]) {
		if (!baseline[section] || !candidate[section])
			throw new Error(`Missing API section: ${section}`);
		for (const key of new Set([
			...Object.keys(baseline[section]),
			...Object.keys(candidate[section])
		])) {
			if (JSON.stringify(baseline[section][key]) !== JSON.stringify(candidate[section][key]))
				changes.push(`${section}:${key}`);
		}
	}
	return changes.sort();
}

// Reviews name exact before/after evidence. No wildcard exceptions or baseline regeneration.
export function unreviewed(baseline, candidate, reviews) {
	return differences(baseline, candidate).filter((key) => {
		const colon = key.indexOf(':');
		const section = key.slice(0, colon),
			name = key.slice(colon + 1);
		return !reviews.some(
			(review) =>
				review.key === key &&
				review.reason &&
				review.checks?.length &&
				review.before === fingerprint(baseline[section][name]) &&
				review.after === fingerprint(candidate[section][name])
		);
	});
}

export function inventoryMarkdown(contract) {
	return (
		'# Public API inventory\n\nGenerated from built declarations by `node scripts/api-contract.mjs --inventory`.\nEach name inherits its facade decision in [evolution.md](./evolution.md); each prop, method,\nnamespace member, binding and generic signature is retained in [current-baseline.json](./current-baseline.json).\nMechanical inventory is not per-member behavioral verification. The CSS entry is `./styles/root.css`.\n\n' +
		Object.entries(contract.surfaces)
			.map(
				([entry, exports]) =>
					`## ${entry}\n\n${Object.keys(exports)
						.map((name) => `- \`${name}\``)
						.join('\n')}\n`
			)
			.join('\n')
	);
}

export function archive(path, value) {
	if (existsSync(path)) {
		if (JSON.stringify(json(path)) !== JSON.stringify(value))
			throw new Error(`Immutable archive mismatch: ${path}`);
		return;
	}
	writeFileSync(path, `${JSON.stringify(value, null, '\t')}\n`, { flag: 'wx' });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const candidate = inspectPackage();
	if (process.argv.includes('--inventory')) {
		writeFileSync(join(root, 'docs/api/inventory.md'), inventoryMarkdown(candidate));
	} else if (process.argv.includes('--initialize')) {
		// Deliberately cannot overwrite. This is the worktree baseline, not a claim about alpha.48.
		archive(baselinePath, candidate);
	} else {
		const reviews = json(join(root, 'docs/api/reviews.json'));
		for (const review of reviews)
			for (const check of review.checks ?? []) {
				if (!existsSync(join(root, check))) throw new Error(`Missing review evidence: ${check}`);
			}
		if (readFileSync(join(root, 'docs/api/inventory.md'), 'utf8') !== inventoryMarkdown(candidate))
			throw new Error('Stale API inventory: run node scripts/api-contract.mjs --inventory');
		const evolution = readFileSync(join(root, 'docs/api/evolution.md'), 'utf8');
		const reviewedFamilies = new Set(
			evolution
				.split('\n')
				.filter((line) => line.startsWith('|'))
				.map((line) => line.split('|')[1].trim())
		);
		for (const entry of Object.keys(candidate.surfaces)) {
			if (
				entry.startsWith('./components/') &&
				!reviewedFamilies.has(entry.slice('./components/'.length))
			)
				throw new Error(`Missing today/tomorrow family review: ${entry}`);
		}
		const changes = unreviewed(json(baselinePath), candidate, reviews);
		if (changes.length)
			throw new Error(
				`API review required (do not regenerate the baseline):\n${changes.join('\n')}`
			);
	}
	console.log(
		`[api-contract] ${Object.keys(candidate.surfaces).length} entries, ${Object.keys(candidate.declarations).length} reachable declaration files checked`
	);
}
