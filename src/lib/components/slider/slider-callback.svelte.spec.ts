import { page } from '@vitest/browser/context';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import SliderCallbackTest from '$ixirjs/ui/test/components/slider/slider-callback.test.svelte';

describe('Slider callbacks', () => {
	it('reports committed values semantically while native handlers stay event-only', async () => {
		const oninput = vi.fn();
		const onchange = vi.fn();
		const onvaluechange = vi.fn();
		render(SliderCallbackTest, { oninput, onchange, onvaluechange });

		await expect.element(page.getByTestId('slider-value')).toHaveTextContent('100');
		expect(onvaluechange).not.toHaveBeenCalled();

		const input = document.querySelector<HTMLInputElement>('input[type="range"]')!;
		input.value = '25';
		const inputEvent = new InputEvent('input', { bubbles: true });
		input.dispatchEvent(inputEvent);

		expect(oninput.mock.calls[0]).toEqual([inputEvent]);
		expect(onvaluechange).toHaveBeenCalledOnce();
		expect(onvaluechange).toHaveBeenCalledWith(25, {
			event: inputEvent,
			percent: 25,
			min: 0,
			max: 100,
			step: 5,
			type: 'number'
		});
		await expect.element(page.getByTestId('slider-value')).toHaveTextContent('25');
		await expect.element(page.getByTestId('slider-committed')).toHaveTextContent('true');

		const changeEvent = new Event('change', { bubbles: true });
		input.dispatchEvent(changeEvent);

		expect(onchange.mock.calls[0]).toEqual([changeEvent]);
		expect(onvaluechange).toHaveBeenCalledTimes(1);

		document.querySelector<HTMLButtonElement>('[data-testid="slider-clamp"]')!.click();
		await expect.element(page.getByTestId('slider-value')).toHaveTextContent('20');
		expect(onvaluechange).toHaveBeenCalledTimes(2);
		expect(onvaluechange).toHaveBeenLastCalledWith(20, {
			percent: 100,
			min: 0,
			max: 20,
			step: 5,
			type: 'number'
		});
		await expect.element(page.getByTestId('slider-committed')).toHaveTextContent('true,true');
	});
});
