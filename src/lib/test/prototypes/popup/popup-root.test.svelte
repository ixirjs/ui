<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { PopupBond, PopupContext } from './bond.svelte';
	import type { PopupProfile, PopupProps } from './types';
	import Parts from '$ixirjs/ui/test/prototypes/popup/popup-parts.test.svelte';

	const ID = $props.id();
	let {
		profile = 'select',
		open = $bindable(false),
		values = $bindable<string[]>([]),
		query = $bindable(''),
		disabled = false,
		multiple = false,
		closeOnSelect = undefined,
		placement = 'bottom-start',
		offset = 2,
		options = [
			{ value: 'apple', label: 'Apple' },
			{ value: 'blocked', label: 'Blocked', disabled: true },
			{ value: 'pear', label: 'Pear' }
		],
		mountedValues = undefined,
		onopenchange = undefined,
		onvalueschange = undefined,
		onactivate = undefined
	}: Partial<Omit<PopupProps, 'id'>> & {
		profile?: PopupProfile;
		mountedValues?: readonly string[];
	} = $props();

	// A profile is chosen once. There is no family-specific class or setup implementation.
	const bond = PopupContext.share(
		PopupBond.create(
			untrack(() => profile),
			{
				id: ID,
				get open() {
					return open;
				},
				set open(next) {
					open = next;
				},
				get values() {
					return values;
				},
				set values(next) {
					values = next ?? [];
				},
				get query() {
					return query;
				},
				set query(next) {
					query = next ?? '';
				},
				get disabled() {
					return disabled;
				},
				get multiple() {
					return multiple;
				},
				get closeOnSelect() {
					return closeOnSelect ?? !multiple;
				},
				get options() {
					return options;
				},
				get placement() {
					return placement;
				},
				get offset() {
					return offset;
				},
				onopenchange: (next, context) => onopenchange?.(next, context),
				onvalueschange: (next, context) => onvalueschange?.(next, context),
				onactivate: (value, context) => onactivate?.(value, context)
			}
		)
	);
	onDestroy(() => bond.dispose());
	export const getBond = () => bond;

	// A mount/unmount test seam, not a scrolling/virtualization implementation.
	const renderedValues = $derived(mountedValues ?? options.map((option) => option.value));
</script>

<Parts values={renderedValues} />
