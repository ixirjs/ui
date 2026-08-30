import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe from '$ixirjs/ui/test/components/date-picker/date-picker-preset-probe.test.svelte';

// The combobox surface `DatePickerTriggerAtom` used to project is now written literally by
// `date-picker-trigger.svelte`. Asserted through the DOM rather than through the Atom.
describe('DatePicker trigger', () => {
	it('renders the combobox surface and the overlay trigger ARIA', async () => {
		const { unmount } = render(Probe, { presets: {} });

		const trigger = document.querySelector<HTMLElement>('[role="combobox"]');
		expect(trigger).not.toBeNull();
		expect(trigger?.tagName).toBe('BUTTON');
		expect(trigger?.getAttribute('aria-label')).toBe('Date picker');
		expect(trigger?.getAttribute('aria-haspopup')).toBe('dialog');
		expect(trigger?.getAttribute('aria-expanded')).toBe('true');
		expect(trigger?.getAttribute('tabindex')).toBe('0');
		expect(trigger?.getAttribute('type')).toBe('button');
		expect(trigger?.hasAttribute('readonly')).toBe(true);
		expect(trigger?.id).toMatch(/^date-picker-trigger-/);

		// `aria-controls` resolves the content the picker actually rendered, never a rebuilt id.
		const controls = trigger?.getAttribute('aria-controls');
		expect(controls).toBeTruthy();
		expect(document.getElementById(controls as string)).not.toBeNull();

		// The dialog surface keeps the label DatePicker gives it, over Calendar.Root's own.
		const dialog = document.getElementById(controls as string);
		expect(dialog?.getAttribute('role')).toBe('dialog');
		expect(dialog?.getAttribute('aria-label')).toBe('Choose date');

		trigger?.click();
		await Promise.resolve();
		expect(trigger?.getAttribute('aria-expanded')).toBe('false');

		unmount();
	});
});
