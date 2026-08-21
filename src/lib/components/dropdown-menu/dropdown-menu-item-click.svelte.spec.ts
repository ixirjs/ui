import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuItemClick from '$ixirjs/ui/test/menu/menu-item-click.test.svelte';

/**
 * The item-click contract, which nothing covered before.
 *
 * `DropdownMenu.Item` hands its handler to the Kernel seam, where `composeHandlers` runs the
 * consumer's handler first and skips the Atom's when the default was prevented. `handleClick`
 * prevents it and calls `atom.close(ev)` itself, so the Atom's own close handler must NOT also fire.
 * Before the Atom rode the seam as `atom:`, `onclick` REPLACED it outright and a double-fire was not
 * expressible; composing them is what makes this worth pinning.
 *
 * Counted on `stageOpenChange`, not `onopenchange` — see the fixture for why the latter is blind to
 * a double-fire.
 */
describe('DropdownMenu.Item click', () => {
	it('selects exactly once, not twice', async () => {
		const onselect = vi.fn();
		const screen = render(MenuItemClick, { open: true, onselect });

		await screen.getByTestId('item').click();

		expect(onselect).toHaveBeenCalledTimes(1);
	});

	it('still selects once when a consumer handler runs first', async () => {
		const onselect = vi.fn();
		const onclick = vi.fn();
		const screen = render(MenuItemClick, { open: true, onselect, onclick });

		await screen.getByTestId('item').click();

		expect(onclick).toHaveBeenCalledTimes(1);
		expect(onselect).toHaveBeenCalledTimes(1);
	});
});
