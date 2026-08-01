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
});
