import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import InputTest from './input-test.svelte';

// Input.Control routes its value through the bond's InputModel: writes via bond.value.set, reads via bond.value.get().
describe('Input — value flows through the InputModel', () => {
	it('displays the initial bound value', async () => {
		render(InputTest, { value: 'preset' });
		await expect.element(page.getByPlaceholder('field')).toHaveValue('preset');
	});

	it('writes typed text through the InputModel to the bond value', async () => {
		render(InputTest, { value: '' });

		await page.getByPlaceholder('field').fill('hello');

		// Control's own bindable…
		await expect.element(page.getByTestId('out')).toHaveTextContent('hello');
		// …and the bond's InputModel surface.
		await expect.element(page.getByTestId('model')).toHaveTextContent('hello');
	});
});
