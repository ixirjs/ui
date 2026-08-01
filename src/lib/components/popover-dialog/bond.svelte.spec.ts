import { describe, expect, it } from 'vitest';
import { PopoverDialogBond, type PopoverDialogBondProps } from './bond.svelte';
import { PopoverTriggerAtom, PopoverOverlayAtom } from '../popover/bond.svelte';
import { DialogContentAtom, DialogRootAtom, DialogTitleAtom } from '../dialog/bond.svelte';
import { FOCUS } from '$svelte-atoms/core/components/portal/host';

function makeBond(initial: Partial<PopoverDialogBondProps> = {}) {
	const props = $state<PopoverDialogBondProps>({ open: false, disabled: false, ...initial });
	return new PopoverDialogBond(props);
}

describe('PopoverDialogBond — fuse(Popover, Dialog) (§9.4.1)', () => {
	it('rebrands identity to popover-dialog', () => {
		expect(makeBond().namespace).toBe('popover-dialog');
		expect(PopoverDialogBond.CONTEXT_KEY).toContain('popover-dialog');
	});

	it("trigger is popover's (own override beats dialog's on the key)", () => {
		expect(makeBond().trigger()).toBeInstanceOf(PopoverTriggerAtom);
	});

	it('root/content/title come from dialog — the modal presentation (part-2 wins)', () => {
		const bond = makeBond();
		// `!`: root/title come from the Dialog part; fuse()'s type doesn't surface every part-2 slot
		// accessor as non-undefined (composed-parts typing gap), but they exist at runtime.
		expect(bond.root?.()).toBeInstanceOf(DialogRootAtom);
		expect(bond.content?.()).toBeInstanceOf(DialogContentAtom);
		expect(bond.title?.()).toBeInstanceOf(DialogTitleAtom);
	});

	it('modal focus wins the slot: trappedFocus + restoreFocus "previous" (dialog, not popover)', () => {
		const focus = makeBond().state.capability(FOCUS)?.surface;
		expect(focus?.restoreFocus).toBe('previous'); // dialog modal beats popover's 'trigger'
		expect(focus?.captureFocusOnOpen).toBe(true);
	});

	it('trigger projects the disclosure ARIA (aria-haspopup dialog, aria-expanded)', () => {
		const spread = makeBond().trigger().spread;
		expect(spread['aria-haspopup']).toBe('dialog');
		expect(spread['aria-expanded']).toBe(false);
	});

	it("popover's floating atoms come along but are inert (present, never rendered by the modal)", () => {
		expect(makeBond().overlay?.()).toBeInstanceOf(PopoverOverlayAtom);
	});
});
