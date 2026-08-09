import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import Probe from '$ixirjs/ui/test/components/accordion/accordion-keyboard.test.svelte';

// APG accordion: arrows and Home/End move focus between headers and nothing else — no automatic
// activation, so the panels stay exactly as the user left them.
describe('Accordion keyboard navigation', () => {
	const setup = () => {
		const { container, unmount } = render(Probe);
		const headers = [...container.querySelectorAll<HTMLElement>('[aria-selected]')];
		const key = async (key: string) => {
			(document.activeElement ?? headers[0]!).dispatchEvent(
				new KeyboardEvent('keydown', { key, bubbles: true })
			);
			await tick();
		};
		return { headers, key, unmount };
	};

	it('moves focus with the arrow keys, skipping disabled headers', async () => {
		const { headers, key, unmount } = setup();
		const [one, two] = headers as [HTMLElement, HTMLElement];
		one.focus();

		await key('ArrowDown');
		expect(document.activeElement).toBe(two);

		// Wraps past `three` (disabled) back to `one`.
		await key('ArrowDown');
		expect(document.activeElement).toBe(one);

		await key('ArrowUp');
		expect(document.activeElement).toBe(two);

		unmount();
	});

	it('binds Home and End to the first and last enabled header', async () => {
		const { headers, key, unmount } = setup();
		const [one, two] = headers as [HTMLElement, HTMLElement];
		one.focus();

		await key('End');
		expect(document.activeElement).toBe(two);

		await key('Home');
		expect(document.activeElement).toBe(one);

		unmount();
	});

	it('does not open a panel while navigating', async () => {
		const { headers, key, unmount } = setup();
		const [, two] = headers as [HTMLElement, HTMLElement];
		headers[0]!.focus();

		await key('ArrowDown');
		expect(two.getAttribute('aria-expanded')).toBe('false');

		unmount();
	});

	it('keeps one tabbable header while every panel is closed', async () => {
		const { headers, key, unmount } = setup();
		const [one, two] = headers as [HTMLElement, HTMLElement];

		expect(one.tabIndex).toBe(0);
		expect(two.tabIndex).toBe(-1);

		one.focus();
		await key('ArrowDown');
		expect(one.tabIndex).toBe(-1);
		expect(two.tabIndex).toBe(0);

		unmount();
	});
});
