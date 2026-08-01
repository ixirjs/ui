import { page } from '@vitest/browser/context';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import Switch from './switch.svelte';

describe('Switch presentation', () => {
	it('applies a per-instance thumb layer without changing the root preset', () => {
		render(Switch, {
			presets: {
				thumb: { class: 'instance-thumb', attrs: { 'data-instance': 'thumb' } }
			}
		});

		const thumb = document.querySelector('.switch-thumb');
		expect(thumb).not.toBeNull();
		expect(thumb).toHaveClass('instance-thumb');
		expect(thumb).toHaveAttribute('data-instance', 'thumb');
	});
});

describe('Switch callbacks', () => {
	it('separates native events from the committed checked-state callback', async () => {
		const onclick = vi.fn();
		const oninput = vi.fn();
		const onchange = vi.fn();
		const oncheckedchange = vi.fn();
		render(Switch, { onclick, oninput, onchange, oncheckedchange });

		expect(oncheckedchange).not.toHaveBeenCalled();

		const control = page.getByRole('switch');
		await control.click();

		const clickEvent = onclick.mock.calls[0]?.[0];
		expect(clickEvent).toBeInstanceOf(MouseEvent);
		expect(onclick.mock.calls[0]).toHaveLength(1);
		expect(oncheckedchange).toHaveBeenCalledOnce();
		expect(oncheckedchange).toHaveBeenCalledWith(true, { event: clickEvent });
		await expect.element(control).toHaveAttribute('aria-checked', 'true');

		const element = document.querySelector<HTMLButtonElement>('[role="switch"]')!;
		const inputEvent = new Event('input', { bubbles: true });
		const changeEvent = new Event('change', { bubbles: true });
		element.dispatchEvent(inputEvent);
		element.dispatchEvent(changeEvent);

		expect(oninput.mock.calls[0]).toEqual([inputEvent]);
		expect(onchange.mock.calls[0]).toEqual([changeEvent]);
		expect(oncheckedchange).toHaveBeenCalledTimes(1);
	});
});
