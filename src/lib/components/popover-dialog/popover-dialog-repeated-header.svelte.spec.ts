import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Fixture, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/popover-dialog/popover-dialog-repeated-header.test.svelte';

describe('PopoverDialog layout parts', () => {
	it('registers repeated headers and bodies as many-node parts', () => {
		resetCapturedBond();
		const { unmount } = render(Fixture);

		expect(document.querySelectorAll('[data-testid="popover-dialog-header"]')).toHaveLength(2);
		expect(document.querySelectorAll('[data-testid="popover-dialog-body"]')).toHaveLength(2);
		expect(capturedBond?.nodesByPart('header')).toHaveLength(2);
		expect(capturedBond?.nodesByPart('body')).toHaveLength(2);
		unmount();
		expect(capturedBond?.nodesByPart('header')).toEqual([]);
		expect(capturedBond?.nodesByPart('body')).toEqual([]);
	});
});
