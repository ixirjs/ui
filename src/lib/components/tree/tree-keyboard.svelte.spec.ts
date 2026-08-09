import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import Probe from '$ixirjs/ui/test/components/tree/tree-keyboard.test.svelte';

// APG tree: Up/Down walk the *visible* treeitems (collapsed subtrees are skipped), Right expands
// then descends, Left collapses then ascends, Home/End jump to the ends.
describe('Tree keyboard navigation', () => {
	const setup = () => {
		const { container, unmount } = render(Probe);
		const item = (label: string) =>
			[...container.querySelectorAll<HTMLElement>('[role="treeitem"]')].find(
				(el) => el.textContent?.trim() === label
			)!;
		const key = async (key: string) => {
			document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
			await tick();
		};
		return { item, key, unmount };
	};

	it('walks the visible treeitems with Up and Down', async () => {
		const { item, key, unmount } = setup();
		item('root').focus();

		await key('ArrowDown');
		expect(document.activeElement).toBe(item('a'));

		// `a1` lives under the collapsed `a`, so Down goes straight to `b`.
		await key('ArrowDown');
		expect(document.activeElement).toBe(item('b'));

		await key('ArrowDown');
		expect(document.activeElement).toBe(item('b1'));

		await key('ArrowUp');
		expect(document.activeElement).toBe(item('b'));

		unmount();
	});

	it('expands then descends with Right', async () => {
		const { item, key, unmount } = setup();
		item('a').focus();
		expect(item('a').getAttribute('aria-expanded')).toBe('false');

		// First Right opens the node and keeps focus where it is.
		await key('ArrowRight');
		expect(item('a').getAttribute('aria-expanded')).toBe('true');
		expect(document.activeElement).toBe(item('a'));

		// Second Right moves into the now-visible child.
		await key('ArrowRight');
		expect(document.activeElement).toBe(item('a1'));

		unmount();
	});

	it('collapses then ascends with Left', async () => {
		const { item, key, unmount } = setup();
		item('b').focus();

		await key('ArrowLeft');
		expect(item('b').getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(item('b'));

		await key('ArrowLeft');
		expect(document.activeElement).toBe(item('root'));

		unmount();
	});

	it('binds Home and End to the first and last visible treeitem', async () => {
		const { item, key, unmount } = setup();
		item('a').focus();

		await key('End');
		expect(document.activeElement).toBe(item('b1'));

		await key('Home');
		expect(document.activeElement).toBe(item('root'));

		unmount();
	});

	it('keeps a roving tabindex so the tree is one tab stop', async () => {
		const { item, key, unmount } = setup();

		expect(item('root').tabIndex).toBe(0);
		expect(item('a').tabIndex).toBe(-1);

		item('root').focus();
		await key('ArrowDown');
		expect(item('root').tabIndex).toBe(-1);
		expect(item('a').tabIndex).toBe(0);

		unmount();
	});
});
