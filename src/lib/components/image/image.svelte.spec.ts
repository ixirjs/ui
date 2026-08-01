import { page } from '@vitest/browser/context';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import ImageTest from '$ixirjs/ui/test/components/image/image.test.svelte';

describe('Image', () => {
	it('reveals fallback children after the image fails', async () => {
		render(ImageTest);
		const image = document.querySelector('img[alt="Example image"]');

		expect(image).not.toBeNull();
		expect(page.getByText('Fallback content').query()).toBeNull();

		image?.dispatchEvent(new Event('error'));

		await expect.element(page.getByTestId('image')).toHaveClass(/bg-foreground\/5/);
		await expect.element(page.getByText('Fallback content')).toBeInTheDocument();
	});
});
