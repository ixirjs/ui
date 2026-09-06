import { describe, expect, it } from 'vitest';
import type { Placement, ComputePositionReturn } from '@floating-ui/dom';
import { PopupBond } from './bond.svelte';
import { CollectionItemAtom, menuItem, selectItem } from './item';
import { profiles, type PopupFamily } from './profiles';
import { isSelectBond, isComboboxBond, isDropdownMenuBond, isDatePickerBond } from './types';

function backing() {
	const props = $state({
		id: 'parity',
		open: false,
		disabled: false,
		modal: true,
		placements: [] as Placement[],
		placement: 'bottom' as Placement,
		offset: 2,
		position: 'absolute' as const,
		multiple: false,
		values: [] as string[],
		query: '',
		label: '',
		labels: [] as string[],
		range: [undefined, undefined] as [Date | undefined, Date | undefined]
	});
	return props;
}
const families = Object.keys(profiles) as PopupFamily[];

describe('canonical popup contracts', () => {
	it.each(families)(
		'%s preserves disclosure, live props, callback identity and staging',
		async (family) => {
			const traces: unknown[][] = [];
			for (const create of [
				(props: ReturnType<typeof backing>) => PopupBond.create(family, props)
			]) {
				const props = backing();
				const bond = create(props);
				const trace: unknown[] = [];
				bond.bindCommit((next, context) => {
					props.open = next;
					expect(context.bond).toBe(bond);
					trace.push([next, bond.isOpen, context.reason, context.event?.type]);
				});
				bond.open();
				bond.open();
				bond.toggle();
				props.disabled = true;
				bond.open();
				bond.toggle();
				props.disabled = false;
				const event = new KeyboardEvent('keydown');
				bond.stageOpenChange({ event, reason: 'keyboard' });
				bond.open();
				bond.close();
				bond.stageOpenChange({ reason: 'expired' });
				await Promise.resolve();
				bond.open();
				const first = bond.attachPart('content', 'first');
				const second = bond.attachPart('content', 'second');
				first();
				expect(bond.partId('content')).toBe('second');
				second();
				expect(bond.partId('content')).toBeUndefined();
				expect(bond.name).toBe(family);
				expect(bond.id).toBe('parity');
				traces.push(trace);
				if (bond instanceof PopupBond) bond.dispose();
			}
			expect(traces[0]).toEqual([
				[true, true, undefined, undefined],
				[false, false, undefined, undefined],
				[true, true, 'keyboard', 'keydown'],
				[false, false, undefined, undefined],
				[true, true, undefined, undefined]
			]);
		}
	);

	it('constructs one class and discovers supported capabilities without property-existence checks', () => {
		for (const family of families) {
			const bond = PopupBond.create(family, backing());
			expect(bond).toBeInstanceOf(PopupBond);
			expect(Object.isFrozen(bond.profile)).toBe(true);
			expect(isDropdownMenuBond(bond)).toBe(profiles[family].collection);
			expect(isSelectBond(bond)).toBe(profiles[family].selection);
			expect(isComboboxBond(bond)).toBe(profiles[family].customSelections);
			expect(isDatePickerBond(bond)).toBe(profiles[family].dates);
			if (!isDropdownMenuBond(bond))
				expect(() => Reflect.get(bond, 'roving')).toThrow('No navigation');
			if (!isSelectBond(bond)) expect(() => Reflect.get(bond, 'selection')).toThrow('No selection');
			if (!isComboboxBond(bond)) expect(() => Reflect.get(bond, 'input')).toThrow('No input');
			bond.dispose();
		}
	});

	it.each(['select', 'combobox'] as const)(
		'%s preserves array commands, callback-visible labels/query, and clear-then-close',
		(family) => {
			const traces: unknown[][] = [];
			{
				const state = backing();
				const trace: unknown[] = [];
				const props = {
					...state,
					get values() {
						return state.values;
					},
					set values(next: string[]) {
						state.values = next;
						trace.push(['values', [...next], props.label, props.query]);
					}
				};
				const bond = PopupBond.create(family, props);
				const first = selectItem({ id: 'one', value: 'a', label: 'Alpha' }, bond);
				// Commands and item metadata share one owner.
				bond.registerItem('a', first);
				const second = selectItem({ id: 'two', value: 'b', label: 'Beta' }, bond);
				bond.registerItem('b', second);
				props.multiple = true;
				bond.select(['a', 'b']);
				bond.unselect(['a']);
				trace.push(['labels', [...(props.labels ?? [])]]);
				props.multiple = false;
				props.query = 'filter';
				bond.select(['a']);
				trace.push(['after', props.label, props.query]);
				props.open = true;
				props.query = 'filter';
				bond.onEscape(new KeyboardEvent('keydown'));
				trace.push(['escape', props.open, props.query]);
				bond.onEscape(new KeyboardEvent('keydown'));
				trace.push(['escape', props.open, props.query]);
				traces.push(trace);
				bond.dispose();
			}
			expect(traces[0]?.[0]).toEqual(['values', ['a', 'b'], '', '']);
			expect(traces[0]?.slice(-2)).toEqual([
				['escape', true, ''],
				['escape', false, '']
			]);
		}
	);

	it('preserves data-backed selection and typeahead beyond the mounted window', () => {
		const results = [];
		{
			const props = $state({
				...backing(),
				open: true,
				options: [
					{ id: 'a', label: 'Alpha' },
					{ id: 'z', label: 'Zulu' }
				],
				optionValue: (o: { id: string }) => o.id,
				optionLabel: (o: { label: string }) => o.label
			});
			const bond = PopupBond.create('select', props);
			bond.select(['z']);
			bond.typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'z', cancelable: true }));
			results.push([
				bond.roving.activeId,
				props.label,
				[...bond.navigableItems.keys],
				bond.item('z')
			]);
			props.options = [{ id: 'z', label: 'Updated' }];
			bond.select(['z']);
			expect(props.label).toBe('Updated');
			bond.typeahead.destroy();
		}
		expect(results[0]).toEqual(['z', 'Zulu', ['a', 'z'], undefined]);
	});

	it('preserves independent input fields and freeform selection callbacks', () => {
		const results = [];
		{
			const props = backing();
			const bond = PopupBond.create('combobox', props);
			bond.input.set('filter', 'query');
			bond.input.set('a', 'value');
			expect(props.query).toBe('filter');
			expect(props.values).toEqual(['a']);
			bond.addSelection('Custom');
			results.push([props.label, [...props.labels], bond.userSelections.map((item) => item.label)]);
			bond.userSelections[0]!.unselect();
			expect(props.labels).toEqual([]);
			expect(bond.userSelections).toEqual([]);
		}
	});

	it('renews position promises and preserves writable position/tracking contracts', async () => {
		const position: ComputePositionReturn = {
			x: 12,
			y: 34,
			placement: 'bottom',
			strategy: 'absolute',
			middlewareData: {}
		};
		for (const create of [
			(props: ReturnType<typeof backing>) => PopupBond.create('popover', props)
		]) {
			const props = backing();
			const bond = create(props);
			const pending = bond.computed;
			bond.notifyComputed(position);
			expect(await pending).toEqual(position);
			expect(bond.computed).not.toBe(pending);
			bond.tracking = true;
			expect(bond.shouldTrackPosition).toBe(true);
			bond.tracking = undefined;
			expect(bond.shouldTrackPosition).toBe(false);
			const replacement = Promise.resolve(position);
			bond.computed = replacement;
			expect(bond.computed).toBe(replacement);
		}
	});

	it('shares one handle implementation, preserves owner delegation and protects a replacement registration', () => {
		const bond = PopupBond.create('select', backing());
		const first = selectItem({ id: 'one', value: 'a', data: { count: 1 } }, bond);
		const second = selectItem({ id: 'two', value: 'a' }, bond);
		const menu = menuItem({ id: 'menu' }, PopupBond.create('dropdown-menu', backing()));
		for (const item of [first, second, menu]) expect(item).toBeInstanceOf(CollectionItemAtom);
		expect(first.data).toEqual({ count: 1 });
		const detachFirst = bond.registerItem('a', first);
		const detachSecond = bond.registerItem('a', second);
		detachFirst();
		expect(bond.item('a')).toBe(second);
		first.select();
		expect(bond.props.values).toEqual(['a']);
		second.toggle();
		expect(bond.props.values).toEqual([]);
		detachSecond();
		expect(bond.items.size).toBe(0);
		bond.dispose();
	});

	it('does not let delayed disclosure work commit after root disposal', async () => {
		const props = backing();
		const bond = PopupBond.create('popover', props);
		let commits = 0;
		bond.bindCommit((next) => {
			props.open = next;
			commits++;
		});
		const late = Promise.resolve().then(() => {
			bond.stageOpenChange({ reason: 'late' });
			bond.open();
		});
		bond.dispose();
		await late;
		expect(commits).toBe(0);
		expect(props.open).toBe(false);
		expect(bond.takeOpenChangeContext()).toEqual({});
	});

	it('clears buffered work and registrations on disposal', () => {
		const bond = PopupBond.create('dropdown-menu', { ...backing(), open: true });
		bond.registerItem('a', menuItem({ id: 'a' }, bond));
		bond.typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'a' }));
		expect(bond.typeahead.buffer).toBe('a');
		bond.dispose();
		bond.dispose();
		expect(bond.typeahead.buffer).toBe('');
		expect(bond.items.size).toBe(0);
	});

	it('delegates display through the public date formatter', () => {
		const props = { ...backing(), value: new Date(2026, 6, 2) };
		for (const bond of [PopupBond.create('date-picker', props)]) {
			bond.formatDate = (date) => String(date.getFullYear());
			expect(bond.formattedValue).toBe('2026');
		}
	});

	it('preserves single/range dates, formatting, coupled clearing and sub-picker disclosures', () => {
		const results = [];
		const first = new Date(2026, 6, 2),
			second = new Date(2026, 6, 5);
		{
			const state = $state({
				start: undefined as Date | undefined,
				end: undefined as Date | undefined
			});
			const props = {
				...backing(),
				type: 'range' as const,
				format: 'yyyy-MM-dd',
				get start() {
					return state.start;
				},
				set start(value: Date | undefined) {
					state.start = value;
				},
				get end() {
					return state.end;
				},
				set end(value: Date | undefined) {
					state.end = value;
				},
				get range(): [Date | undefined, Date | undefined] {
					return [state.start, state.end];
				},
				set range(value: [Date | undefined, Date | undefined]) {
					[state.start, state.end] = value;
				}
			};
			const bond = PopupBond.create('date-picker', props);
			bond.open();
			bond.selectDate(first);
			expect(bond.isOpen).toBe(true);
			bond.selectDate(second);
			results.push([bond.formattedValue, bond.hasValue, bond.isOpen]);
			bond.toggleYearsPicker();
			bond.openMonthsPicker();
			expect(bond.isYearsPickerOpen && bond.isMonthsPickerOpen).toBe(true);
			bond.closeYearsPicker();
			bond.toggleMonthsPicker();
			expect(bond.isYearsPickerOpen || bond.isMonthsPickerOpen).toBe(false);
			bond.clear();
			expect([state.start, state.end]).toEqual([undefined, undefined]);
		}
		expect(results[0]).toEqual(['2026-07-02 - 2026-07-05', true, false]);
	});
});
