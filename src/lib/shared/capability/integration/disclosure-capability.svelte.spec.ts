import { describe, expect, it, vi } from 'vitest';
import {
	DISCLOSURE,
	DISCLOSURE_CLOSE,
	DISCLOSURE_TRIGGER
} from '$ixirjs/ui/shared/capability/models/disclosure.svelte';
import { CollapsibleBond } from '$ixirjs/ui/components/collapsible/bond.svelte';
import { TreeBond } from '$ixirjs/ui/components/tree/bond.svelte';
import { ToastBond, ToastCloseAtom } from '$ixirjs/ui/components/toast/bond.svelte';
import { DialogBond, DialogCloseAtom } from '$ixirjs/ui/components/dialog/bond.svelte';
import { DrawerBond, DrawerBackdropAtom } from '$ixirjs/ui/components/drawer/bond.svelte';
import { PopoverBond, type PopoverStateProps } from '$ixirjs/ui/components/popover/bond.svelte';
import { SidebarBond } from '$ixirjs/ui/components/sidebar/bond.svelte';
import { BACKDROP_PRESS, OUTSIDE_PRESS } from '$ixirjs/ui/components/overlay';

function popoverProps(initial: Partial<PopoverStateProps> = {}): PopoverStateProps {
	return {
		open: false,
		disabled: false,
		placements: [],
		placement: undefined,
		offset: 0,
		position: 'absolute',
		...initial
	};
}

describe('disclosureCapability call sites', () => {
	it('collapsible registers the disclosure model separately from trigger/content linkage', () => {
		const props = $state({ open: false, disabled: false });
		const bond = CollapsibleBond.create(props);

		expect(bond.capability(DISCLOSURE)?.surface).toBe(bond.disclosure);
		expect(bond.capability(DISCLOSURE)?.meta).toMatchObject({});
	});

	it('tree registers the disclosure model separately from trigger/content linkage', () => {
		const props = $state({ open: false, disabled: false });
		const bond = TreeBond.create(props);

		expect(bond.capability(DISCLOSURE)?.surface).toBe(bond.disclosure);
	});

	it('toast registers disclosure through its bond capability factory', () => {
		const props = $state({ open: false, disabled: false });
		const bond = ToastBond.create(props);

		expect(bond.capability(DISCLOSURE)?.surface).toBe(bond.disclosure);
	});

	it('overlay bonds and states register disclosure at the shared overlay base', () => {
		const dialogProps = $state({ open: false, disabled: false });
		const drawerProps = $state({ open: false, disabled: false });
		const popoverStateProps = $state(popoverProps());
		const dialog = DialogBond.create(dialogProps);
		const drawer = DrawerBond.create(drawerProps);
		const popover = PopoverBond.create(popoverStateProps);

		expect(dialog.capability(DISCLOSURE)?.surface).toBe(dialog.disclosure);
		expect(drawer.capability(DISCLOSURE)?.surface).toBe(drawer.disclosure);
		expect(popover.capability(DISCLOSURE)?.surface).toBe(popover.disclosure);
	});

	it('sidebar registers disclosure on its disclosure-backed state', () => {
		const props = $state({ open: false, disabled: false, reversed: false, extend: {} });
		const bond = SidebarBond.create(props);

		expect(bond.capability(DISCLOSURE)?.surface).toBe(bond.disclosure);
	});
});

describe('disclosure activation call sites', () => {
	it('collapsible registers trigger activation through the disclosure activation policy', () => {
		const props = $state({ open: false, disabled: false });
		const bond = CollapsibleBond.create(props);

		expect(bond.capability(DISCLOSURE_TRIGGER)?.meta).toMatchObject({
			projects: ['trigger']
		});
	});

	it('tree registers trigger activation through the disclosure activation policy', () => {
		const props = $state({ open: false, disabled: false });
		const bond = TreeBond.create(props);

		expect(bond.capability(DISCLOSURE_TRIGGER)?.meta).toMatchObject({
			projects: ['trigger']
		});
	});

	it('toast dismiss closes through the disclosure close policy', () => {
		const props = $state({ open: true, disabled: true });
		const bond = ToastBond.create(props);
		const stopPropagation = vi.fn();

		(new ToastCloseAtom(bond).role('close').spread.onclick as (ev: MouseEvent) => void)({
			button: 0,
			defaultPrevented: false,
			stopPropagation
		} as unknown as MouseEvent);
		expect(props.open).toBe(false);
		expect(stopPropagation).toHaveBeenCalled();
	});

	it('dialog close buttons close through the disclosure close policy', () => {
		const props = $state({ open: true, disabled: false });
		const bond = DialogBond.create(props);

		expect(bond.capability(DISCLOSURE_CLOSE)?.meta).toMatchObject({
			projects: ['close']
		});

		(new DialogCloseAtom(bond).spread.onclick as (ev: MouseEvent) => void)({
			button: 0,
			defaultPrevented: false
		} as unknown as MouseEvent);
		expect(props.open).toBe(false);
	});
});

describe('dismissal capability call sites', () => {
	it('drawer backdrop closes through the backdrop press policy', () => {
		const props = $state({ open: true, disabled: false });
		const bond = DrawerBond.create(props);

		expect(bond.capability(BACKDROP_PRESS)?.meta).toMatchObject({
			projects: ['backdrop']
		});

		(new DrawerBackdropAtom(bond).spread.onclick as (ev: MouseEvent) => void)({
			button: 0,
			defaultPrevented: false,
			target: document.createElement('div')
		} as unknown as MouseEvent);
		expect(props.open).toBe(false);
	});

	it('popover registers outside press dismissal through the positioned overlay bundle', () => {
		const props = $state(popoverProps({ open: true }));
		const bond = PopoverBond.create(props);

		expect(bond.capability(OUTSIDE_PRESS)?.meta).toMatchObject({});
		expect(bond.surface(OUTSIDE_PRESS)?.handle).toEqual(expect.any(Function));
	});
});
