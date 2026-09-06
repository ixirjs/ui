import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { archive, differences, fingerprint, inspectPackage, unreviewed } from './api-contract.mjs';

const fixture = () => ({
	schema: 1,
	metadata: {},
	exports: { '.': { types: './dist/index.d.ts' } },
	peerDependencies: { svelte: '^5.46.4' },
	peerDependenciesMeta: {},
	surfaces: { '.': { Card: ['dist/index.d.ts'] } },
	declarations: {
		'dist/index.d.ts': 'export declare const Card: { Root: Component<Props, {}, "value"> };'
	}
});

describe('API compatibility evidence', () => {
	it.each([
		'export declare const Card: {};', // namespace part removal
		'export declare const Card: { Root: Component<NarrowerProps, {}, "value"> };',
		'export declare const Card: { Root: Component<Props, {}, ""> };', // binding removal
		'export declare const Card: { Root: Component<PropsWithNewCallback, {}, "value"> };'
	])('rejects an unreviewed declaration change: %s', (declaration) => {
		const old = fixture(),
			next = fixture();
		next.declarations['dist/index.d.ts'] = declaration;
		expect(unreviewed(old, next, [])).toEqual(['declarations:dist/index.d.ts']);
	});
	it('requires exact paired evidence, not a reusable allowlist', () => {
		const old = fixture(),
			next = fixture();
		next.declarations['dist/index.d.ts'] += '\nexport type Added = string;';
		const review = {
			key: 'declarations:dist/index.d.ts',
			reason: 'Additive type',
			checks: ['consumer'],
			before: fingerprint(old.declarations['dist/index.d.ts']),
			after: fingerprint(next.declarations['dist/index.d.ts'])
		};
		expect(unreviewed(old, next, [review])).toEqual([]);
		next.declarations['dist/index.d.ts'] = 'export {};';
		expect(unreviewed(old, next, [review])).toHaveLength(1);
	});
	it('fails closed on missing evidence and removed package paths', () => {
		expect(() => differences(fixture(), {})).toThrow('evidence');
		const next = fixture();
		delete next.exports['.'];
		expect(differences(fixture(), next)).toContain('exports:.');
		next.metadata.files = ['dist/index.js'];
		expect(differences(fixture(), next)).toContain('metadata:files');
	});
	it('discovers type exports and declarations reached through namespace exports', () => {
		const dir = mkdtempSync(join(tmpdir(), 'api-gate-'));
		try {
			mkdirSync(join(dir, 'dist'));
			writeFileSync(
				join(dir, 'package.json'),
				JSON.stringify({
					exports: fixture().exports,
					peerDependencies: {},
					peerDependenciesMeta: {}
				})
			);
			writeFileSync(
				join(dir, 'dist/index.d.ts'),
				"export * as Card from './parts'; export type Props = { value?: string };\n"
			);
			writeFileSync(
				join(dir, 'dist/parts.d.ts'),
				'export declare const Root: { bindings: "value" };'
			);
			const result = inspectPackage(dir);
			expect(Object.keys(result.surfaces['.'])).toEqual(['Card', 'Props']);
			expect(result.declarations['dist/parts.d.ts']).toContain('bindings: "value"');
			for (const declaration of ['export declare const Root: { bindings: "" };', 'export {};']) {
				writeFileSync(join(dir, 'dist/parts.d.ts'), declaration);
				expect(unreviewed(result, inspectPackage(dir), [])).toContain(
					'declarations:dist/parts.d.ts'
				);
			}
			rmSync(join(dir, 'dist/index.d.ts'));
			expect(() => inspectPackage(dir)).toThrow('Missing declaration');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
	it('never silently overwrites a version, even on retries', () => {
		const dir = mkdtempSync(join(tmpdir(), 'api-archive-'));
		try {
			const path = join(dir, 'version.json');
			archive(path, fixture());
			archive(path, fixture());
			expect(() => archive(path, { schema: 2 })).toThrow('Immutable archive mismatch');
			expect(JSON.parse(readFileSync(path, 'utf8'))).toEqual(fixture());
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
});
