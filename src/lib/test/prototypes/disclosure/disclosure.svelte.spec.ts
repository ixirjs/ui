import { page, userEvent } from '@vitest/browser/context';
import { flushSync, hydrate, unmount } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Prototype from '$ixirjs/ui/test/prototypes/disclosure/disclosure-root.test.svelte';
import Reference from '$ixirjs/ui/test/prototypes/disclosure/reference.test.svelte';
import { createDisclosureBond, type DisclosureBond } from './bond';
import { disclosureHtml } from './ssr-html';
import type { AccordionBond } from '$ixirjs/ui/components/accordion/bond.svelte';

// vitest-browser-svelte types `component` as the constructor; runtime returns its exports.
function bondOf(component: unknown) {
	return (
		component as { getBond(): Pick<DisclosureBond, 'isOpen' | 'open' | 'close' | 'toggle'> }
	).getBond();
}

function parentOf(component: unknown) {
	return (component as { getParent(): AccordionBond | undefined }).getParent();
}

function elements(container: HTMLElement) {
	const header = container.querySelector<HTMLElement>('[id*="-header-"]');
	const body = container.querySelector<HTMLElement>('[role="region"]');
	if (!header || !body) throw new Error('Missing disclosure parts');
	return { header, body };
}

function semantics(container: HTMLElement) {
	const { header, body } = elements(container);
	return {
		header: ['role', 'tabindex', 'aria-expanded', 'aria-disabled', 'data-state'].map((key) =>
			header.getAttribute(key)
		),
		body: ['role', 'inert', 'data-state'].map((key) => body.getAttribute(key)),
		controls: header.getAttribute('aria-controls') === body.id,
		labelledBy: body.getAttribute('aria-labelledby') === header.id
	};
}

describe('canonical disclosure DOM', () => {
	it('hydrates real server markup in place and keeps relationships reactive', async () => {
		const target = document.createElement('div');
		target.innerHTML = disclosureHtml;
		document.body.append(target);
		const before = elements(target);
		const notify = vi.fn();
		const component = hydrate(Prototype, { target, props: { open: true, onopenchange: notify } });
		try {
			flushSync();
			expect(elements(target).header).toBe(before.header);
			expect(elements(target).body).toBe(before.body);
			expect(notify).not.toHaveBeenCalled();
			flushSync(() => before.header.click());
			expect(component.getBond().isOpen).toBe(false);
			expect(before.header.getAttribute('aria-expanded')).toBe('false');
			expect(before.body.hasAttribute('inert')).toBe(true);
			expect(semantics(target)).toMatchObject({ controls: true, labelledBy: true });
			expect(notify).toHaveBeenCalledTimes(1);
		} finally {
			await unmount(component);
			target.remove();
		}
	});
	it('matches shipped Collapsible through commands, gestures and external updates', async () => {
		const reference = render(Reference);
		const candidate = render(Prototype);
		const compare = () => {
			expect(semantics(candidate.container)).toEqual(semantics(reference.container));
			expect(semantics(candidate.container)).toMatchObject({ controls: true, labelledBy: true });
		};
		compare();
		for (const command of ['open', 'close', 'toggle'] as const) {
			flushSync(() => {
				bondOf(reference.component)[command]();
				bondOf(candidate.component)[command]();
			});
			compare();
		}
		for (const key of ['Enter', ' ', 'Escape']) {
			for (const fixture of [reference, candidate]) {
				const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
				flushSync(() => elements(fixture.container).header.dispatchEvent(event));
			}
			compare();
		}
		await reference.rerender({ open: false, disabled: true });
		await candidate.rerender({ open: false, disabled: true });
		for (const fixture of [reference, candidate]) {
			flushSync(() => elements(fixture.container).header.click());
			expect(bondOf(fixture.component).isOpen).toBe(false);
		}
		compare();
		await reference.rerender({ open: true, disabled: false });
		await candidate.rerender({ open: true, disabled: false });
		compare();
		reference.unmount();
		candidate.unmount();
	});

	it.each([false, true])(
		'activates exactly once with real keyboard input, native=%s',
		async (native) => {
			const notify = vi.fn();
			const fixture = render(Prototype, { native, onopenchange: notify });
			elements(fixture.container).header.focus();
			await userEvent.keyboard('{Enter}');
			expect(bondOf(fixture.component).isOpen).toBe(true);
			expect(notify).toHaveBeenCalledTimes(1);
			await userEvent.keyboard(' ');
			expect(bondOf(fixture.component).isOpen).toBe(false);
			expect(notify).toHaveBeenCalledTimes(2);
			await page.getByRole('button', { name: 'Toggle' }).click();
			expect(bondOf(fixture.component).isOpen).toBe(true);
			expect(notify).toHaveBeenCalledTimes(3);
			fixture.unmount();
		}
	);

	it('honors both prop cancellation and separately installed listeners', () => {
		const notify = vi.fn();
		const fixture = render(Prototype, {
			onclick: (event) => event.preventDefault(),
			onopenchange: notify
		});
		const { header } = elements(fixture.container);
		header.click();
		const cancel = (event: Event) => event.preventDefault();
		header.addEventListener('keydown', cancel, { capture: true });
		header.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
		);
		header.removeEventListener('keydown', cancel, { capture: true });
		expect(bondOf(fixture.component).isOpen).toBe(false);
		expect(notify).not.toHaveBeenCalled();
		bondOf(fixture.component).open();
		expect(notify).toHaveBeenCalledWith(true, { bond: bondOf(fixture.component) });
		fixture.unmount();
	});

	it('uses parent policy without mirrored item state', async () => {
		const fixture = render(Prototype, { mode: 'grouped', values: ['item'] });
		const { header } = elements(fixture.container);
		flushSync(() => header.click());
		expect(parentOf(fixture.component)?.values).toEqual(['item']);
		expect(header.getAttribute('aria-expanded')).toBe('true');
		await fixture.rerender({ collapsible: true });
		flushSync(() => header.click());
		expect(parentOf(fixture.component)?.values).toEqual([]);
		expect(header.getAttribute('aria-expanded')).toBe('false');
		await fixture.rerender({ values: ['other'], multiple: true });
		flushSync(() => header.click());
		expect(parentOf(fixture.component)?.values).toEqual(['other', 'item']);
		await fixture.rerender({ values: [], disabled: true });
		flushSync(() => header.click());
		expect(bondOf(fixture.component).isOpen).toBe(false);
		expect(header.getAttribute('aria-disabled')).toBe('true');
		fixture.unmount();
	});

	it('substitutes the factory once and isolates instances and remounts', async () => {
		const build = vi.fn(createDisclosureBond);
		const first = render(Prototype, { factory: build });
		const second = render(Prototype);
		flushSync(() => bondOf(first.component).open());
		expect(bondOf(second.component).isOpen).toBe(false);
		expect(elements(first.container).header.id).not.toBe(elements(second.container).header.id);
		const ignored = vi.fn(createDisclosureBond);
		await first.rerender({ factory: ignored });
		expect(build).toHaveBeenCalledTimes(1);
		expect(ignored).not.toHaveBeenCalled();
		first.unmount();
		second.unmount();
		const remounted = render(Prototype);
		expect(bondOf(remounted.component).isOpen).toBe(false);
		remounted.unmount();
	});
});
