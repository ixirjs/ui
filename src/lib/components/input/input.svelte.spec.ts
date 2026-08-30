import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import { tick } from 'svelte';
import InputTest from '$ixirjs/ui/test/components/input/input.test.svelte';
import Control from './input-control.svelte';
import PhoneControl from './input-phone-control.svelte';
import CurrencyControl from './input-currency-control.svelte';
import NumberControl from './input-number-control.svelte';
import PinControl from './input-pin-control.svelte';
import TextControl from './input-text-control.svelte';
import PasswordControl from './input-password-control.svelte';
import TimeControl from './time/time-control.svelte';
import ColorControl from './color/color-control.svelte';
import FileControl from './input-file-control.svelte';
import LocationTest from '$ixirjs/ui/test/components/input/input-location.test.svelte';
import TypedTest from '$ixirjs/ui/test/components/input/input-typed.test.svelte';
import FilePlaceholderTest from '$ixirjs/ui/test/components/input/input-file-placeholder.test.svelte';
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
		const onvaluechange = vi.fn();
		render(Control, { placeholder: 'standalone', onvaluechange });

		const field = page.getByPlaceholder('standalone');
		await expect.element(field).toBeInTheDocument();
		// No root, no identity: a bare control carries no generated id.
		await expect.element(field).not.toHaveAttribute('id');

		await field.fill('typed');

		await expect.element(field).toHaveValue('typed');
		expect(onvaluechange).toHaveBeenLastCalledWith(
			'typed',
			expect.objectContaining({ reason: 'input' })
		);
	});
});

// The control atom used to override `attrs` with `role: 'group'`, which lands on the native
// <input> through `part.atom.spread` and overrides its implicit `textbox` role.
describe('Input — the native control keeps its implicit role', () => {
	it('renders no role attribute and stays reachable as a textbox', async () => {
		render(InputTest, { value: '' });

		const control = page.getByPlaceholder('field');
		await expect.element(control).not.toHaveAttribute('role');
		await expect.element(page.getByRole('textbox')).toBeInTheDocument();
	});
});

// Both getters resolve the control through `nodeByPart('input')`, so they only answer once a
// control registers an Atom. Every typed control used to skip that, leaving these dead.
describe('Input — typed controls reach bond.number and bond.date', () => {
	it('reports a number typed into Input.NumberControl', async () => {
		render(TypedTest, { kind: 'number' });

		await page.getByPlaceholder('amount').fill('42');

		await expect.element(page.getByTestId('number')).toHaveTextContent('42');
	});

	it('reports a date built in Input.DateControl', async () => {
		render(TypedTest, { kind: 'date' });

		// The segments are contenteditable spinbuttons driven entirely from `keydown` — `fill()`
		// has nothing to write to, so type the digits the way a user would.
		const segments = document.querySelectorAll<HTMLElement>('[role="spinbutton"]');
		// Date-only: MM / DD / YYYY and nothing else. Input.DateControl used to be a bare re-export
		// of the datetime control, so it rendered five segments unless you passed mode="date".
		expect(segments).toHaveLength(3);
		const type = (segment: HTMLElement, digits: string) => {
			for (const key of digits) {
				segment.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
			}
		};

		type(segments[0]!, '02');
		type(segments[1]!, '09');
		type(segments[2]!, '2026');

		await expect.element(page.getByTestId('date')).toHaveTextContent('2026-02-09');
	});
});

describe('Input.LocationControl — rendered through SegmentedField', () => {
	it('shows the bound value and derives lat/lng from typing', async () => {
		render(LocationTest, { value: '' });

		const field = page.getByPlaceholder('coords');
		await field.fill('40.7128, -74.006');

		await expect.element(page.getByTestId('lat')).toHaveTextContent('40.7128');
		await expect.element(page.getByTestId('lng')).toHaveTextContent('-74.006');
	});

	it('formats external coordinate writes back into the raw value', async () => {
		const { rerender } = render(LocationTest, { value: '' });

		await rerender({ value: '', lat: 51.5, lng: -0.12 });

		await expect.element(page.getByPlaceholder('coords')).toHaveValue('51.5, -0.12');
	});
});

describe('Input.Placeholder — file controls report through props.files', () => {
	it('hides once files are present, and comes back when they are cleared', async () => {
		const { rerender } = render(FilePlaceholderTest, { files: [] });

		await expect.element(page.getByText('choose something')).toBeInTheDocument();

		await rerender({ files: [new File(['x'], 'fixture.txt', { type: 'text/plain' })] });
		expect(document.body.textContent).not.toContain('choose something');

		await rerender({ files: [] });
		await expect.element(page.getByText('choose something')).toBeInTheDocument();
	});
});

