import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PaginationTest from '$ixirjs/ui/test/components/pagination/pagination.test.svelte';

const parts = () => ({
	root: document.querySelector<HTMLElement>('[data-testid="root"]')!,
	previous: document.querySelector<HTMLButtonElement>('[data-testid="previous"]')!,
	next: document.querySelector<HTMLButtonElement>('[data-testid="next"]')!,
	page: document.querySelector<HTMLElement>('[data-testid="page"]')!,
	bound: document.querySelector<HTMLElement>('[data-testid="bound-page"]')!
});

describe('Pagination', () => {
	it('projects page boundaries and moves pages, round-tripping through bind:page', async () => {
		const { unmount } = render(PaginationTest, { pageSize: 10, total: 25 });
		const { root, previous, next, page, bound } = parts();

		// A navigation landmark, and the controls are real buttons that cannot submit a form.
		expect(root.tagName).toBe('NAV');
		expect(root.getAttribute('aria-label')).toBe('Pagination');
		expect(next.getAttribute('type')).toBe('button');

		expect(root.getAttribute('data-page')).toBe('1');
		expect(root.getAttribute('data-page-count')).toBe('3');
		expect(root.getAttribute('data-start-index')).toBe('0');
		expect(root.getAttribute('data-end-index')).toBe('10');
		expect(previous.getAttribute('aria-disabled')).toBe('true');
		expect(next.getAttribute('aria-disabled')).toBeNull();

		next.click();
		await Promise.resolve();
		expect(page).toHaveTextContent('2');
		expect(bound).toHaveTextContent('2');
		expect(previous.getAttribute('aria-disabled')).toBeNull();

		next.click();
		await Promise.resolve();
		// 25 items over a page size of 10 is three pages, the last holding five.
		expect(root.getAttribute('data-end-index')).toBe('25');
		expect(next.getAttribute('aria-disabled')).toBe('true');

		// Clamped at the last page rather than wrapping or running past the end.
		next.click();
		await Promise.resolve();
		expect(page).toHaveTextContent('3');

		previous.click();
		await Promise.resolve();
		expect(page).toHaveTextContent('2');

		unmount();
	});

	it('stays put while disabled', async () => {
		const { unmount } = render(PaginationTest, { pageSize: 10, total: 25, disabled: true });
		const { next, page } = parts();

		next.click();
		await Promise.resolve();
		expect(page).toHaveTextContent('1');

		unmount();
	});

	it('keeps advancing when the total is unknown', async () => {
		const { unmount } = render(PaginationTest, { pageSize: 10 });
		const { root, next, page } = parts();

		expect(root.getAttribute('data-page-count')).toBeNull();
		expect(next.getAttribute('aria-disabled')).toBeNull();

		next.click();
		await Promise.resolve();
		expect(page).toHaveTextContent('2');

		unmount();
	});
});
