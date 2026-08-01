import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUILT_IN_PRESET_KEYS } from './manifest';

function productionFiles(directory: string): string[] {
	const files: string[] = [];
	for (const name of readdirSync(directory)) {
		const path = join(directory, name);
		if (statSync(path).isDirectory()) files.push(...productionFiles(path));
		else if (/\.(?:svelte|ts)$/.test(name) && !/\.(?:spec|test|stories|bench)\./.test(name)) {
			files.push(path);
		}
	}
	return files;
}

function declaredFallbacks(): string[] {
	const components = join(dirname(fileURLToPath(import.meta.url)), '../components');
	const keys = new Set<string>();
	const patterns = [
		/mergePresetProps\([^,]+,\s*['"]([^'"]+)['"]/g,
		/\bpreset\s*:\s*[A-Za-z_$][\w$]*\s*=\s*['"]([^'"]+)['"]/g,
		/\bpreset\s*=\s*['"]([^'"]+)['"]/g,
		/\bpreset\s*:\s*['"]([^'"]+)['"]/g,
		/\bpreset\s*\?\?\s*['"]([^'"]+)['"]/g
	];
	for (const file of productionFiles(components)) {
		const source = readFileSync(file, 'utf8');
		for (const pattern of patterns) {
			for (const match of source.matchAll(pattern)) keys.add(match[1]!);
		}
	}
	return [...keys].filter((key) => /^[a-z]/.test(key)).sort();
}

describe('built-in preset manifest', () => {
	it('is sorted and unique', () => {
		const keys = [...BUILT_IN_PRESET_KEYS];
		expect(keys).toEqual([...new Set(keys)].sort());
	});

	it('contains every statically declared production preset fallback', () => {
		const manifest = new Set<string>(BUILT_IN_PRESET_KEYS);
		expect(declaredFallbacks().filter((key) => !manifest.has(key))).toEqual([]);
	});
});
