import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import InputTest from '$ixirjs/ui/test/components/input/input.test.svelte';
import Control from './input-control.svelte';
import NumberControl from './input-number-control.svelte';
import type { StateChangeContext } from '$ixirjs/ui/types';
import type { InputBond } from './bond.svelte';

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

	it('keeps native input callbacks event-only and reports committed semantic values', async () => {
		const nativeInput = vi.fn((event: Event) => event);
		const committed: boolean[] = [];
		const semanticInput = vi.fn(
			(value: unknown, { bond, event }: StateChangeContext<InputBond>) => {
				committed.push(bond?.value.get() === value);
				expect(event).toBeInstanceOf(Event);
			}
		);

		render(InputTest, {
			value: '',
			oninput: nativeInput,
			onvaluechange: semanticInput
		});

		await page.getByPlaceholder('field').fill('hello');

		expect(nativeInput).toHaveBeenCalled();
		expect(nativeInput.mock.calls.every((args) => args.length === 1)).toBe(true);
		expect(semanticInput).toHaveBeenLastCalledWith(
			'hello',
			expect.objectContaining({
				event: nativeInput.mock.calls.at(-1)?.[0],
				reason: 'input'
			})
		);
		expect(committed.length).toBeGreaterThan(0);
		expect(committed.every(Boolean)).toBe(true);
	});

	it('commits and reports a cleared number without fabricating an event', async () => {
		const onnumberchange = vi.fn();
		const rawValues: string[] = [];
		render(NumberControl, {
			number: 5,
			onnumberchange,
			oninput: (event) => rawValues.push((event.currentTarget as HTMLInputElement).value)
		});

		await page.getByRole('spinbutton').fill('');

		expect(rawValues).toEqual(['']);
		expect(onnumberchange).toHaveBeenLastCalledWith(
			undefined,
			expect.objectContaining({ event: expect.any(Event), reason: 'clear' })
		);
	});

	it('keeps Input.Control usable without Input.Root', async () => {
		render(Control, { placeholder: 'standalone' });

		await expect
			.element(page.getByPlaceholder('standalone'))
			.toHaveAttribute('data-kind', 'input-control');
	});
});
