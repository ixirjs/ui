import { page, userEvent } from '@vitest/browser/context';
import { flushSync } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Fixture from '$ixirjs/ui/test/prototypes/popup/popup-root.test.svelte';
import { PopupBond, isComboboxBond, isDropdownMenuBond, isSelectBond } from './bond.svelte';
import { CollectionItemAtom } from './item';
import type { ComboboxBond, PopoverBond, PopupProfile, PopupProps } from './types';

const options = [
	{ value: 'apple', label: 'Apple' },
	{ value: 'blocked', label: 'Blocked', disabled: true },
	{ value: 'pear', label: 'Pear' }
];
const profiles: PopupProfile[] = ['popover', 'dropdown-menu', 'select', 'combobox'];

// The browser test library types component exports as the component constructor.
function bondOf(component: unknown): PopoverBond {
	return (component as { getBond(): PopoverBond }).getBond();
}
function makeProps(extra: Partial<PopupProps> = {}): PopupProps {
	return { id: 'seed', open: true, options, values: [], query: '', ...extra };
}

describe('canonical popup Bond and item', () => {
	it('uses one runtime class and constructs only the profile capabilities', () => {
		const bonds = profiles.map((profile) => {
			const props = $state(makeProps());
			return PopupBond.create(profile, props);
		});
		for (const bond of bonds) expect(bond).toBeInstanceOf(PopupBond);
		expect(() => Reflect.get(bonds[0]!, 'navigation')).toThrow('no navigation');
		expect(() => Reflect.get(bonds[0]!, 'selection')).toThrow('no selection');
		expect(() => Reflect.get(bonds[1]!, 'selection')).toThrow('no selection');
		expect(() => Reflect.get(bonds[2]!, 'input')).toThrow('no input');
		for (const bond of bonds) {
			if (isDropdownMenuBond(bond)) {
				const item = bond.item('apple');
				expect(item).toBeInstanceOf(CollectionItemAtom);
				expect(Object.getPrototypeOf(item)).toBe(CollectionItemAtom.prototype);
				item.dispose();
			}
		}
		expect(isComboboxBond(bonds[3]!)).toBe(true);
	});

	it('keeps navigation, labels and selection independent of mounted items', () => {
		const props = $state(makeProps());
		const bond = PopupBond.create('select', props);
		const item = bond.item('apple');
		bond.select('pear');
		expect(bond.navigation.last()).toBe('pear');
		expect(bond.navigation.activeItem?.label).toBe('Pear');
		expect(bond.mountedItem('pear')).toBeUndefined();
		expect(bond.labels).toEqual(['Pear']);
		item.dispose();
		expect(bond.mountedCount).toBe(0);
		expect(bond.selection.values).toEqual(['pear']);
		expect(bond.navigation.activeId).toBe('pear');
		props.options = [{ value: 'pear', label: 'Updated' }];
		expect(bond.labels).toEqual(['Updated']);
		expect(bond.navigation.first()).toBe('pear');
	});

	it('orchestrates selection, input synchronization, notification and close once', () => {
		const props = $state(makeProps({ query: 'filter' }));
		const trace: string[] = [];
		const bond: ComboboxBond = PopupBond.create('combobox', props);
		const event = new MouseEvent('click');
		props.onvalueschange = (next, context) => {
			expect(next).toEqual(['pear']);
			expect(bond.labels).toEqual(['Pear']);
			expect(bond.input.get('query')).toBe('pear');
			expect(context).toEqual({ bond, event, reason: 'item' });
			trace.push('selection');
		};
		props.onactivate = () => trace.push('activate');
		props.onopenchange = (next, context) => {
			expect(next).toBe(false);
			expect(context.bond).toBe(bond);
			trace.push('close');
		};
		bond.item('pear').activate({ event, reason: 'item' });
		expect(trace).toEqual(['selection', 'activate', 'close']);
		bond.select('pear');
		expect(trace).toHaveLength(3);
	});

	it('keeps multi-selection open and routes direct model mutations through validation', () => {
		const props = $state(makeProps({ multiple: true }));
		const bond = PopupBond.create('select', props);
		bond.activate('apple');
		bond.activate('pear');
		expect(bond.selection.values).toEqual(['apple', 'pear']);
		expect(bond.isOpen).toBe(true);
		bond.selection.select('blocked');
		bond.selection.select('missing');
		expect(bond.selection.values).toEqual(['apple', 'pear']);
		bond.activate('apple');
		expect(bond.selection.values).toEqual(['pear']);
		props.disabled = true;
		bond.selection.clear();
		expect(bond.selection.values).toEqual(['pear']);
		bond.close();
		bond.open();
		expect(bond.isOpen).toBe(false);
	});

	it('does not close on rejected selection or leak context after a thrown callback', () => {
		let reject = true;
		const state = $state({ values: [] as string[] });
		const notify = vi.fn();
		const props: PopupProps = {
			...makeProps(),
			get values() {
				return state.values;
			},
			set values(next) {
				if (!reject) state.values = next ?? [];
			},
			onvalueschange: notify
		};
		const bond = PopupBond.create('select', props);
		bond.activate('pear', { reason: 'rejected' });
		expect(bond.isOpen).toBe(true);
		expect(notify).not.toHaveBeenCalled();
		reject = false;
		notify.mockImplementationOnce(() => {
			throw new Error('consumer');
		});
		expect(() => bond.select('pear', { reason: 'throw' })).toThrow('consumer');
		bond.unselect('pear');
		expect(notify).toHaveBeenLastCalledWith([], { bond });
	});

	it('guards duplicate data/registrations and makes old teardown harmless after remount', () => {
		const props = $state(makeProps());
		const bond = PopupBond.create('select', props);
		const first = bond.item('apple');
		expect(() => bond.item('apple')).toThrow('Already mounted');
		expect(() => bond.item('missing')).toThrow('Unknown');
		first.dispose();
		const second = bond.item('apple');
		first.dispose();
		first.activate();
		expect(bond.mountedItem('apple')).toBe(second);
		expect(bond.selection.values).toEqual([]);
		expect(first.id).toBe(second.id);
		props.options = [...options, options[0]!];
		expect(() => bond.navigation.first()).toThrow('Duplicate popup option');
		second.dispose();
	});

	it('does not reread owner-wide option data per child registration', () => {
		const data = $state(
			Array.from({ length: 400 }, (_, i) => ({ value: String(i), label: String(i) }))
		);
		let reads = 0;
		const props = makeProps();
		Object.defineProperty(props, 'options', {
			get() {
				reads++;
				return data;
			}
		});
		const bond = PopupBond.create('select', props);
		bond.navigation.first();
		const initial = reads;
		const items = data.map(({ value }) => bond.item(value));
		for (const item of items) void item.attrs;
		expect(reads).toBe(initial);
		expect(bond.mountedCount).toBe(400);
		for (const item of items) item.dispose();
		expect(bond.mountedCount).toBe(0);
	});

	it('typeaheads over unmounted data and disposes buffered work with the owner', () => {
		const props = $state(makeProps());
		const bond = PopupBond.create('select', props);
		bond.item('apple');
		const event = new KeyboardEvent('keydown', { key: 'p', cancelable: true });
		expect(bond.typeahead.handleKeydown(event)).toBe('pear');
		expect(bond.mountedItem('pear')).toBeUndefined();
		expect(bond.typeahead.buffer).toBe('p');
		expect(event.defaultPrevented).toBe(true);
		bond.dispose();
		expect(bond.typeahead.buffer).toBe('');
		expect(bond.mountedCount).toBe(0);
		expect(() => bond.item('apple')).toThrow('disposed');
	});

	it('provides real floating-position calculations through the common interface', async () => {
		const bond = PopupBond.create('popover', makeProps());
		const reference = document.createElement('button');
		const content = document.createElement('div');
		document.body.append(reference, content);
		try {
			const position = await bond.positioning.compute(reference, content);
			expect(Number.isFinite(position.x) && Number.isFinite(position.y)).toBe(true);
			expect(position.placement).toBeTruthy();
		} finally {
			reference.remove();
			content.remove();
		}
	});
});

