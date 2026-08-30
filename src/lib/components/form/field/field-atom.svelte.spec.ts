import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/form/field/field-atom-probe.test.svelte';
import { FieldBond } from './bond.svelte';

// This used to assert the Atom registry (`nodeByPart`, `spread`). On the redesigned Kernel each part
// writes its id into the Bond at init and the siblings read it, so the rendered ARIA is the contract.
describe('Field parts wear the field ARIA contract', () => {
	beforeEach(resetCapturedBond);

	it('links root, label, control and description by their rendered ids', async () => {
		const { unmount } = render(Probe);
		await tick();
		const bond = capturedBond;

		expect(bond).toBeInstanceOf(FieldBond);

		const root = document.querySelector('[id^="field-root-"]')!;
		const label = document.querySelector('[id^="field-label-"]')!;
		const control = document.querySelector('[id^="field-control-"]')!;
		const description = document.querySelector('[id^="field-description-"]')!;

		expect(root.getAttribute('role')).toBe('group');
		expect(root.getAttribute('aria-labelledby')).toBe(label.id);
		expect(root.getAttribute('aria-describedby')).toBe(description.id);
		expect(control.getAttribute('aria-labelledby')).toBe(label.id);
		expect(control.getAttribute('aria-describedby')).toBe(description.id);
		expect(label.getAttribute('for')).toBe(control.id);
		expect(label.id).not.toBe(control.id);

		expect(control.getAttribute('aria-invalid')).toBe('false');
		expect(control.getAttribute('aria-disabled')).toBe('false');
		expect(control.getAttribute('aria-readonly')).toBe('false');
		expect(control.hasAttribute('data-invalid')).toBe(false);
		expect(control.hasAttribute('aria-required')).toBe(false);

		unmount();
	});
});
