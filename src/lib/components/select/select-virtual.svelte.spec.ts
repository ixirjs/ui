import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SelectVirtualTest from '$ixirjs/ui/test/components/select/select-virtual.test.svelte';

async function nextFrame() {
	await new Promise((resolve) => requestAnimationFrame(resolve));
}

async function settleLayout() {
	await nextFrame();
	await nextFrame();
}

const options = () => Array.from(document.querySelectorAll<HTMLElement>('[data-testid="option"]'));
const values = () => options().map((option) => option.dataset.value);
const readout = (id: string) => document.querySelector(`[data-testid="${id}"]`)?.textContent;
const listbox = () => document.querySelector<HTMLElement>('[role="listbox"]')!;

/**
 * The gate for the data-backed Select: with 5000 options and a window of ~10, navigation, typeahead
 * and `aria-activedescendant` must work against options that were never mounted. Each case fails if
 * the Bond reads the item Collection instead of the data.
 *
 * The windowing is the consumer's own `createVirtual`, so this also exercises the documented
 * composition — the rune's viewport nested inside `Select.Content`, which is floating-ui's
 * positioned element and cannot be the scrollport.
 */
describe('Select over a data-backed option source, windowed with createVirtual', () => {
	it('renders a window, not the whole option list', async () => {
		render(SelectVirtualTest, { count: 5000 });
		await settleLayout();

		expect(options().length).toBeGreaterThan(0);
		expect(options().length).toBeLessThan(30);
		expect(values()).toContain('opt-0');
		expect(values()).not.toContain('opt-4999');
	});

	it('roves past the end of the rendered window', async () => {
		render(SelectVirtualTest, { count: 5000 });
		await settleLayout();

		const box = listbox();
		box.focus();
		// `last()` is the End key's destination — index 4999, far outside the window.
		box.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
		await settleLayout();

		expect(readout('active')).toBe('opt-4999');
	});

	it('keeps aria-activedescendant pointing at a mounted element', async () => {
		render(SelectVirtualTest, { count: 5000 });
		await settleLayout();

		const box = listbox();
		box.focus();
		box.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
		await settleLayout();

		const active = box.getAttribute('aria-activedescendant');
		expect(active).toBeTruthy();
		// The retained-pin rule exists so this lookup cannot come back null.
		expect(document.getElementById(active!)).toBeInstanceOf(HTMLElement);
	});

	it('resolves the label of a selected option that was never mounted', async () => {
		render(SelectVirtualTest, { count: 5000, selectTarget: 'opt-4000' });
		await settleLayout();
		expect(values()).not.toContain('opt-4000');

		document.querySelector<HTMLButtonElement>('[data-testid="select-far"]')!.click();
		await settleLayout();

		// The Collection holds only the window, so option 4000 has no Atom to read a label from —
		// without the data-backed path the trigger shows nothing.
		expect(readout('label')).toBe('Option-4000');
	});

	it('scrolls the viewport to follow the highlight past the window edge', async () => {
		render(SelectVirtualTest, { count: 5000 });
		await settleLayout();

		const scroller = document.querySelector<HTMLElement>('[data-testid="scroller"]')!;
		expect(scroller.scrollTop).toBe(0);

		const box = listbox();
		box.focus();
		box.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
		await settleLayout();
		await settleLayout();

		// Retention alone would leave option 0 on screen while 4999 is highlighted.
		expect(scroller.scrollTop).toBeGreaterThan(0);
		expect(readout('active')).toBe('opt-4999');
	});

	it('finds an option by typing that was never mounted', async () => {
		render(SelectVirtualTest, { count: 5000 });
		await settleLayout();

		const box = listbox();
		box.focus();
		// Far outside the window: typeahead has to search the data, not the DOM.
		// No space in the label: typeahead excludes it, since space selects in a listbox.
		for (const key of [...'Option-4321']) {
			box.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
		}
		await settleLayout();

		expect(readout('active')).toBe('opt-4321');
	});
});
