import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import LifetimeProbe from '$ixirjs/ui/test/shared/authoring/part-lifetime-probe.test.svelte';

/**
 * A part's registration is owned by *that part's* component lifetime, not by its Bond's.
 *
 * This is the difference between the two environments. A server render is one pass: every Atom of a
 * Bond is created and discarded together, which is why `createAtomInstance` batches SSR
 * unregistration into a single per-Bond callback. On the client a part inside an `{#if}` is
 * destroyed while its root lives on, so its registration must be released at that moment. Batching
 * client teardown per Bond the way SSR does would leak this registration until the root unmounted,
 * and every `nodeByPart` / `nodesByPart` / relationship-ARIA lookup would keep resolving a part that
 * is no longer in the DOM.
 */
describe('atom registration lifetime', () => {
	it('releases a conditionally rendered part when that part alone is destroyed', async () => {
		const screen = render(LifetimeProbe, { show: true });
		const root = document.querySelector('[data-testid="lifetime-root"]');

		expect(document.querySelector('[data-testid="lifetime-trigger"]')).not.toBeNull();

		await screen.rerender({ show: false });
		await tick();

		expect(document.querySelector('[data-testid="lifetime-trigger"]')).toBeNull();
		// The registry must no longer resolve the destroyed part, while the root remains registered.
		const probe = screen.component as unknown as { registeredTriggers(): number };
		expect(probe.registeredTriggers()).toBe(0);
		expect(root).not.toBeNull();
	});
});
