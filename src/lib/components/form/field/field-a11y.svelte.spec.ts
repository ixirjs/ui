import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import Probe from '$ixirjs/ui/test/components/form/field/field-a11y.test.svelte';
import DisabledProbe from '$ixirjs/ui/test/components/form/field/field-a11y-disabled.test.svelte';

// Parts are located by the ids they render (`field-<part>-<seed>`): the redesigned Kernel emits no
// DEV `data-kind` markers. This proves the rendered control
// actually ends up wearing it — including aria-describedby, which resolves only once the helper
// text registers, a tick after the control mounts.
describe('Field — the rendered control carries the field ARIA contract', () => {
	async function control() {
		render(Probe, { value: '' });
		await tick();
		return document.querySelector('[data-testid="probe-control"]')!;
	}

	it('is described by the helper text', async () => {
		const el = await control();
		const helper = document.querySelector('[id^="field-description-"]')!;

		expect(helper.id).toBeTruthy();
		expect(el.getAttribute('aria-describedby')).toBe(helper.id);
	});

	it('is labelled by the label and reports its required and validity state', async () => {
		const el = await control();
		const label = document.querySelector('[id^="field-label-"]')!;

		expect(el.getAttribute('aria-labelledby')).toBe(label.id);
		expect(el.getAttribute('aria-required')).toBe('true');
		expect(el.getAttribute('aria-invalid')).toBe('false');
	});
});

// Bond state is not markup. Spreading `root.props` onto the group element painted the schema and
// extension objects into the DOM as "[object Object]", plus `type="undefined"`.
describe('Field.Root — Bond state does not leak onto the element', () => {
	it('renders no attribute for a non-presentational Bond prop', async () => {
		render(Probe, { value: '' });
		await tick();
		const root = document.querySelector('[id^="field-root-"]')!;

		for (const attr of ['schema', 'mode', 'extend', 'type', 'value']) {
			expect(root.hasAttribute(attr), `${attr} leaked onto the field root`).toBe(false);
		}
		expect(root.outerHTML).not.toContain('[object Object]');
	});
});

// Field state (disabled/readonly/required) must reach the native input, not just its aria/data
// twins — a screen reader honours aria-disabled, but form submission and browser behaviour honour
// the plain attribute.
describe('Field.Control — disabled/readonly/required reach the native input', () => {
	it('sets the native boolean properties, not just aria/data', async () => {
		render(DisabledProbe, { value: '' });
		await tick();
		const el = document.querySelector<HTMLInputElement>('[data-testid="probe-control"]')!;

		expect(el.disabled).toBe(true);
		expect(el.readOnly).toBe(true);
		expect(el.required).toBe(true);
	});
});
