import { page } from '@vitest/browser/context';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import ButtonTest from '$ixirjs/ui/test/components/button/button.test.svelte';

describe('Button', () => {
	it('keeps the semantic type and consumer presentation props ahead of preset attrs', async () => {
		render(ButtonTest);

		const defaultButton = page.getByTestId('default');
		await expect.element(defaultButton).toHaveAttribute('type', 'button');
		await expect.element(defaultButton).toHaveAttribute('data-layer', 'consumer');
		await expect.element(defaultButton).toHaveClass(/preset-button/);
		await expect.element(defaultButton).toHaveClass(/consumer-button/);

		await expect.element(page.getByTestId('reset')).toHaveAttribute('type', 'reset');
	});
});
