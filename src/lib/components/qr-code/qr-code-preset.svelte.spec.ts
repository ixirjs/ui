import { page } from '@vitest/browser/context';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import QRCodePresetTest from '$ixirjs/ui/test/components/qr-code/qr-code-preset.test.svelte';

describe('QRCode presentation seam', () => {
	it('applies reactive preset classes and attrs while preserving consumer classes', async () => {
		render(QRCodePresetTest);
		const qrCode = page.getByTestId('qr-code');

		await expect.element(qrCode).toHaveAttribute('data-preset-state', 'idle');
		await expect.element(qrCode).toHaveClass(/preset-idle/);
		await expect.element(qrCode).toHaveClass(/consumer-qr/);

		await page.getByTestId('toggle').click();
		await expect.element(qrCode).toHaveAttribute('data-preset-state', 'active');
		await expect.element(qrCode).toHaveClass(/preset-active/);
	});
});
