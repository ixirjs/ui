import { page } from '@vitest/browser/context';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import CheckboxCallbackTest from '$ixirjs/ui/test/components/checkbox/checkbox-callback.test.svelte';

describe('Checkbox callbacks', () => {
	it('separates native events from the committed checked-state callback', async () => {
		const oninput = vi.fn();
		const onchange = vi.fn();
		const oncheckedchange = vi.fn();
		render(CheckboxCallbackTest, { oninput, onchange, oncheckedchange });

		expect(oncheckedchange).not.toHaveBeenCalled();

		document.querySelector<HTMLElement>('[role="checkbox"]')!.click();

		const inputEvent = oninput.mock.calls[0]?.[0];
		const changeEvent = onchange.mock.calls[0]?.[0];
		expect(inputEvent).toBeInstanceOf(Event);
		expect(inputEvent).not.toBeInstanceOf(CustomEvent);
		expect(changeEvent).toBeInstanceOf(Event);
		expect(oninput.mock.calls[0]).toEqual([inputEvent]);
		expect(onchange.mock.calls[0]).toEqual([changeEvent]);
		expect(oncheckedchange).toHaveBeenCalledOnce();
		expect(oncheckedchange).toHaveBeenCalledWith(true, { event: inputEvent });
		await expect.element(page.getByTestId('checkbox-value')).toHaveTextContent('true');
		await expect.element(page.getByTestId('checkbox-committed')).toHaveTextContent('true');

		document.querySelector<HTMLElement>('[role="checkbox"]')!.click();
		const secondInputEvent = oninput.mock.calls[1]?.[0];
		expect(oncheckedchange).toHaveBeenCalledTimes(2);
		expect(oncheckedchange).toHaveBeenLastCalledWith(false, { event: secondInputEvent });
		expect(oninput.mock.calls[1]).toEqual([secondInputEvent]);
		expect(onchange.mock.calls[1]).toHaveLength(1);
		await expect.element(page.getByTestId('checkbox-value')).toHaveTextContent('false');
		await expect.element(page.getByTestId('checkbox-committed')).toHaveTextContent('true,true');
	});
});
