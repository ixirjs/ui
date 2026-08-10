import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import Probe, {
	capturedField
} from '$ixirjs/ui/test/components/form/field/field-error.test.svelte';

// `Field.Error` exists so `aria-errormessage` points at the actual error text. It renders only
// while the field is invalid, which is what keeps that reference from dangling.
describe('Field.Error', () => {
	const setup = async (props: Record<string, unknown> = {}) => {
		const { unmount } = render(Probe, { value: '', ...props });
		await tick();
		return {
			unmount,
			field: capturedField!,
			control: () => document.querySelector('[data-testid="probe-control"]')!,
			error: () => document.querySelector('[data-kind="field-error"]')
		};
	};

	it('renders nothing while the field is valid', async () => {
		const { error, control, unmount } = await setup();

		expect(error()).toBeNull();
		expect(control().hasAttribute('aria-errormessage')).toBe(false);

		unmount();
	});

	it('shows the first validation message and wires aria-errormessage to it', async () => {
		const { field, error, control, unmount } = await setup();

		field.validate();
		await tick();

		const node = error()!;
		expect(node).not.toBeNull();
		expect(node.textContent?.trim()).toBe('Name is required');
		expect(node.getAttribute('role')).toBe('alert');
		expect(control().getAttribute('aria-errormessage')).toBe(node.id);
		expect(control().getAttribute('aria-invalid')).toBe('true');

		unmount();
	});

	it('describes the group by the error rather than the helper text once invalid', async () => {
		const { field, error, unmount } = await setup();
		const root = document.querySelector('[data-kind="field-root"]')!;
		const helper = document.querySelector('[data-kind="field-description"]')!;

		expect(root.getAttribute('aria-describedby')).toBe(helper.id);

		field.validate();
		await tick();
		expect(root.getAttribute('aria-describedby')).toBe(error()!.id);

		unmount();
	});

	// The helper text no longer doubles as the error target, so a field with no `Field.Error` must
	// still describe itself — it falls back to the helper text instead of going silent.
	it('falls back to the helper text when no error part is rendered', async () => {
		const { field, unmount } = await setup({ renderError: false });
		const root = document.querySelector('[data-kind="field-root"]')!;
		const helper = document.querySelector('[data-kind="field-description"]')!;

		field.validate();
		await tick();
		expect(root.getAttribute('aria-describedby')).toBe(helper.id);

		unmount();
	});

	it('clears back to valid', async () => {
		const { field, error, control, unmount } = await setup();

		field.validate();
		await tick();
		expect(error()).not.toBeNull();

		field.clear();
		await tick();
		expect(error()).toBeNull();
		expect(control().hasAttribute('aria-errormessage')).toBe(false);

		unmount();
	});
});
