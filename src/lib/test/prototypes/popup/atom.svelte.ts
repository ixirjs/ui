import { createAttachmentKey } from 'svelte/attachments';
import { Kernel, type KernelElement } from '$ixirjs/ui/kernel/kernel.svelte';
import { disclosureTrigger } from '$ixirjs/ui/test/prototypes/disclosure/parts';
import { isDropdownMenuBond, isSelectBond } from './bond.svelte';
import type {
	DropdownMenuItemAtom,
	DropdownMenuBond,
	PopoverBond,
	ComboboxBond,
	ComboboxQueryAtom,
	PopupBonds,
	PopupContentAtoms,
	PopupProfile,
	PopupTriggerAtoms
} from './types';

const emptyProps = () => ({});

function activeDomId(bond: DropdownMenuBond): string | undefined {
	// Only role containers track mounts; individual items read the full option source.
	void bond.mountedCount;
	const active = bond.navigation.activeId;
	return active === null ? undefined : bond.mountedItem(active)?.id;
}

function popupKeydown(bond: PopoverBond) {
	return (event: KeyboardEvent) => {
		if (event.defaultPrevented || bond.isDisabled || !bond.isOpen) return;
		bond.escape(event);
		if (event.defaultPrevented || !isDropdownMenuBond(bond)) return;
		if (event.key === 'ArrowDown') bond.navigation.next();
		else if (event.key === 'ArrowUp') bond.navigation.previous();
		else if (event.key === 'Home') bond.navigation.first();
		else if (event.key === 'End') bond.navigation.last();
		else if (event.key === 'Enter' || event.key === ' ') {
			// Text input owns Space; Enter can commit the currently highlighted option.
			if (event.key === ' ' && event.target instanceof HTMLInputElement) return;
			const value = bond.navigation.activeId;
			if (value !== null) bond.activate(value, { event, reason: 'item' });
		} else {
			// Editable query input owns printable characters, not menu typeahead.
			if (!(event.target instanceof HTMLInputElement)) bond.typeahead.handleKeydown(event);
			return;
		}
		event.preventDefault();
	};
}

/** One part implementation per role, returning the existing Kernel element itself. */
export const PopupAtom = {
	trigger<P extends PopupProfile>(
		bond: PopupBonds[P],
		props: () => Record<string, unknown> = emptyProps
	): PopupTriggerAtoms[P] {
		const trigger = disclosureTrigger(bond, {
			id: bond.partId('trigger'),
			controls: () => bond.partId('content'),
			activation: () => 'native-button'
		});
		return Kernel.element(props, {
			preset: 'popover.trigger',
			class: 'border-border',
			state: bond,
			attrs: () => ({
				...trigger.attrs(),
				'aria-haspopup': isSelectBond(bond)
					? 'listbox'
					: isDropdownMenuBond(bond)
						? 'menu'
						: 'dialog'
			})
		});
	},
	content<P extends PopupProfile>(
		bond: PopupBonds[P],
		props: () => Record<string, unknown> = emptyProps
	): PopupContentAtoms[P] {
		const onkeydown = popupKeydown(bond);
		return Kernel.element(props, {
			preset: 'popover.content',
			class: 'border-border',
			state: bond,
			attrs: () => {
				const activeId = isDropdownMenuBond(bond) ? activeDomId(bond) : undefined;
				return {
					id: bond.partId('content'),
					role: isSelectBond(bond) ? 'listbox' : isDropdownMenuBond(bond) ? 'menu' : 'dialog',
					'aria-label': 'Options',
					'aria-multiselectable': isSelectBond(bond)
						? bond.selection.mode === 'multiple'
						: undefined,
					'aria-activedescendant': activeId,
					hidden: !bond.isOpen,
					inert: !bond.isOpen || bond.isDisabled ? true : undefined,
					tabindex: 0,
					onkeydown
				};
			}
		});
	},
	query(bond: ComboboxBond): ComboboxQueryAtom {
		const onkeydown = popupKeydown(bond);
		return Kernel.element(emptyProps, {
			class: 'border-border',
			state: bond,
			attrs: () => ({
				id: bond.partId('query'),
				role: 'combobox',
				'aria-label': 'Query',
				'aria-autocomplete': 'list',
				'aria-expanded': bond.isOpen,
				'aria-controls': bond.partId('content'),
				'aria-activedescendant': activeDomId(bond),
				disabled: bond.isDisabled || undefined,
				value: bond.input.get('query'),
				oninput: (event: Event) =>
					bond.input.set((event.currentTarget as HTMLInputElement).value, 'query'),
				onkeydown
			})
		});
	},
	item(
		item: DropdownMenuItemAtom,
		props: () => Record<string, unknown> = emptyProps
	): KernelElement {
		const cleanupKey = createAttachmentKey();
		const attach = () => () => item.dispose();
		return Kernel.element(props, {
			preset: 'list.item',
			class: 'border-border',
			state: item,
			attrs: () => ({ ...item.attrs, [cleanupKey]: attach })
		});
	}
};
