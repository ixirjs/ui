import { afterEach, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./fetch-shadcn.mjs', import.meta.url));
const roots = [];
afterEach(() => roots.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true })));

function fixture() {
	const root = mkdtempSync(join(tmpdir(), 'registry-security-'));
	roots.push(root);
	writeFileSync(join(root, 'package.json'), JSON.stringify({ devDependencies: {} }));
	return root;
}

function fetchFiles(root, files) {
	// Run the real script with an in-memory registry; no network or real checkout writes.
	const mock = `globalThis.fetch = async () => ({ ok: true, json: async () => ({ files: ${JSON.stringify(files)} }) });`;
	return spawnSync(
		process.execPath,
		['--import', `data:text/javascript,${encodeURIComponent(mock)}`, script],
		{
			cwd: root,
			encoding: 'utf8'
		}
	);
}

it('writes normal registry files, including the legacy path field', () => {
	const root = fixture();
	const result = fetchFiles(root, [{ path: 'button/index.ts', content: 'export {};' }]);
	expect(result.status, result.stderr).toBe(0);
	expect(readFileSync(join(root, 'bench/vs-shadcn/shadcn/button/index.ts'), 'utf8')).toBe(
		'export {};'
	);
});

it.each([
	'../../../package.json',
	'/tmp/escape',
	'C:/escape',
	'..\\escape',
	'button/../../escape',
	'.. /escape',
	'.../escape',
	'button//index.ts',
	'',
	null
])('rejects unsafe registry path %j before writing any fetched files', (target) => {
	const root = fixture();
	const original = readFileSync(join(root, 'package.json'), 'utf8');
	const result = fetchFiles(root, [
		{ target: 'button/index.ts', content: 'export {};' },
		{ target, content: 'unsafe' }
	]);
	expect(result.status).not.toBe(0);
	expect(result.stderr).toContain('Invalid registry file path');
	expect(readFileSync(join(root, 'package.json'), 'utf8')).toBe(original);
	expect(() => readFileSync(join(root, 'bench/vs-shadcn/shadcn/button/index.ts'))).toThrow();
});

it.each(['ancestor', 'directory', 'file'])('rejects an existing %s symlink', (kind) => {
	const root = fixture();
	const out = join(root, 'bench/vs-shadcn/shadcn');
	const outside = join(root, 'outside');
	mkdirSync(out, { recursive: true });
	mkdirSync(outside);
	writeFileSync(join(outside, 'index.ts'), 'untouched');
	if (kind === 'ancestor') {
		rmSync(join(root, 'bench'), { recursive: true });
		symlinkSync(outside, join(root, 'bench'), 'dir');
	} else if (kind === 'directory') {
		symlinkSync(outside, join(out, 'button'), 'dir');
	} else {
		mkdirSync(join(out, 'button'));
		symlinkSync(join(outside, 'index.ts'), join(out, 'button/index.ts'));
	}
	const result = fetchFiles(root, [{ target: 'button/index.ts', content: 'unsafe' }]);
	expect(result.status).not.toBe(0);
	expect(result.stderr).toContain('Registry path contains a symlink');
	expect(readFileSync(join(outside, 'index.ts'), 'utf8')).toBe('untouched');
});
