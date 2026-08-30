import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import CardProbe from './whiteboard-card-probe.test.svelte';
import AccordionProbe from './whiteboard-accordion-probe.test.svelte';

// The redesigned Kernel keeps composability (`as`, `base`) and motion (enter/exit) as per-part
// opt-ins through `Kernel.render`. These pin that the whiteboard families exercise them.

afterEach(() => vi.restoreAllMocks());

describe('whiteboard card on Kernel', () => {
	it('renders a literal header and a composable title, wired by aria-labelledby', async () => {
		render(CardProbe, {});
		await tick();
		const root = document.querySelector('[data-testid="root"]') as HTMLElement;
		const title = document.querySelector('[data-testid="title"]') as HTMLElement;
		expect(title.tagName).toBe('H3');
		expect(root.getAttribute('aria-labelledby')).toBe(title.id);
		expect(root.className).toContain('card');
	});

	it('honours `as` through the dynamic leaf', async () => {
		render(CardProbe, { as: 'h2' });
		await tick();
		expect((document.querySelector('[data-testid="title"]') as HTMLElement).tagName).toBe('H2');
	});

	it('honours a custom renderer through `base`', async () => {
		render(CardProbe, { custom: true });
		await tick();
		const title = document.querySelector('[data-testid="title"]') as HTMLElement;
		expect(title.tagName).toBe('DIV');
		expect(title.getAttribute('data-received')).toContain('data-testid');
	});

	it("composes a consumer handler with the root's own", async () => {
		let clicks = 0;
		render(CardProbe, { onclick: () => clicks++ });
		await page.getByTestId('root').click();
		expect(clicks).toBe(1);
		expect(
			(document.querySelector('[data-testid="root"]') as HTMLElement).getAttribute('role')
		).toBe('button');
	});
});

describe('whiteboard accordion on Kernel', () => {
	it('does not animate a body open at mount, animates a body opened later, and moves focus', async () => {
		const animate = vi.spyOn(Element.prototype, 'animate');
		render(AccordionProbe, {});
		await tick();
		const bodyA = document.querySelector('[data-testid="body-a"]') as HTMLElement;
		expect(bodyA.getAttribute('role')).toBe('region');
		expect(bodyA.style.height).toBe('auto');
		expect(animate).not.toHaveBeenCalled();
		const headerA = document.querySelector('[data-testid="header-a"]') as HTMLElement;
		expect(headerA.getAttribute('aria-expanded')).toBe('true');
		expect(headerA.getAttribute('aria-controls')).toBe(bodyA.id);
		expect(headerA.tabIndex).toBe(0);

		await page.getByTestId('header-b').click();
		await vi.waitFor(() => expect(document.querySelector('[data-testid="body-b"]')).toBeTruthy());
		await vi.waitFor(() => expect(animate).toHaveBeenCalled());

		headerA.focus();
		headerA.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		expect(document.activeElement?.getAttribute('data-testid')).toBe('header-b');
	});
});
