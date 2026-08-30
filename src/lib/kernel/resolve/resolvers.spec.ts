import { describe, expect, it, vi } from 'vitest';
import { fallbackPreset, type PresetEntry } from '$ixirjs/ui/preset/context.svelte';
import * as resolvers from './resolvers';

describe('preset selection', () => {
	const registry: Record<string, PresetEntry> = {
		'popover.tail': () => ({ class: 'origin' }),
		'combobox.content': () => ({ class: 'namespaced' })
	};
	const getPreset = (key: string) => registry[key];

	it('resolves one key', () => {
		expect(resolvers.resolvePreset('popover.tail', undefined, getPreset)?.class).toBe('origin');
	});

	it('uses an explicit fallback selection in order', () => {
		expect(
			resolvers.resolvePreset(
				fallbackPreset('select.content', 'popover.tail'),
				undefined,
				getPreset
			)?.class
		).toBe('origin');
	});

	it('does not invoke later fallbacks after a hit', () => {
		expect(
			resolvers.resolvePreset(
				fallbackPreset('combobox.content', 'popover.tail'),
				undefined,
				getPreset
			)?.class
		).toBe('namespaced');
	});

	it('resolves direct and bond-aware instance layers without registry lookup', () => {
		const factory = vi.fn(({ bond }: { bond: unknown }) => ({
			class: bond ? 'bond-layer' : 'direct-layer',
			attrs: { 'data-instance': 'yes' }
		}));

		expect(resolvers.resolvePresetLayer({ class: 'direct-layer' }, undefined)).toMatchObject({
			class: 'direct-layer'
		});
		expect(resolvers.resolvePresetLayer(factory, undefined)).toMatchObject({
			class: 'direct-layer',
			attrs: { 'data-instance': 'yes' }
		});
		expect(factory).toHaveBeenCalledWith({ bond: undefined });
	});

	it('does not warn for a known built-in key when no theme is installed', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		try {
			expect(
				resolvers.resolvePreset(
					'collapsible' as never,
					undefined,
					() => undefined,
					() => []
				)
			).toBe(undefined);
			expect(warn).not.toHaveBeenCalled();
		} finally {
			warn.mockRestore();
		}
	});

	it('warns once with the nearest registered key for an explicit miss', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const unknownKey = 'popover.conent' as never;

		try {
			expect(
				resolvers.resolvePreset(unknownKey, undefined, getPreset, () => Object.keys(registry))
			).toBe(undefined);
			expect(
				resolvers.resolvePreset(unknownKey, undefined, getPreset, () => Object.keys(registry))
			).toBe(undefined);
			expect(warn).toHaveBeenCalledTimes(1);
			expect(warn).toHaveBeenCalledWith(expect.stringContaining('Did you mean "popover.content"?'));
		} finally {
			warn.mockRestore();
		}
	});
});
