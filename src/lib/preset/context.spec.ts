import { describe, expect, it, vi } from 'vitest';
import { render } from 'svelte/server';
import PresetContextProbe from '$ixirjs/ui/test/context/preset-context.test.svelte';
import { definePreset } from './context.svelte';
import type { Preset } from '$ixirjs/ui/preset/types';

describe('preset context', () => {
	it('installs during initialization and layers entries explicitly', () => {
		const { body } = render(PresetContextProbe);
		expect(body).toContain('data-class="base override"');
		expect(body).toContain('data-base="yes"');
		expect(body).toContain('data-layer="yes"');
		expect(body).toContain('data-role="link"');
	});

	it('warns on a near-miss preset key and stays silent on a genuinely custom one', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		try {
			// `acordion` / `card.titel` are typos of shipped keys; `my-app.hero` is an app registering
			// its own slot through PresetModuleMap augmentation — invisible to the runtime, so it must
			// not be flagged. Keys the type system would reject, which is the case worth checking.
			definePreset({
				acordion: () => ({ class: 'x' }),
				'card.titel': () => ({ class: 'x' }),
				'my-app.hero': () => ({ class: 'x' }),
				button: () => ({ class: 'x' })
			} as Partial<Preset>);

			const warned = warn.mock.calls.map(([message]) => String(message));
			expect(warned).toHaveLength(2);
			expect(warned[0]).toContain('unknown preset key "acordion". Did you mean "accordion"?');
			expect(warned[1]).toContain('unknown preset key "card.titel". Did you mean "card.title"?');
		} finally {
			warn.mockRestore();
		}
	});
});
