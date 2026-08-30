import { tick } from 'svelte';
import { afterEach, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import Probe from '$ixirjs/ui/test/components/accordion/intro-probe.test.svelte';

// A panel open at mount renders open; only a panel opened later plays its enter. The distinction
// is `Bond.isSettled`, flipped in the microtask after the root's mount.

afterEach(() => vi.restoreAllMocks());

it('does not animate a body that is open at mount, and animates one opened later', async () => {
	const animate = vi.spyOn(Element.prototype, 'animate');
	render(Probe);
	await tick();

	const bodyA = document.querySelector('[data-testid="body-a"]') as HTMLElement;
	expect(bodyA).toBeTruthy();
	expect(bodyA.style.height).toBe('auto');
	expect(bodyA.style.opacity).toBe('1');
	expect(animate).not.toHaveBeenCalled();

	await page.getByTestId('header-b').click();
	await vi.waitFor(() => expect(document.querySelector('[data-testid="body-b"]')).toBeTruthy());
	// The measured `auto` run starts in the batched microtask after the mount flush.
	await vi.waitFor(() => expect(animate).toHaveBeenCalled());
});