describe('canonical popup Atom rendering', () => {
	it.each(profiles)('renders %s with shared parts and correct roles', async (profile) => {
		const fixture = render(Fixture, { profile });
		const bond = bondOf(fixture.component);
		await page.getByRole('button', { name: 'Open' }).click();
		expect(bond.isOpen).toBe(true);
		const role =
			profile === 'popover' ? 'dialog' : profile === 'dropdown-menu' ? 'menu' : 'listbox';
		const content = fixture.container.querySelector(`[role="${role}"]`)!;
		expect(content.id).toBe(bond.partId('content'));
		expect(fixture.container.querySelector('button')?.getAttribute('aria-controls')).toBe(
			content.id
		);
		if (isDropdownMenuBond(bond)) {
			expect(bond.mountedCount).toBe(3);
			await page.getByRole(isSelectBond(bond) ? 'option' : 'menuitem', { name: 'Pear' }).click();
			expect(bond.isOpen).toBe(false);
			if (isSelectBond(bond)) expect(bond.selection.values).toEqual(['pear']);
		}
		fixture.unmount();
		if (isDropdownMenuBond(bond)) expect(bond.mountedCount).toBe(0);
	});

	it('skips disabled items and commits keyboard selection', async () => {
		const fixture = render(Fixture, { profile: 'select', open: true });
		const bond = bondOf(fixture.component);
		if (!isSelectBond(bond)) throw new Error('Expected SelectBond');
		fixture.container.querySelector<HTMLElement>('[role="listbox"]')!.focus();
		await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
		expect(bond.selection.values).toEqual(['pear']);
		expect(bond.isOpen).toBe(false);
		fixture.unmount();
	});

	it('routes printable menu input to typeahead, not query input', async () => {
		const menu = render(Fixture, { profile: 'dropdown-menu', open: true });
		const bond = bondOf(menu.component);
		if (!isDropdownMenuBond(bond)) throw new Error('Expected collection');
		menu.container.querySelector<HTMLElement>('[role="menu"]')!.focus();
		await userEvent.keyboard('p');
		expect(bond.navigation.activeId).toBe('pear');
		menu.unmount();
		expect(bond.typeahead.buffer).toBe('');
		const combobox = render(Fixture, { profile: 'combobox', open: true });
		const editable = bondOf(combobox.component);
		if (!isComboboxBond(editable)) throw new Error('Expected Combobox');
		combobox.container.querySelector<HTMLInputElement>('input')!.focus();
		await userEvent.keyboard('p ');
		expect(editable.input.get('query')).toBe('p ');
		expect(editable.typeahead.buffer).toBe('');
		expect(editable.selection.values).toEqual([]);
		combobox.unmount();
	});

	it('clears the Combobox query before closing on the second Escape', async () => {
		const fixture = render(Fixture, { profile: 'combobox', open: true, query: 'filter' });
		const bond = bondOf(fixture.component);
		if (!isComboboxBond(bond)) throw new Error('Expected ComboboxBond');
		fixture.container.querySelector<HTMLInputElement>('input')!.focus();
		await userEvent.keyboard('{Escape}');
		expect(bond.input.get('query')).toBe('');
		expect(bond.isOpen).toBe(true);
		await userEvent.keyboard('{Escape}');
		expect(bond.isOpen).toBe(false);
		fixture.unmount();
	});

	it('only references mounted active descendants and retains offscreen selection', async () => {
		const fixture = render(Fixture, { profile: 'select', open: true, mountedValues: ['apple'] });
		const bond = bondOf(fixture.component);
		if (!isSelectBond(bond)) throw new Error('Expected SelectBond');
		const content = fixture.container.querySelector('[role="listbox"]')!;
		flushSync(() => bond.navigation.goto('pear'));
		expect(content.hasAttribute('aria-activedescendant')).toBe(false);
		await fixture.rerender({ mountedValues: ['pear'] });
		expect(content.getAttribute('aria-activedescendant')).toBe(bond.itemId('pear'));
		flushSync(() => bond.select('pear'));
		await fixture.rerender({ mountedValues: [] });
		expect(content.hasAttribute('aria-activedescendant')).toBe(false);
		expect(bond.selection.values).toEqual(['pear']);
		expect(bond.labels).toEqual(['Pear']);
		fixture.unmount();
	});
});
