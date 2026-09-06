import { describe, expect, it } from 'vitest';
import { flushSync, tick } from 'svelte';
import { render } from 'vitest-browser-svelte';
import Overlay from '$ixirjs/ui/test/prototypes/popup/replacement/overlay.test.svelte';
import Selection from '$ixirjs/ui/test/prototypes/popup/replacement/selection.test.svelte';
import { PopupBond } from './bond.svelte';
import { menuItem } from './item';

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const node = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
const overlayState = () =>
	JSON.parse(node('overlay-state').textContent!) as {
		outerOpen: boolean;
		innerOpen: boolean;
		reasons: string[];
	};
const selectionState = () =>
	JSON.parse(node('selection-state').textContent!) as {
		open: boolean;
		values: string[];
		query: string;
		trace: unknown[];
	};
function escape(element: HTMLElement) {
	flushSync(() =>
		element.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
		)
	);
}

describe('overlay lifecycle', () => {
	it('lets only the nested top overlay handle Escape and restores focus to its trigger', async () => {
		const fixture = render(Overlay);
		await frame();
		await frame();
		expect(overlayState().outerOpen && overlayState().innerOpen).toBe(true);
		escape(node('inner'));
		await tick();
		expect(overlayState()).toMatchObject({ outerOpen: true, innerOpen: false });
		expect(document.activeElement).toBe(node('inner-trigger'));
		escape(node('outer'));
		await tick();
		expect(overlayState().outerOpen).toBe(false);
		expect(document.activeElement).toBe(node('outer-trigger'));
		fixture.unmount();
	});

	it('honors cancellation and dismisses only the top overlay on an outside press', async () => {
		const fixture = render(Overlay, { cancel: true });
		await frame();
		await frame();
		escape(node('inner'));
		expect(overlayState().innerOpen).toBe(true);
		flushSync(() =>
			node('outside').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
		);
		expect(overlayState()).toMatchObject({ outerOpen: true, innerOpen: false });
		fixture.unmount();
	});

	it('opens and closes Tooltip on the existing hover schedule with the existing reasons', async () => {
		const fixture = render(Overlay, { kind: 'tooltip' });
		node('hover-trigger').dispatchEvent(new PointerEvent('pointerenter'));
		await frame();
		await frame();
		expect(overlayState().outerOpen).toBe(true);
		flushSync(() => node('hover-trigger').dispatchEvent(new PointerEvent('pointerleave')));
		expect(overlayState()).toMatchObject({
			outerOpen: false,
			reasons: ['pointer-enter', 'pointer-leave']
		});
		fixture.unmount();
	});

	it('uses the actual fused modal root and releases document effects on teardown', async () => {
		const overflow = document.body.style.overflow;
		const fixture = render(Overlay, { kind: 'dialog' });
		await frame();
		expect(document.querySelector('dialog[aria-modal="true"]')).not.toBeNull();
		expect(document.body.style.overflow).toBe('hidden');
		escape(document.querySelector('dialog')!);
		await tick();
		expect(overlayState().outerOpen).toBe(false);
		fixture.unmount();
		expect(document.body.style.overflow).toBe(overflow);
	});
});

describe('selection interaction parity', () => {
	it.each([
		{ kind: 'select' as const, multiple: false },
		{ kind: 'select' as const, multiple: true },
		{ kind: 'combobox' as const, multiple: false },
		{ kind: 'combobox' as const, multiple: true }
	])('$kind multiple=$multiple preserves commits, query, labels and close policy', (options) => {
		{
			const fixture = render(Selection, options);
			flushSync(() => node('option').click());
			const first = selectionState();
			expect(first.values).toEqual(['alpha']);
			expect(first.open).toBe(options.kind === 'combobox' && options.multiple);
			flushSync(() => node('option').click());
			const second = selectionState();
			expect(second.values).toEqual(options.kind === 'combobox' ? [] : ['alpha']);
			fixture.unmount();
		}
	});

	it('keeps menu typeahead on the whole element rather than Select-only data-label text', () => {
		const bond = PopupBond.create('dropdown-menu', {
			id: 'menu',
			open: true,
			placements: [],
			placement: 'bottom',
			offset: 2,
			position: 'absolute'
		});
		const item = menuItem({ id: 'searchable' }, bond);
		const element = document.createElement('li');
		element.id = item.domId;
		element.innerHTML = 'Zulu <span data-label>Beta</span>';
		document.body.append(element);
		try {
			bond.registerItem(item.id, item);
			expect(
				bond.typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'z', cancelable: true }))
			).toBe(item.id);
		} finally {
			bond.dispose();
			element.remove();
		}
	});
});
