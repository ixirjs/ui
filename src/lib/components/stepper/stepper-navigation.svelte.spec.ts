import { page } from '@vitest/browser/context';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Fixture from '$ixirjs/ui/test/components/stepper/stepper-navigation.test.svelte';

describe('Stepper navigation', () => {
	it('renders the active step body after next navigation', async () => {
		render(Fixture);

		await expect.element(page.getByTestId('step-content')).toHaveTextContent('Step 1');
		await page.getByTestId('next').click();
		await expect.element(page.getByTestId('step-content')).toHaveTextContent('Step 2');
	});
});
