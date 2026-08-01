import { page } from '@vitest/browser/context';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import SwatchPresetTest from '$ixirjs/ui/test/components/swatch/swatch-preset.test.svelte';

describe('Swatch presentation seam', () => {
	it('preserves semantic color labeling while applying preset and consumer classes', async () => {
		render(SwatchPresetTest);
		const swatch = page.getByTestId('swatch');

		await expect.element(swatch).toHaveAttribute('role', 'img');
		await expect.element(swatch).toHaveAttribute('aria-label', 'Color: rebeccapurple');
		await expect.element(swatch).toHaveAttribute('title', 'rebeccapurple');
		await expect.element(swatch).toHaveAttribute('data-preset', 'swatch');
		await expect.element(swatch).toHaveClass(/preset-swatch/);
		await expect.element(swatch).toHaveClass(/consumer-swatch/);
	});
});
