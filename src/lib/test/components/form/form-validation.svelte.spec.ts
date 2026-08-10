import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import { z } from 'zod';
import Probe from './form-validation.test.svelte';
import type { FormBond } from '$ixirjs/ui/components/form/bond.svelte';

const schema = z.object({
	email: z.string().email('Enter a valid email.'),
	address: z.object({ street: z.string().min(1, 'Street is required.') })
});

async function mount(props: Record<string, unknown> = {}) {
	const { container, component } = render(Probe, props);
	// Fields register from a mount effect, so the collection is only populated after a tick.
	await tick();
	const bond = (component as unknown as { getBond(): FormBond }).getBond();
	const query = <T extends Element = HTMLElement>(testid: string) =>
		container.querySelector<T>(`[data-testid="${testid}"]`);
	return { container, bond, query };
}

/** The blur seam the field family did not have before. */
async function blur(node: Element | null) {
	node?.dispatchEvent(new FocusEvent('blur', { bubbles: false }));
	await tick();
}

describe('form validation routing', () => {
	it('routes a schema issue to the field whose name matches its path', async () => {
		const { bond, query } = await mount({ schema, email: 'nope', street: '' });

		await bond.validate();
		await tick();

		expect(bond.isValid).toBe(false);
		expect(bond.errorsFor('email').map((e) => e.message)).toEqual(['Enter a valid email.']);
		expect(bond.errorsFor('address.street').map((e) => e.message)).toEqual(['Street is required.']);
		expect(query('email-error')?.textContent).toContain('Enter a valid email.');
		expect(query('street-error')?.textContent).toContain('Street is required.');
	});

	it('builds nested values from field names', async () => {
		const { bond } = await mount({ email: 'a@b.co', street: '12 Rue' });
		expect(bond.values).toEqual({ email: 'a@b.co', address: { street: '12 Rue' } });
	});

	it('clears the error once the value is fixed', async () => {
		const { bond, query } = await mount({ schema, email: 'nope', street: '12 Rue' });

		await bond.validate();
		await tick();
		expect(query('email-error')).not.toBeNull();

		bond.fields[0]!.props.value = 'ada@example.com';
		await bond.validate();
		await tick();

		expect(bond.errorsFor('email')).toEqual([]);
		expect(query('email-error')).toBeNull();
	});

	it('reports valid when every field passes', async () => {
		const { bond } = await mount({ schema, email: 'ada@example.com', street: '12 Rue' });
		await bond.validate();
		expect(bond.isValid).toBe(true);
	});
});

describe('trigger modes', () => {
	it("shows nothing before interaction and validates on blur in the default 'touched' mode", async () => {
		const { bond, query } = await mount({ schema, email: 'nope' });

		expect(bond.isTouched).toBe(false);
		expect(query('email-error')).toBeNull();

		await blur(query('email'));

		expect(bond.fields[0]!.isTouched).toBe(true);
		expect(query('email-error')).not.toBeNull();
	});

	it("does not validate on blur in 'submit' mode", async () => {
		const { bond, query } = await mount({ schema, mode: 'submit', email: 'nope' });

		await blur(query('email'));

		expect(bond.fields[0]!.isTouched).toBe(true);
		expect(query('email-error')).toBeNull();
	});

	it("never validates in 'manual' mode, not even on submit", async () => {
		const { bond, query } = await mount({ schema, mode: 'manual', email: 'nope' });

		await blur(query('email'));
		expect(bond.fields[0]!.shouldValidateOn('submit')).toBe(false);
		expect(query('email-error')).toBeNull();
	});

	it("re-validates on input only once touched, under 'touched'", async () => {
		const { bond } = await mount({ schema, email: 'nope' });
		const field = bond.fields[0]!;

		expect(field.shouldValidateOn('input')).toBe(false);
		field.markTouched();
		expect(field.shouldValidateOn('input')).toBe(true);
	});

	it("re-validates on every input under 'input', before any interaction", async () => {
		const { bond } = await mount({ schema, mode: 'input' });
		expect(bond.fields[0]!.shouldValidateOn('input')).toBe(true);
	});

	it('tracks dirty independently of touched', async () => {
		const { bond } = await mount({ email: 'start' });
		const field = bond.fields[0]!;

		expect(field.isDirty).toBe(false);
		field.props.value = 'changed';
		expect(field.isDirty).toBe(true);
		expect(field.isTouched).toBe(false);
	});
});