describe('Input.FileControl — rest props land on the form control only', () => {
	it('puts a consumer attribute on exactly one element', async () => {
		render(FileControl, { 'data-probe': 'x' } as Record<string, unknown>);

		await expect.element(page.getByRole('button')).toBeInTheDocument();
		expect(document.querySelectorAll('[data-probe="x"]')).toHaveLength(1);
		expect(document.querySelector('[data-probe="x"]')).toBeInstanceOf(HTMLInputElement);
	});
});

// The colour overlay behind the transparent <input> is shared by the segmented, phone and currency
// controls (segment-overlay.svelte). It is aria-hidden, so it is read off the DOM directly.
describe('Input — the shared colour overlay', () => {
	function overlayText() {
		return document.querySelector('[aria-hidden="true"]')?.textContent ?? '';
	}

	it("renders the phone control's mask, with unfilled slots as underscores", async () => {
		render(PhoneControl, { value: '15551234', format: '+# (###) ###-####' });

		await expect.poll(overlayText).toBe('+1 (555) 123-4___');
	});

	it("renders the currency control's formatted amount while blurred", async () => {
		render(CurrencyControl, { value: '1234.5', currency: 'USD', locale: 'en-US' });

		await expect.poll(overlayText).toBe('$1,234.50');
	});
});

// Text and password controls wrote `value` twice: once from `bind:value` and once from
// `handleInput`. The two agreed, so nothing was visibly wrong — but only one of them reports the
// semantic callback, and this pins that path as the one that runs.
// One real input carries the whole pin; the cells are aria-hidden decoration. Editing therefore
// goes through the native field, which is what buys autofill, password managers and paste.
describe('Input.PinControl — the single field owns the value', () => {
	function field() {
		return page.getByRole('textbox', { name: 'One-time password' });
	}

	it('commits typed characters through the semantic callback', async () => {
		const onvaluechange = vi.fn();
		render(PinControl, { value: '', length: 4, onvaluechange });

		await field().fill('7');

		expect(onvaluechange).toHaveBeenLastCalledWith(
			'7',
			expect.objectContaining({ reason: 'input' })
		);
	});

	it('renders exactly one form control, not one per digit', async () => {
		render(PinControl, { value: '', length: 6 });

		expect(document.querySelectorAll('input')).toHaveLength(1);
		await expect.element(field()).toHaveAttribute('autocomplete', 'one-time-code');
		// No maxlength: it would count rejected characters against the cap. See sanitize().
		await expect.element(field()).not.toHaveAttribute('maxlength');
	});

	it('drops characters the pin type disallows and stops at length', async () => {
		render(PinControl, { value: '', length: 4, type: 'numeric' as const });

		await field().fill('12a3456');

		await expect.element(field()).toHaveValue('1234');
	});

	it('upper-cases alphanumeric pins', async () => {
		render(PinControl, { value: '', length: 4, type: 'alphanumeric' as const });

		await field().fill('ab1c');

		await expect.element(field()).toHaveValue('AB1C');
	});

	it('paints one cell per slot, showing the placeholder while empty', async () => {
		render(PinControl, { value: '12', length: 4, placeholder: '·' });

		const cells = [...document.querySelectorAll('[aria-hidden="true"][data-filled]')];
		expect(cells).toHaveLength(4);
		expect(cells.map((c) => c.textContent?.trim())).toEqual(['1', '2', '·', '·']);
	});

	it('fires oncomplete once when the last slot fills', async () => {
		const oncomplete = vi.fn();
		render(PinControl, { value: '', length: 3, oncomplete });

		await field().fill('12');
		expect(oncomplete).not.toHaveBeenCalled();

		await field().fill('123');
		expect(oncomplete).toHaveBeenCalledExactlyOnceWith('123');
	});
});

