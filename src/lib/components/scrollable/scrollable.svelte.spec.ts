import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import ScrollableTest from '$ixirjs/ui/test/components/scrollable/scrollable.test.svelte';

async function nextFrame() {
	await new Promise((resolve) => requestAnimationFrame(resolve));
}

async function settleLayout() {
	await nextFrame();
	await nextFrame();
}

describe('Scrollable', () => {
	it('measures the viewport and reflects scroll position through the bond', async () => {
		render(ScrollableTest);
		await settleLayout();

		const viewport = document.querySelector<HTMLElement>('[data-testid="viewport"]');
		expect(viewport).toBeInstanceOf(HTMLElement);
		expect(viewport!.scrollHeight).toBeGreaterThan(viewport!.clientHeight);

		await expect.element(page.getByTestId('bond-can-scroll-y')).toHaveTextContent('true');
		await expect.element(page.getByTestId('track')).toBeInTheDocument();

		viewport!.scrollTop = 160;
		expect(viewport!.scrollTop).toBe(160);
		viewport!.dispatchEvent(new Event('scroll', { bubbles: true }));
		await settleLayout();
		expect(viewport!.scrollTop).toBe(160);

		await expect.element(page.getByTestId('bond-scroll-y')).toHaveTextContent('160');
		await expect.element(page.getByTestId('bound-scroll-y')).toHaveTextContent('160');

		const thumb = document.querySelector<HTMLElement>('[data-testid="thumb"]');
		expect(thumb).toBeInstanceOf(HTMLElement);
		expect(thumb!.style.top).not.toBe('0%');
	});

	it('scrolls from a track press and a thumb drag through the pointer policies', async () => {
		render(ScrollableTest);
		await settleLayout();

		const viewport = document.querySelector<HTMLElement>('[data-testid="viewport"]')!;
		const track = document.querySelector<HTMLElement>('[data-testid="track"]')!;
		const thumb = document.querySelector<HTMLElement>('[data-testid="thumb"]')!;
		const maxScroll = viewport.scrollHeight - viewport.clientHeight;
		expect(maxScroll).toBeGreaterThan(0);

		// Track press: half way down the track jumps to half the scrollable distance.
		const trackRect = track.getBoundingClientRect();
		track.dispatchEvent(
			pointerEvent('pointerdown', {
				clientX: trackRect.left + trackRect.width / 2,
				clientY: trackRect.top + trackRect.height / 2
			})
		);
		await settleLayout();
		expect(viewport.scrollTop).toBeCloseTo(maxScroll / 2, 0);

		// Thumb drag: dragging down the full track height travels the full scroll distance.
		viewport.scrollTop = 0;
		viewport.dispatchEvent(new Event('scroll', { bubbles: true }));
		await settleLayout();

		thumb.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, clientY: 0 }));
		thumb.dispatchEvent(pointerEvent('pointermove', { clientX: 0, clientY: trackRect.height }));
		await settleLayout();
		expect(viewport.scrollTop).toBe(maxScroll);

		// A cancelled drag releases `isScrolling`; without that the scrollbars stay pinned open.
		thumb.dispatchEvent(pointerEvent('pointercancel', { clientX: 0, clientY: trackRect.height }));
		await settleLayout();
		thumb.dispatchEvent(pointerEvent('pointermove', { clientX: 0, clientY: 0 }));
		await settleLayout();
		expect(viewport.scrollTop).toBe(maxScroll);
	});
});

function pointerEvent(type: string, init: { clientX: number; clientY: number }): PointerEvent {
	return new PointerEvent(type, {
		bubbles: true,
		cancelable: true,
		pointerId: 1,
		isPrimary: true,
		button: 0,
		...init
	});
}
