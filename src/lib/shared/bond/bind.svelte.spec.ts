import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import BindProbe from '$ixirjs/ui/test/shared/bond/bind-probe.test.svelte';
import { Bond } from './bond.svelte';
import { capabilityKey, defineCapability } from '$ixirjs/ui/shared/capability';

class TestBond extends Bond {
	constructor() {
		super({}, 'bind-lifecycle-test');
	}
}

describe('bindBond lifecycle ownership', () => {
	it('shares, activates, and destroys the Bond automatically', () => {
		const events: string[] = [];
		const bond = new TestBond();
		bond.capability(
			defineCapability({
				slot: capabilityKey('bind:lifecycle'),
				setup: () => {
					events.push('setup');
					return () => events.push('teardown');
				}
			})
		);

		const { unmount } = render(BindProbe, { bond });

		expect(document.querySelector('[data-testid="bind-probe"]')?.getAttribute('data-shared')).toBe(
			'true'
		);
		expect(events).toEqual(['setup']);

		unmount();
		expect(events).toEqual(['setup', 'teardown']);
	});
});