describe('Input — parsed projections', () => {
	it('formats an external currency amount into the raw value', async () => {
		const { rerender } = render(CurrencyControl, { value: '', amount: undefined });

		await rerender({ value: '', amount: 42.5 });

		await expect
			.poll(() => document.querySelector('[aria-hidden="true"]')?.textContent)
			.toBe('$42.50');
	});

	it('gives a simultaneously changed raw value precedence over its parsed projection', async () => {
		const { rerender } = render(CurrencyControl, { value: '', amount: undefined });

		await rerender({ value: '10', amount: 42.5 });

		await expect
			.poll(() => document.querySelector('[aria-hidden="true"]')?.textContent)
			.toBe('$10.00');
	});

	it('formats an external Date into time segments', async () => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const date = new Date(2026, 0, 1, 13, 45);
		render(TimeControl, { value: '', date });
		const segments = document.querySelectorAll<HTMLElement>('[role="spinbutton"]');

		await expect.poll(() => segments[0]?.textContent).toBe('13');
		await expect.poll(() => segments[1]?.textContent).toBe('45');
	});

	it('crosses the 12-hour AM/PM boundary when stepping hours', async () => {
		const onvaluechange = vi.fn();
		render(TimeControl, { value: '11:59', hourFormat: 12, onvaluechange });
		const hour = document.querySelector<HTMLElement>('[role="spinbutton"]')!;

		hour.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));

		expect(onvaluechange).toHaveBeenLastCalledWith(
			'12:59',
			expect.objectContaining({ reason: 'input' })
		);
		await expect.element(page.getByText('PM')).toBeInTheDocument();
	});
});

describe('Input.TextControl — handleInput is the sole writer of value', () => {
	it('reports typed text through the semantic callback and back onto the element', async () => {
		const onvaluechange = vi.fn();
		render(TextControl, { value: '', placeholder: 'field', onvaluechange });

		await page.getByPlaceholder('field').fill('typed');

		expect(onvaluechange).toHaveBeenLastCalledWith(
			'typed',
			expect.objectContaining({ reason: 'input' })
		);
		await expect.element(page.getByPlaceholder('field')).toHaveValue('typed');
	});
});

// Segments declare role="spinbutton", so they owe the full value contract; the segment groups owe
// a name, or a screen reader hears a row of unlabelled spinbuttons.
describe('Input — segmented controls satisfy the spinbutton contract', () => {
	it('exposes value bounds on every colour segment', async () => {
		render(ColorControl, { value: 'rgb(10 20 30)', format: 'rgb' as const });

		const segments = document.querySelectorAll('[role="spinbutton"]');
		expect(segments.length).toBeGreaterThan(0);
		for (const seg of segments) {
			expect(seg).toHaveAttribute('aria-valuemin');
			expect(seg).toHaveAttribute('aria-valuemax');
			expect(seg).toHaveAttribute('aria-valuenow');
		}
	});

	it('names the colour segment group', async () => {
		render(ColorControl, { value: 'rgb(10 20 30)', format: 'rgb' as const });

		await expect.element(page.getByRole('group', { name: 'Color' })).toBeInTheDocument();
	});

	it('names the time segment group', async () => {
		render(TimeControl, { value: '10:30' });

		await expect.element(page.getByRole('group', { name: 'Time' })).toBeInTheDocument();
	});
});

// aria-value* on a native number input duplicates min/max/value and is invalid on its implicit
// role; the element already answers for itself.
describe('Input.NumberControl — leaves the native value semantics alone', () => {
	it('renders min, max and value without a redundant aria-value* triple', async () => {
		render(NumberControl, { number: 5, min: 0, max: 10, placeholder: 'amount' });

		const control = page.getByPlaceholder('amount');
		await expect.element(control).toHaveAttribute('min', '0');
		await expect.element(control).not.toHaveAttribute('aria-valuenow');
		await expect.element(control).not.toHaveAttribute('aria-valuemin');
	});
});

// The placeholder is a visual stand-in painted over the control, which already carries the name.
describe('Input.Placeholder — is hidden from assistive technology', () => {
	it('marks the overlay aria-hidden', async () => {
		render(FilePlaceholderTest, { files: [] });

		const overlay = [...document.querySelectorAll('[aria-hidden="true"]')].find((el) =>
			el.textContent?.includes('choose something')
		);
		expect(overlay).toBeTruthy();
	});
});

// Segmented and multi-slot controls render spans or one input per digit, so a `name` on their
// wrapper submits nothing. Each now emits a hidden input, and the assertion is the one that
// matters: the value shows up in FormData.
describe('Input — composite controls participate in a plain form', () => {
	function submitted(node: Element, name: string) {
		const form = document.createElement('form');
		node.parentElement!.insertBefore(form, node);
		form.appendChild(node);
		return new FormData(form).get(name);
	}

	it('submits the time control value', async () => {
		render(TimeControl, { value: '10:30', name: 'start' });
		await tick();

		expect(submitted(document.querySelector('[role="group"]')!.parentElement!, 'start')).toBe(
			'10:30'
		);
	});

	it('submits the colour control value', async () => {
		render(ColorControl, { value: 'rgb(10 20 30)', format: 'rgb' as const, name: 'tint' });
		await tick();

		expect(document.querySelector('input[type="hidden"][name="tint"]')).toHaveValue(
			'rgb(10 20 30)'
		);
	});

	// The pin's own input is a real named control, so it needs no hidden shim of its own.
	it('submits the pin as one field, not one per digit', async () => {
		render(PinControl, { value: '123456', name: 'code' });
		await tick();

		const named = document.querySelectorAll('[name="code"]');
		expect(named).toHaveLength(1);
		expect(named[0]).toHaveValue('123456');
		expect(document.querySelector('input[type="hidden"]')).toBeNull();
	});

	it('renders no hidden input when the control has no name', async () => {
		render(TimeControl, { value: '10:30' });
		await tick();

		expect(document.querySelector('input[type="hidden"]')).toBeNull();
	});
});

