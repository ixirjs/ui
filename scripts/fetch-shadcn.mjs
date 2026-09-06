/**
 * Vendors shadcn-svelte component source into `bench/vs-shadcn/shadcn/` — the same thing the
 * shadcn CLI does, minus the project rewrite. Pinned by REGISTRY_REV below plus a content hash
 * written to `provenance.json`: the registry is unversioned, so the hash IS the version.
 *
 *   node scripts/fetch-shadcn.mjs            # fetch + write + hash
 *   node scripts/fetch-shadcn.mjs --verify   # fail if the live registry no longer matches
 */
import { lstatSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';

const REGISTRY = 'https://shadcn-svelte.com/registry';
const OUT = join(process.cwd(), 'bench/vs-shadcn/shadcn');
const ITEMS = [
	'button',
	'card',
	'dialog',
	'select',
	'dropdown-menu',
	'accordion',
	'table',
	'badge',
	'separator',
	'label',
	'input',
	'popover'
];

const VERIFY = process.argv.includes('--verify');
const files = Object.create(null);
/**
 * Raw upstream content, keyed the same way — the provenance hash is taken over THIS, not over what
 * lands on disk. A pin should identify the opponent, so local rewrites (the `$UTILS$` path and the
 * `@ts-nocheck` marker below) must not move it, and `--verify` must fail only when shadcn changed.
 */
const upstream = Object.create(null);

// Registry filenames are untrusted. Reject traversal on either platform and existing symlinks,
// including ancestors of OUT, before any fetched content is written.
function registryPath(target) {
	if (
		typeof target !== 'string' ||
		/[\\:]/.test(target) ||
		target.split('/').some((part) => !part || part !== part.trim() || part.endsWith('.'))
	) {
		throw new Error('Invalid registry file path');
	}
	const path = join(OUT, target);
	for (let current = path; current !== dirname(current); current = dirname(current)) {
		try {
			if (lstatSync(current).isSymbolicLink()) throw new Error('Registry path contains a symlink');
		} catch (error) {
			if (error.code !== 'ENOENT') throw error;
		}
	}
	return path;
}

/**
 * Opt a vendored file out of `bun run check`.
 *
 * `svelte-check` walks whatever the fixtures import, and these files are third-party: they import
 * `@lucide/svelte` icons this repo does not install, and shadcn's own `dropdown-menu-radio-group`
 * does not typecheck under our `exactOptionalPropertyTypes`. Neither is our bug and neither can be
 * fixed in place — the next fetch overwrites any edit. Excluding `bench/` in tsconfig does nothing,
 * because an excluded file that is imported is still part of the program.
 *
 * Applied by the fetcher so it is deterministic and survives a refetch, and applied BEFORE the
 * provenance hash so the hash describes what is actually on disk.
 */
function suppressTypecheck(content) {
	if (content.includes('@ts-nocheck')) return content;
	const marker = '\t// @ts-nocheck — vendored third-party source; see bench/vs-shadcn/README.md\n';
	return content.replace(/<script([^>]*)>\n/, (match, attrs) => `<script${attrs}>\n${marker}`);
}

for (const item of ITEMS) {
	const res = await fetch(`${REGISTRY}/${item}.json`);
	if (!res.ok) throw new Error(`${item}: HTTP ${res.status}`);
	for (const file of (await res.json()).files) {
		// The registry ships `$UTILS$` / `$lib` placeholders the CLI rewrites per project. Same
		// rewrite the CLI performs, pointed at the vendored `shadcn/utils.ts`.
		const content = file.content
			.replaceAll('$UTILS$.js', '../utils')
			.replaceAll('$lib/utils.js', '../utils')
			.replaceAll('"../utils.js"', '"../utils"');
		const target = file.target ?? file.path;
		registryPath(target);
		upstream[target] = file.content;
		files[target] = suppressTypecheck(content);
	}
}

const hash = createHash('sha256')
	.update(
		Object.keys(upstream)
			.sort()
			.map((key) => `${key}\n${upstream[key]}`)
			.join('\n')
	)
	.digest('hex')
	.slice(0, 16);

if (VERIFY) {
	const was = JSON.parse(readFileSync(join(OUT, '..', 'provenance.json'), 'utf8'));
	if (was.registryHash !== hash) {
		console.error(`registry drifted: ${was.registryHash} → ${hash}`);
		process.exit(1);
	}
	console.log(`registry unchanged (${hash})`);
	process.exit(0);
}

for (const [target, content] of Object.entries(files)) {
	const path = registryPath(target);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, content);
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
writeFileSync(
	join(OUT, '..', 'provenance.json'),
	JSON.stringify(
		{
			source: REGISTRY,
			fetched: new Date().toISOString().slice(0, 10),
			shadcnSvelteCli: '1.5.0',
			bitsUi: pkg.devDependencies['bits-ui'],
			tailwindVariants: pkg.devDependencies['tailwind-variants'],
			svelte: pkg.devDependencies.svelte,
			registryHash: hash,
			items: ITEMS,
			files: Object.keys(files).sort()
		},
		null,
		'\t'
	) + '\n'
);
console.log(`wrote ${Object.keys(files).length} files → ${OUT} (hash ${hash})`);
