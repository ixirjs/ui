import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MissingTargetProbe from '$ixirjs/ui/test/components/portal/teleport-missing-target-probe.test.svelte';
import MissingRootProbe from '$ixirjs/ui/test/components/portal/teleport-missing-root-probe.test.svelte';
import MissingBoundaryProbe from '$ixirjs/ui/test/components/portal/teleport-missing-boundary-probe.test.svelte';

describe('Teleport diagnostics', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('warns when a string id cannot resolve to a target element', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { unmount } = render(MissingTargetProbe);
		await tick();

		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining('<Teleport portal="missing">: no portal target resolved')
		);

		unmount();
	});

	it('warns when no portal/root target is available', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { unmount } = render(MissingRootProbe);
		await tick();

		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining('<Teleport>: no portal target resolved')
		);

		unmount();
	});

	it('warns when a PortalBond resolves without a boundary element', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { unmount } = render(MissingBoundaryProbe);
		await tick();

		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining('<Teleport portal={PortalBond}>: no portal target resolved')
		);

		unmount();
	});
});
