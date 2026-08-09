import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import Probe from '$ixirjs/ui/test/components/tabs/tabs-keyboard.test.svelte';

// APG tabs, automatic activation: arrows move the highlight, the highlight *is* the selection,
// and DOM focus follows it. Roving tabindex keeps the tablist a single tab stop.
describe('Tabs keyboard navigation', () => {
	const setup = () => {
		const { container, unmount } = render(Probe);
		const tabs = [...container.querySelectorAll<HTMLElement>('[role="tab"]')];
		// Attribute projections settle on the next tick; focus moves synchronously.
		const key = async (key: string) => {
			(document.activeElement ?? tabs[0]!).dispatchEvent(
				new KeyboardEvent('keydown', { key, bubbles: true })
			);
			await tick();
		};
		return { tabs, key, unmount };
	};

	it('moves selection and focus with the arrow keys, skipping disabled tabs', async () => {
		const { tabs, key, unmount } = setup();
		const [one, two, three] = tabs as [HTMLElement, HTMLElement, HTMLElement];

		expect(one.getAttribute('aria-selected')).toBe('true');
		one.focus();

		await key('ArrowRight');
		expect(two.getAttribute('aria-selected')).toBe('true');
		expect(document.activeElement).toBe(two);

		// Wraps past `three` (disabled) straight back to `one`.
		await key('ArrowRight');
		expect(one.getAttribute('aria-selected')).toBe('true');
		expect(document.activeElement).toBe(one);
		expect(three.getAttribute('aria-selected')).toBe('false');

		await key('ArrowLeft');
		expect(document.activeElement).toBe(two);

		unmount();
	});

	it('binds Home and End to the first and last enabled tab', async () => {
		const { tabs, key, unmount } = setup();
		const [one, two] = tabs as [HTMLElement, HTMLElement];
		one.focus();

		await key('End');
		expect(document.activeElement).toBe(two);

		await key('Home');
		expect(document.activeElement).toBe(one);

		unmount();
	});

	it('keeps a roving tabindex so the tablist is one tab stop', async () => {
		const { tabs, key, unmount } = setup();
		const [one, two] = tabs as [HTMLElement, HTMLElement];

		expect(one.tabIndex).toBe(0);
		expect(two.tabIndex).toBe(-1);

		one.focus();
		await key('ArrowRight');
		expect(one.tabIndex).toBe(-1);
		expect(two.tabIndex).toBe(0);

		unmount();
	});
});
