import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import VirtualTest from '$ixirjs/ui/test/runes/virtual.test.svelte';
import VirtualPairTest from '$ixirjs/ui/test/runes/virtual-pair.test.svelte';

async function nextFrame() {
	await new Promise((resolve) => requestAnimationFrame(resolve));
}

async function settleLayout() {
	await nextFrame();
	await nextFrame();
}

const rows = () => Array.from(document.querySelectorAll<HTMLElement>('[data-testid="row"]'));
const keys = () => rows().map((row) => row.dataset.key);
const viewport = () => document.querySelector<HTMLElement>('[data-testid="viewport"]')!;

describe('createVirtual', () => {
	it('renders a bounded window over a large source and sizes the spacer to the whole of it', async () => {
		render(VirtualTest, { count: 1000, height: 100, estimateSize: 10, rowHeight: 10 });
		await settleLayout();

		expect(rows().length).toBeLessThan(20);
		expect(keys()[0]).toBe('row-0');
		expect(keys()).not.toContain('row-500');

		await expect.element(page.getByTestId('total')).toHaveTextContent('10000');
		expect(document.querySelector<HTMLElement>('[data-testid="content"]')!.style.height).toBe(
			'10000px'
		);
	});

	it('moves the window as the viewport scrolls', async () => {
		render(VirtualTest, { count: 1000, height: 100, estimateSize: 10, rowHeight: 10 });
		await settleLayout();
		expect(keys()[0]).toBe('row-0');

		viewport().scrollTop = 5000;
		viewport().dispatchEvent(new Event('scroll', { bubbles: true }));
		await settleLayout();

		// Item 499 ends at 5000, exactly on the scroll offset, so it overlaps by nothing and 500 is
		// the first visible row.
		expect(keys()[0]).toBe('row-500');
		expect(keys()).not.toContain('row-0');
		await expect.element(page.getByTestId('range')).toHaveTextContent('500-509');
	});

	it('keeps a caller style alongside the structural one on every spread', async () => {
		render(VirtualTest, {
			count: 100,
			height: 100,
			estimateSize: 10,
			rowHeight: 10,
			viewportStyle: 'border-top-width:3px;'
		});
		await settleLayout();

		// Neither may be dropped: without overflow the list stops scrolling, without the caller's style
		// the spread ate a prop. A `style` attribute beside the spread keeps only one — hence the
		// argument.
		const style = viewport().style;
		expect(style.overflow).toBe('auto');
		expect(style.position).toBe('relative');
		expect(style.borderTopWidth).toBe('3px');

		// Same for an item: positioning plus the caller's height.
		const first = rows()[0]!;
		expect(first.style.transform).toBe('translateY(0px)');
		expect(first.style.height).toBe('10px');
	});

	it('positions each item at its own offset', async () => {
		render(VirtualTest, { count: 100, height: 100, estimateSize: 10, rowHeight: 10 });
		await settleLayout();

		const [first, second] = rows();
		expect(first!.style.transform).toBe('translateY(0px)');
		expect(second!.style.transform).toBe('translateY(10px)');
		expect(first!.style.position).toBe('absolute');
	});

	it('corrects the layout from measured heights when they beat the estimate', async () => {
		// Estimated 10px, actually 25px. Measurement has to win, or scrolling drifts.
		render(VirtualTest, { count: 200, height: 100, estimateSize: 10, rowHeight: 25 });
		await settleLayout();
		await settleLayout();

		expect(Number(document.querySelector('[data-testid="total"]')!.textContent)).toBeGreaterThan(
			2000
		);
		const positioned = rows().map((row) => row.style.transform);
		expect(positioned[0]).toBe('translateY(0px)');
		expect(positioned[1]).toBe('translateY(25px)');
	});

	it('retains a pinned index far outside the window without moving the viewport', async () => {
		render(VirtualTest, { count: 1000, height: 100, estimateSize: 10, rowHeight: 10, pinned: 900 });
		await settleLayout();

		// Retention is not scrolling: `aria-activedescendant` needs the element mounted; moving the
		// viewport is a separate opt-in.
		expect(keys()).toContain('row-900');
		expect(keys().at(-1)).toBe('row-900');
		expect(keys()[0]).toBe('row-0');
		expect(viewport().scrollTop).toBe(0);
		expect(rows().length).toBeLessThan(20);
	});

	// Two `ResizeObserver`s — one shared across items, one on the viewport — both outlive their
	// elements unless teardown runs. Invisible until a page mounts and discards many lists.
	it('disconnects its observers when the host unmounts', async () => {
		const RealResizeObserver = window.ResizeObserver;
		let live = 0;
		class Counting extends RealResizeObserver {
			constructor(callback: ResizeObserverCallback) {
				super(callback);
				live += 1;
			}
			override disconnect() {
				live -= 1;
				super.disconnect();
			}
		}
		window.ResizeObserver = Counting as unknown as typeof ResizeObserver;

		try {
			const { unmount } = render(VirtualTest, {
				count: 1000,
				height: 100,
				estimateSize: 10,
				rowHeight: 10
			});
			await settleLayout();
			expect(live).toBeGreaterThan(0);

			unmount();
			await settleLayout();
			expect(live).toBe(0);
		} finally {
			window.ResizeObserver = RealResizeObserver;
		}
	});

	it('scrolls to an index on demand, and no further than needed', async () => {
		render(VirtualTest, {
			count: 1000,
			height: 100,
			estimateSize: 10,
			rowHeight: 10,
			scrollTarget: 600
		});
		await settleLayout();

		document.querySelector<HTMLButtonElement>('[data-testid="scroll-to"]')!.click();
		await settleLayout();

		// Item 600 spans 6000..6010 in a 100-tall viewport: the minimum move puts its trailing edge at
		// the bottom. Its leading edge would jump 90px further than asked.
		expect(viewport().scrollTop).toBe(5910);
		expect(keys()).toContain('row-600');

		// Already visible — an imperative call must not nudge the viewport.
		document.querySelector<HTMLButtonElement>('[data-testid="scroll-to"]')!.click();
		await settleLayout();
		expect(viewport().scrollTop).toBe(5910);
	});

	it('scrolls a pinned index into view when following, by the minimum needed', async () => {
		render(VirtualTest, {
			count: 1000,
			height: 100,
			estimateSize: 10,
			rowHeight: 10,
			pinned: 900,
			follow: true
		});
		await settleLayout();
		await settleLayout();

		// Same rule at the end of the list: trailing edge to the bottom, not leading edge to the top.
		expect(viewport().scrollTop).toBe(8910);
		expect(keys()).toContain('row-900');
	});

	// Isolation is currently a property of the code's shape — all state lives inside the call — which
	// a later "share the observer across lists" optimisation would undo.
	it('keeps two lists on one page independent', async () => {
		render(VirtualPairTest);
		await settleLayout();

		const keysOf = (id: string) =>
			Array.from(document.querySelectorAll<HTMLElement>(`[data-testid="${id}"]`)).map(
				(row) => row.dataset.key
			);
		const totalOf = (id: string) =>
			Number(document.querySelector(`[data-testid="${id}"]`)!.textContent);

		// Different item sizes, so a shared layout would collapse them onto one number.
		expect(totalOf('total-a')).toBe(5000);
		expect(totalOf('total-b')).toBe(10_000);
		expect(keysOf('row-a')[0]).toBe('a-0');
		expect(keysOf('row-b')[0]).toBe('b-0');

		const viewportA = document.querySelector<HTMLElement>('[data-testid="viewport-a"]')!;
		viewportA.scrollTop = 2000;
		viewportA.dispatchEvent(new Event('scroll', { bubbles: true }));
		await settleLayout();

		// Scrolling one must not move the other's window.
		expect(keysOf('row-a')[0]).toBe('a-200');
		expect(keysOf('row-b')[0]).toBe('b-0');
	});
});
