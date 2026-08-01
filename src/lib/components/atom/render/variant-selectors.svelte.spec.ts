import { page } from '@vitest/browser/context';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import VariantSelectorsTest from '$ixirjs/ui/test/components/atom/variant-selectors.test.svelte';

/**
 * A variant selector is consumed presentation input, not DOM data. Before this was stripped,
 * `<Button variant="primary">` picked its class and *also* emitted `variant="primary"` onto the
 * element — invalid HTML on every family with variants.
 */
describe('variant selectors', () => {
	it('applies a selector without emitting it as an attribute', async () => {
		render(VariantSelectorsTest);
		const button = page.getByTestId('selectors');

		await expect.element(button).toHaveClass(/is-primary/);
		await expect.element(button).toHaveClass(/is-small/);
		// Declared only by a compound, so only the compound proves it was read.
		await expect.element(button).toHaveClass(/is-loud/);

		for (const consumed of ['variant', 'size', 'tone']) {
			expect(button.element().hasAttribute(consumed), `${consumed} leaked`).toBe(false);
		}
	});

	it('still publishes attributes a variant value declares', async () => {
		render(VariantSelectorsTest);
		// The selector is stripped from the consumer layer; what the variant itself sets is DOM data.
		await expect.element(page.getByTestId('selectors')).toHaveAttribute('data-variant', 'primary');
	});

	it('strips a selector declared by a local variants definition', async () => {
		render(VariantSelectorsTest);
		const local = page.getByTestId('local');

		await expect.element(local).toHaveClass(/is-high/);
		await expect.element(local).toHaveAttribute('lang', 'en');
		expect(local.element().hasAttribute('emphasis'), 'emphasis leaked').toBe(false);
	});

	it('claims nothing for a definition given as a bare function', async () => {
		render(VariantSelectorsTest);
		const opaque = page.getByTestId('opaque');

		// It computes its own props, so its selector keys are unknowable and must not be guessed at.
		await expect.element(opaque).toHaveClass(/is-opaque/);
		await expect.element(opaque).toHaveAttribute('emphasis', 'high');
	});

	it('leaves props no definition declares untouched', async () => {
		render(VariantSelectorsTest);
		await expect.element(page.getByTestId('selectors')).toHaveAttribute('title', 'Save');
		await expect.element(page.getByTestId('undeclared')).toHaveAttribute('role', 'link');
	});
});
