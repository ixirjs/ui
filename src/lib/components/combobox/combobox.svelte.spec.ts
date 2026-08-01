import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import ComboboxTest from './combobox-test.svelte';

// Regression: item click must commit a selection. The old combobox-item preventDefaulted the
// click and toggled a never-set controller; it now commits via bond.state.select/unselect.
describe('Combobox — item click commits a selection', () => {
	it('renders a chip after clicking an item (multi-select)', async () => {
		render(ComboboxTest, { multiple: true });

		await expect.element(page.getByTestId('chip')).not.toBeInTheDocument();

		await page.getByRole('option', { name: 'Rust' }).click();

		await expect.element(page.getByTestId('chip')).toHaveTextContent('Rust');
	});

	it('toggles the selection off when the selected item is clicked again', async () => {
		render(ComboboxTest, { multiple: true });
		const rust = page.getByRole('option', { name: 'Rust' });

		await rust.click();
		await expect.element(page.getByTestId('chip')).toHaveTextContent('Rust');

		await rust.click();
		await expect.element(page.getByTestId('chip')).not.toBeInTheDocument();
	});

	it('dismisses a selection when the chip close button is clicked', async () => {
		render(ComboboxTest, { multiple: true });

		await page.getByRole('option', { name: 'Rust' }).click();
		await expect.element(page.getByTestId('chip')).toHaveTextContent('Rust');

		// The chip's built-in close button (the only button on screen) removes the selection.
		await page.getByRole('button').click();
		await expect.element(page.getByTestId('chip')).not.toBeInTheDocument();
	});
});
