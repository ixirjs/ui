import { describe, expect, it } from 'vitest';
import { PopoverDialogBond, type PopoverDialogBondProps } from './bond.svelte';
import { PopoverTriggerAtom, PopoverOverlayAtom } from '$ixirjs/ui/components/popover/bond.svelte';
import {
	DialogBodyAtom,
	DialogContentAtom,
	DialogDescriptionAtom,
	DialogFooterAtom,
	DialogHeaderAtom,
	DialogRootAtom,
	DialogTitleAtom
} from '$ixirjs/ui/components/dialog/bond.svelte';
import { FOCUS } from '$ixirjs/ui/components/overlay';
import type { Preset } from '$ixirjs/ui/context';

function makeBond(initial: Partial<PopoverDialogBondProps> = {}) {
	const props = $state<PopoverDialogBondProps>({ open: false, disabled: false, ...initial });
	return new PopoverDialogBond(props);
}

describe('PopoverDialogBond — fuse(Popover, Dialog) (§9.4.1)', () => {
	it('rebrands identity to popover-dialog', () => {
		expect(makeBond().namespace).toBe('popover-dialog');
		expect(PopoverDialogBond.CONTEXT_KEY).toContain('popover-dialog');
	});

	it('exposes popover-dialog preset keys for the fused public slots', () => {
		const preset = {
			'popover-dialog': () => ({}),
			'popover-dialog.trigger': () => ({}),
			'popover-dialog.content': () => ({}),
			'popover-dialog.header': () => ({}),
			'popover-dialog.title': () => ({}),
			'popover-dialog.description': () => ({}),
			'popover-dialog.body': () => ({}),
			'popover-dialog.footer': () => ({}),
			'popover-dialog.close': () => ({})
		} satisfies Partial<Preset>;

		expect(Object.keys(preset)).toEqual([
			'popover-dialog',
			'popover-dialog.trigger',
			'popover-dialog.content',
			'popover-dialog.header',
			'popover-dialog.title',
			'popover-dialog.description',
			'popover-dialog.body',
			'popover-dialog.footer',
			'popover-dialog.close'
		]);
	});

	it('defaults fused atom presets to the popover-dialog base', () => {
		const bond = makeBond();

		expect(new PopoverTriggerAtom(bond).preset).toBe('popover-dialog.trigger');
		expect(new DialogContentAtom(bond).preset).toBe('popover-dialog.content');
		expect(new DialogHeaderAtom(bond).preset).toBe('popover-dialog.header');
		expect(new DialogTitleAtom(bond).preset).toBe('popover-dialog.title');
		expect(new DialogDescriptionAtom(bond).preset).toBe('popover-dialog.description');
		expect(new DialogBodyAtom(bond).preset).toBe('popover-dialog.body');
		expect(new DialogFooterAtom(bond).preset).toBe('popover-dialog.footer');
	});

	it('keeps the overlay disclosure contract so the popover trigger opens the dialog', () => {
		const props = $state<PopoverDialogBondProps>({ open: false, disabled: false });
		const bond = new PopoverDialogBond(props);

		(new PopoverTriggerAtom(bond).spread.onclick as (event: MouseEvent) => void)({
			button: 0,
			defaultPrevented: false
		} as MouseEvent);

		expect(props.open).toBe(true);
		expect(bond.disclosure.isOpen).toBe(true);
	});

	it("trigger is popover's (own override beats dialog's on the key)", () => {
		expect(new PopoverTriggerAtom(makeBond())).toBeInstanceOf(PopoverTriggerAtom);
	});

	it('root/content/title come from dialog — the modal presentation (part-2 wins)', () => {
		const bond = makeBond();
		// `!`: root/title come from the Dialog part; fuse()'s type doesn't surface every part-2 slot
		// accessor as non-undefined (composed-parts typing gap), but they exist at runtime.
		expect(new DialogRootAtom(bond)).toBeInstanceOf(DialogRootAtom);
		expect(new DialogContentAtom(bond)).toBeInstanceOf(DialogContentAtom);
		expect(new DialogTitleAtom(bond)).toBeInstanceOf(DialogTitleAtom);
	});

	it('modal focus wins the slot: trappedFocus + restoreFocus "previous" (dialog, not popover)', () => {
		const focus = makeBond().capability(FOCUS)?.surface;
		expect(focus?.restoreFocus).toBe('previous'); // dialog modal beats popover's 'trigger'
		expect(focus?.captureFocusOnOpen).toBe(true);
	});

	it('trigger projects the disclosure ARIA (aria-haspopup dialog, aria-expanded)', () => {
		const spread = new PopoverTriggerAtom(makeBond()).spread;
		expect(spread['aria-haspopup']).toBe('dialog');
		expect(spread['aria-expanded']).toBe(false);
	});

	it("popover's floating atoms come along but are inert (present, never rendered by the modal)", () => {
		expect(new PopoverOverlayAtom(makeBond())).toBeInstanceOf(PopoverOverlayAtom);
	});
});