describe('submit', () => {
	it('validates on submit and marks every field touched, without preventing default', async () => {
		const { bond, query } = await mount({ schema, email: 'nope' });
		const event = new SubmitEvent('submit', { bubbles: true, cancelable: true });

		query('submit')?.closest('form')?.dispatchEvent(event);
		await tick();

		expect(bond.isSubmitted).toBe(true);
		expect(bond.fields.every((field) => field.isTouched)).toBe(true);
		expect(bond.isValid).toBe(false);
		// The chosen default: errors are populated but the browser still submits.
		expect(event.defaultPrevented).toBe(false);
	});

	it('prevents an invalid submit only when asked to', async () => {
		const { query } = await mount({ schema, email: 'nope', blockInvalidSubmit: true });
		const event = new SubmitEvent('submit', { bubbles: true, cancelable: true });

		query('submit')?.closest('form')?.dispatchEvent(event);
		await tick();

		expect(event.defaultPrevented).toBe(true);
	});

	it('lets a valid submit through even with blockInvalidSubmit set', async () => {
		const { query } = await mount({
			schema,
			email: 'ada@example.com',
			street: '12 Rue',
			blockInvalidSubmit: true
		});
		const event = new SubmitEvent('submit', { bubbles: true, cancelable: true });

		query('submit')?.closest('form')?.dispatchEvent(event);
		await tick();

		expect(event.defaultPrevented).toBe(false);
	});
});

describe('externally owned errors', () => {
	it('routes a pushed error bag to the matching fields', async () => {
		const { bond, query } = await mount({
			errors: { email: ['Already taken.'], address: { street: ['Required.'] } }
		});
		await tick();

		expect(bond.errorsFor('email').map((e) => e.message)).toEqual(['Already taken.']);
		expect(query('email-error')?.textContent).toContain('Already taken.');
		expect(query('street-error')?.textContent).toContain('Required.');
	});

	it('accepts the flat bag shape too', async () => {
		const { query } = await mount({ errors: { 'address.street': ['Required.'] } });
		await tick();
		expect(query('street-error')?.textContent).toContain('Required.');
	});

	it('defers to a source that owns the values', async () => {
		const { bond } = await mount({
			source: { values: { email: 'owned@example.com' }, errors: [] },
			email: 'ignored'
		});
		expect(bond.values).toEqual({ email: 'owned@example.com' });
	});

	it('surfaces a source that drives submission itself', async () => {
		const { bond } = await mount({ source: { errors: [], isSubmitting: true } });
		expect(bond.isSubmitting).toBe(true);
	});

	it('projects a pushed error onto the control aria, not just the error node', async () => {
		const { bond, query } = await mount({ errors: { email: ['Already taken.'] } });
		await tick();

		// The merged VALIDATION surface is what makes this true — the field's own model never ran.
		expect(bond.fields[0]!.isInvalid).toBe(true);
		expect(query('email')?.getAttribute('aria-invalid')).toBe('true');
	});
});

describe('lifecycle', () => {
	it('reports the aggregate through onvalidate on submit', async () => {
		const seen: { valid: boolean; errors: number; values: unknown }[] = [];
		const { query } = await mount({
			schema,
			email: 'nope',
			onvalidate: (d: { valid: boolean; errors: readonly unknown[]; values: unknown }) =>
				seen.push({ valid: d.valid, errors: d.errors.length, values: d.values })
		});

		query('submit')
			?.closest('form')
			?.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
		await tick();

		expect(seen).toHaveLength(1);
		expect(seen[0]!.valid).toBe(false);
		expect(seen[0]!.errors).toBeGreaterThan(0);
		expect(seen[0]!.values).toEqual({ email: 'nope', address: { street: '' } });
	});

	it('clear() drops errors but keeps interaction state; reset() drops both', async () => {
		const { bond, query } = await mount({ schema, email: 'nope' });

		await blur(query('email'));
		expect(bond.isInvalid).toBe(true);
		expect(bond.isTouched).toBe(true);

		bond.clear();
		expect(bond.isInvalid).toBe(false);
		expect(bond.isTouched).toBe(true);

		await bond.validate();
		bond.reset();
		expect(bond.isInvalid).toBe(false);
		expect(bond.isTouched).toBe(false);
		expect(bond.isSubmitted).toBe(false);
	});

	it('a single field blur re-runs the form-level source without validating its siblings', async () => {
		const { bond, query } = await mount({ schema, email: 'nope', street: '' });

		// Blurring email routes the form schema's `address.street` issue too — that is `validateSelf`,
		// which is the whole point of not fanning out to every sibling on one field's blur.
		await blur(query('email'));

		expect(bond.errorsFor('email')).toHaveLength(1);
		expect(bond.errorsFor('address.street')).toHaveLength(1);
		// The sibling never ran its own validation, so it has no errors of its own.
		expect(bond.fields[1]!.ownErrors).toEqual([]);
		expect(bond.fields[1]!.isTouched).toBe(false);
	});
});
