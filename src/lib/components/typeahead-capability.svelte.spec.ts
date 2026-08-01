import { describe, expect, it, vi } from 'vitest';
import { DropdownMenuBond, type DropdownMenuItem } from './dropdown-menu/bond.svelte';
import { SelectBond } from './select/bond.svelte';
import { TYPEAHEAD, type TypeaheadSurface } from '../shared/capability/models/typeahead.svelte';

function key(surface: TypeaheadSurface, value: string) {
	return surface.handleKeydown({
		key: value,
		defaultPrevented: false,
		altKey: false,
		ctrlKey: false,
		metaKey: false,
		preventDefault: vi.fn()
	} as unknown as KeyboardEvent);
}

function item(label: string) {
	return {
		label,
		props: { label },
		element: null
	} as unknown as DropdownMenuItem;
}

function overlayProps(open: boolean) {
	return {
		open,
		disabled: false,
		placements: [],
		placement: undefined,
		offset: 0,
		position: 'absolute' as const
	};
}

describe('menu/select typeahead capability', () => {
	it('is registered by dropdown menu bond and moves its roving item', () => {
		const bond = DropdownMenuBond.create(overlayProps(true));
		bond.registerItem('alpha', item('Alpha'));
		bond.registerItem('bravo', item('Bravo'));

		const surface = bond.require(TYPEAHEAD);
		expect(key(surface, 'b')).toBe('bravo');
		expect(bond.roving.activeId).toBe('bravo');
	});

	it('is inherited by select bond and respects the overlay enabled guard', () => {
		const bond = SelectBond.create(overlayProps(false));
		bond.registerItem('alpha', item('Alpha'));
		bond.registerItem('bravo', item('Bravo'));

		const surface = bond.require(TYPEAHEAD);
		expect(key(surface, 'b')).toBeNull();
		expect(bond.roving.activeId).toBeNull();

		bond.props.open = true;
		expect(key(surface, 'b')).toBe('bravo');
		expect(bond.roving.activeId).toBe('bravo');
	});
});