describe('Input.PasswordControl — visibility toggle', () => {
	function toggle() {
		return page.getByRole('button', { name: /password/i });
	}

	it('swaps the input type and the toggle label, and reports the change', async () => {
		const onvisiblechange = vi.fn();
		render(PasswordControl, { value: 'hunter2', placeholder: 'secret', onvisiblechange });

		const field = page.getByPlaceholder('secret');
		await expect.element(field).toHaveAttribute('type', 'password');
		await expect.element(toggle()).toHaveAccessibleName('Show password');

		await toggle().click();

		await expect.element(field).toHaveAttribute('type', 'text');
		await expect.element(toggle()).toHaveAccessibleName('Hide password');
		// The value rides along in the callback details, so a consumer need not re-read it.
		expect(onvisiblechange).toHaveBeenLastCalledWith(
			true,
			expect.objectContaining({ reason: 'toggle', value: 'hunter2' })
		);
	});

	it('stays hidden and reports nothing while disabled', async () => {
		const onvisiblechange = vi.fn();
		render(PasswordControl, {
			value: 'hunter2',
			placeholder: 'secret',
			disabled: true,
			onvisiblechange
		});

		await expect.element(toggle()).toBeDisabled();
		await expect.element(page.getByPlaceholder('secret')).toHaveAttribute('type', 'password');
		expect(onvisiblechange).not.toHaveBeenCalled();
	});
});

describe('Input.NumberControl — steppers', () => {
	const inc = () => page.getByRole('button', { name: 'Increment' });
	const dec = () => page.getByRole('button', { name: 'Decrement' });

	it('steps by `step` and reports the direction as the reason', async () => {
		const onnumberchange = vi.fn();
		render(NumberControl, { number: 5, step: 0.5, placeholder: 'amount', onnumberchange });

		await inc().click();

		expect(onnumberchange).toHaveBeenLastCalledWith(
			5.5,
			expect.objectContaining({ reason: 'increment' })
		);

		await dec().click();

		expect(onnumberchange).toHaveBeenLastCalledWith(
			5,
			expect.objectContaining({ reason: 'decrement' })
		);
	});

	// Floats are stepped through toPrecision(10), so 0.1 + 0.2 does not surface as
	// 0.30000000000000004.
	it('does not leak binary floating point into the stepped value', async () => {
		const onnumberchange = vi.fn();
		render(NumberControl, { number: 0.1, step: 0.2, onnumberchange });

		await inc().click();

		expect(onnumberchange).toHaveBeenLastCalledWith(0.3, expect.anything());
	});

	it('disables each button at its own bound', async () => {
		render(NumberControl, { number: 10, min: 0, max: 10, step: 1 });

		await expect.element(inc()).toBeDisabled();
		await expect.element(dec()).toBeEnabled();
	});

	it('disables both buttons when the control is disabled', async () => {
		render(NumberControl, { number: 5, disabled: true });

		await expect.element(inc()).toBeDisabled();
		await expect.element(dec()).toBeDisabled();
	});
});

describe('Input.FileControl — clearing a selection', () => {
	it('empties the list, resets the native input, and reports the clear', async () => {
		const onfileschange = vi.fn();
		render(FileControl, {
			files: [new File(['x'], 'fixture.txt', { type: 'text/plain' })],
			onfileschange
		});

		// `exact`: the clear button is nested inside the trigger button, so a loose name match
		// resolves both. See the note on nested buttons in input-file-control.svelte.
		await page.getByRole('button', { name: 'Clear file selection', exact: true }).click();

		expect(onfileschange).toHaveBeenLastCalledWith(
			[],
			expect.objectContaining({ reason: 'clear' })
		);
		expect(document.querySelector<HTMLInputElement>('input[type="file"]')?.value).toBe('');
		expect(document.body.textContent).not.toContain('fixture.txt');
	});
});
