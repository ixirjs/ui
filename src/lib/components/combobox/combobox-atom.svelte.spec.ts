import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/combobox/combobox-atom-probe.test.svelte';
import { PopupBond } from '$ixirjs/ui/components/overlay/popup/bond.svelte';

/**
 * Rewritten DOM-level. It used to assert Atom instances through `nodeByPart` — machinery the
 * Kernel migration removed. Every rendered outcome it covered is asserted here instead: the
 * listbox content, the two combobox-role inputs (control and query), the option's role, and the
 * registration released on unmount.
 */
describe('Combobox rendered parts', () => {
	beforeEach(resetCapturedBond);

	it('renders the combobox roles and releases its option registration on unmount', () => {
		const { unmount } = render(Probe);
		const combobox = capturedBond;

		expect(combobox).toBeDefined();
		expect(combobox).toBeInstanceOf(PopupBond);
		expect(combobox?.isOpen).toBe(true);

		expect(document.querySelector('[aria-haspopup="listbox"]')).not.toBeNull();

		const content = document.querySelector('[role="listbox"]');
		expect(content).not.toBeNull();
		expect(content?.getAttribute('aria-multiselectable')).toBe('false');

		// Two independent text boxes: the value control and the filter query.
		const inputs = document.querySelectorAll('input[role="combobox"]');
		expect(inputs).toHaveLength(2);
		expect(document.getElementById(`combobox-control-${combobox!.id}`)).not.toBeNull();
		expect(document.getElementById(`combobox-query-${combobox!.id}`)).not.toBeNull();

		const option = document.querySelector('[role="option"]');
		expect(option).not.toBeNull();
		expect(combobox?.items.get('alpha')?.element).toBe(option);

		unmount();

		expect(document.querySelector('[role="option"]')).toBeNull();
		expect(combobox?.items.get('alpha')).toBeUndefined();
	});
});
