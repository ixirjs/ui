import { flushSync, tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { PopoverDialogBond, PopoverDialogContext } from './bond.svelte';
import { DialogContext } from '$ixirjs/ui/components/dialog/bond.svelte';
import { PopoverContext } from '$ixirjs/ui/components/popover/bond.svelte';
import { OverlayContext } from '$ixirjs/ui/components/overlay/model.svelte';
import TriggerProbe from '$ixirjs/ui/test/components/popover-dialog/popover-dialog-preset-probe.test.svelte';
import KeyProbe from '$ixirjs/ui/test/components/popover-dialog/popover-dialog-preset-keys.test.svelte';
import FocusProbe from '$ixirjs/ui/test/components/popover-dialog/popover-dialog-focus-restore.test.svelte';

/**
 * The fusion is one plain class now, so what used to be asserted against Atom instances and
 * capability slots is asserted where it is observable: on the rendered DOM.
 *
 *  - "fused atom presets default to the popover-dialog base" → a preset installed under the
 *    `popover-dialog.*` keys reaches every fused part's class.
 *  - "trigger is popover's / root-content-title are dialog's" → the trigger is the popover trigger
 *    (its ARIA and preset key) inside a `<dialog role="dialog" aria-modal>` carrying a
 *    `role="document"` content — the modal presentation, not a floating panel.
 *  - "modal focus wins the slot (restoreFocus 'previous')" → closing returns focus to whatever was
 *    focused before the dialog opened, not to the trigger.
 */

describe('PopoverDialogBond — the Popover/Dialog fusion (§9.4.1)', () => {
	it('rebrands identity to popover-dialog', () => {
		const props = $state({ open: false, disabled: false });
		expect(new PopoverDialogBond(props).name).toBe('popover-dialog');
		expect(PopoverDialogContext.key).toContain('popover-dialog');
	});

	it('answers to both halves context keys so their own parts resolve it', () => {
		// What `parts: [PopoverBond, DialogBond]` bought: `<Popover.Trigger>` and `<Dialog.Content>`
		// resolve the fused bond from their own context, and nested popovers see it as their host.
		expect(
			new Set([PopoverDialogContext.key, DialogContext.key, PopoverContext.key, OverlayContext.key])
				.size
		).toBe(4);
	});

	it('resolves the popover-dialog preset keys for every fused public slot', () => {
		const { unmount } = render(KeyProbe);

		const classOf = (selector: string) =>
			document.querySelector(selector)?.getAttribute('class') ?? '';

		expect(classOf('dialog')).toContain('key-root');
		expect(classOf('[aria-haspopup="dialog"]')).toContain('key-trigger');
		expect(classOf('[role="document"]')).toContain('key-content');
		expect(classOf('[role="banner"]')).toContain('key-header');
		expect(classOf('[role="region"]')).toContain('key-body');
		expect(classOf('[role="contentinfo"]')).toContain('key-footer');
		expect(classOf('[role="document"] button[type="button"]')).toContain('key-close');
		unmount();
	});

	it('presents the modal, not a floating panel (dialog parts won their slots)', () => {
		const { unmount } = render(TriggerProbe, { presets: {} });

		const surface = document.querySelector<HTMLElement>('dialog[role="dialog"]')!;
		expect(surface).not.toBeNull();
		expect(surface.getAttribute('aria-modal')).toBe('true');
		expect(surface.dataset.state).toBe('open');
		// Dialog's content — `role="document"` is the modal content projection, and it is the popover's
		// floating panel that does NOT render.
		expect(document.querySelector('[role="document"]')).not.toBeNull();
		unmount();
	});

	it('keeps the overlay disclosure contract so the popover trigger opens the dialog', () => {
		const { unmount } = render(TriggerProbe, { presets: {} });
		const trigger = document.querySelector<HTMLElement>('[aria-haspopup="dialog"]')!;

		expect(trigger).not.toBeNull();
		expect(trigger.getAttribute('aria-expanded')).toBe('true');

		// Dispatched, not `.click()`: the open modal marks its siblings — the trigger — inert.
		const click = () => {
			trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
			flushSync();
		};
		click();
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		click();
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		unmount();
	});

	it('trigger points at the content it controls', () => {
		const { unmount } = render(TriggerProbe, { presets: {} });
		const trigger = document.querySelector<HTMLElement>('[aria-haspopup="dialog"]')!;
		const content = document.querySelector<HTMLElement>('[role="document"]')!;

		expect(trigger.getAttribute('aria-controls')).toBe(content.id);
		expect(content.id).not.toBe('');
		unmount();
	});

	it('restores focus to what was focused before opening — dialog modal, not popover trigger', async () => {
		const { rerender, unmount } = render(FocusProbe, { open: false });
		await tick();

		const outside = document.querySelector<HTMLElement>('[data-testid="popover-dialog-outside"]')!;
		const trigger = document.querySelector<HTMLElement>('[data-testid="popover-dialog-trigger"]')!;
		outside.focus();
		expect(document.activeElement).toBe(outside);

		await rerender({ open: true });
		await tick();
		await Promise.resolve();
		// Not vacuous: the modal takes focus off the outside button first.
		const content = document.querySelector<HTMLElement>('[data-testid="popover-dialog-content"]')!;
		expect(content.contains(document.activeElement)).toBe(true);

		await rerender({ open: false });
		await tick();

		expect(document.activeElement).toBe(outside);
		expect(document.activeElement).not.toBe(trigger);
		unmount();
	});
});
