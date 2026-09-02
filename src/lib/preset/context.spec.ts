import { describe, expect, it, vi } from 'vitest';
import { render } from 'svelte/server';
import PresetContextProbe from '$ixirjs/ui/test/context/preset-context.test.svelte';
import PresetInstallContextProbe from '$ixirjs/ui/test/context/preset-install-context.test.svelte';
import PresetInstallOnlyProbe from '$ixirjs/ui/test/context/preset-install-only.test.svelte';
import PresetInstallWarnProbe from '$ixirjs/ui/test/context/preset-install-warn.test.svelte';
import { definePreset, installPreset } from './context.svelte';
import type { Preset } from '$ixirjs/ui/preset/types';

describe('preset context', () => {
	it('installs during initialization and layers entries explicitly', () => {
		const { body } = render(PresetContextProbe);
		expect(body).toContain('data-class="base override"');
		expect(body).toContain('data-base="yes"');
		expect(body).toContain('data-layer="yes"');
		expect(body).toContain('data-role="link"');
	});

	it('installPreset answers getPreset with no context provider', () => {
		installPreset({ button: () => ({ class: 'installed-only' }) });
		const { body } = render(PresetInstallOnlyProbe);
		expect(body).toContain('data-class="installed-only"');
	});

	it('a setPreset override wins over the installed preset for its own key and falls back to the installed entry otherwise', () => {
		installPreset({
			'card.title': () => ({ class: 'installed-title' })
		});
		const { body } = render(PresetInstallContextProbe);
		// The fixture's own `setPreset` layers a `button` override on top of whatever is installed:
		// the override always resolves last, proving it wins rather than being shadowed.
		expect(body).toMatch(/data-button-class="[^"]*\boverride\b"/);
		expect(body).toContain('data-button-layer="yes"');
		// `card.title` was never overridden by the fixture, so it falls through to the installed entry.
		expect(body).toContain('data-title-class="installed-title"');
		expect(body).toContain('data-role="b"');
	});

	it('warns in DEV when installPreset is called during component initialization', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		try {
			const { body } = render(PresetInstallWarnProbe);
			void body;
			const warned = warn.mock.calls.map(([message]) => String(message));
			expect(warned.some((message) => message.includes('installPreset() called during'))).toBe(
				true
			);
		} finally {
			warn.mockRestore();
		}
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
