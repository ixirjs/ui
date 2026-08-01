import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import InputPresetTest from '$ixirjs/ui/test/components/input/input-preset.test.svelte';

describe('input presentation seam', () => {
	it('applies reactive classes, attrs, defaults, and ordinary variant attrs', async () => {
		render(InputPresetTest);
		const control = page.getByTestId('control').getByRole('textbox');

		await expect.element(control).toHaveAttribute('data-theme', 'calm');
		await expect.element(control).toHaveAttribute('data-tone', 'calm');
		await expect.element(control).toHaveAttribute('aria-label', 'calm input');
		await expect.element(control).toHaveAttribute('data-disabled-variant', 'yes');
		await expect.element(control).toHaveClass(/theme-calm/);
		await expect.element(control).toHaveClass(/tone-calm/);
		await expect.element(control).toHaveClass(/consumer/);

		await page.getByTestId('toggle').click();
		await expect.element(control).toHaveAttribute('data-theme', 'active');
		await expect.element(control).toHaveAttribute('data-tone', 'active');
		await expect.element(control).toHaveAttribute('aria-label', 'active input');
		await expect.element(control).toHaveClass(/theme-active/);
		await expect.element(control).toHaveClass(/tone-active/);
	});
});
