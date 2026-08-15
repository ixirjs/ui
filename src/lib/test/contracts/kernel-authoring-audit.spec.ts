import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, it } from 'vitest';

const COMPONENTS = join(process.cwd(), 'src/lib/components');
const RENDER_MACHINERY = new Set(['atom/kernel/element-render.svelte']);

function componentFiles(directory: string): string[] {
	const found: string[] = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			if (entry.name !== 'stories') found.push(...componentFiles(path));
		} else if (entry.name.endsWith('.svelte')) found.push(path);
	}
	return found;
}

it('keeps first-party element authoring on Kernel', () => {
	const offenders = componentFiles(COMPONENTS)
		.map((path) => ({ path, name: relative(COMPONENTS, path), source: readFileSync(path, 'utf8') }))
		.filter(({ name }) => !RENDER_MACHINERY.has(name))
		.filter(
			({ source }) =>
				/(?:components\/atom\/(?:html-atom|part-element|use-part-element)|shared\/authoring\/use-part)\.svelte/.test(
					source
				) ||
				/\b(?:usePartElement|partElement)\s*\(/.test(source) ||
				/import\s*\{[^}]*\b(?:HtmlAtom|usePart)\b[^}]*\}/s.test(source)
		)
		.map(({ name }) => name);

	expect(offenders).toEqual([]);
});
