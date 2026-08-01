import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Fixture from '$ixirjs/ui/test/components/dialog/dialog-portal-surface.test.svelte';

describe('Dialog.Root portal surface', () => {
	it('ports modal roots locally, retains lock/inert ownership, and restores it on teardown', async () => {
		const { rerender, unmount } = render(Fixture);
		await tick();

		const sink = document.querySelector<HTMLElement>('[data-testid="dialog-local-sink"]')!;
		const first = document.querySelector<HTMLElement>('[data-testid="dialog-first"]')!;
		const second = document.querySelector<HTMLElement>('[data-testid="dialog-second"]')!;
		const localBackground = document.querySelector<HTMLElement>(
			'[data-testid="dialog-local-background"]'
		)!;
		const outsideLocal = document.querySelector<HTMLElement>(
			'[data-testid="dialog-outside-local"]'
		)!;

		expect(first.tagName).toBe('SECTION');
		expect(first.parentElement).toBe(sink);
		expect(second.parentElement).toBe(sink);
		expect(first.dataset.portal).toBe('local');
		expect(first.dataset.band).toBe('modal');
		expect(Number(first.style.zIndex)).toBeLessThan(Number(second.style.zIndex));
		expect(document.body.style.overflow).toBe('hidden');
		expect(localBackground.inert).toBe(true);
		expect(outsideLocal.inert).toBe(false);

		await rerender({ firstOpen: false });
		await tick();
		expect(document.body.style.overflow).toBe('hidden');
		expect(localBackground.inert).toBe(true);

		await rerender({ firstOpen: true });
		await tick();
		expect(Number(first.style.zIndex)).toBeGreaterThan(Number(second.style.zIndex));

		await rerender({ firstOpen: false, secondOpen: false });
		await tick();
		expect(document.body.style.overflow).toBe('');
		expect(localBackground.inert).toBe(false);

		await rerender({ secondOpen: true });
		await tick();
		expect(document.body.style.overflow).toBe('hidden');
		unmount();
		expect(document.body.style.overflow).toBe('');
		expect(localBackground.inert).toBe(false);
	});

	it('does not lock, inert, or expose aria-modal for an open non-modal dialog', async () => {
		const { unmount } = render(Fixture, {
			firstOpen: true,
			secondOpen: false,
			firstType: 'non-modal'
		});
		await tick();

		const first = document.querySelector<HTMLElement>('[data-testid="dialog-first"]')!;
		const localBackground = document.querySelector<HTMLElement>(
			'[data-testid="dialog-local-background"]'
		)!;
		expect(first.dataset.open).toBe('true');
		expect(first.getAttribute('aria-modal')).toBeNull();
		expect(document.body.style.overflow).toBe('');
		expect(localBackground.inert).toBe(false);

		unmount();
	});

	it('does not lock or inert for a disabled modal', async () => {
		const { unmount } = render(Fixture, {
			firstOpen: true,
			secondOpen: false,
			firstDisabled: true
		});
		await tick();

		const localBackground = document.querySelector<HTMLElement>(
			'[data-testid="dialog-local-background"]'
		)!;
		expect(document.body.style.overflow).toBe('');
		expect(localBackground.inert).toBe(false);

		unmount();
	});
});
