<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { AccordionBond } from '$ixirjs/ui/components/accordion/bond.svelte';
	import type { StateChangeCallback } from '$ixirjs/ui/types';
	import {
		controlledDisclosure,
		createDisclosureBond,
		DisclosureContext,
		type DisclosureBond,
		type DisclosureOptions,
		type DisclosurePort
	} from './bond';
	import Parts from '$ixirjs/ui/test/prototypes/disclosure/disclosure-parts.test.svelte';

	const ID = $props.id();
	let {
		mode = 'standalone',
		open = $bindable(false),
		values = $bindable<string[]>([]),
		multiple = false,
		collapsible = false,
		disabled = false,
		native = false,
		onclick = undefined,
		onopenchange = undefined,
		factory = createDisclosureBond
	}: {
		mode?: 'standalone' | 'grouped';
		open?: boolean;
		values?: string[];
		multiple?: boolean;
		collapsible?: boolean;
		disabled?: boolean;
		native?: boolean;
		onclick?: ((event: MouseEvent) => void) | undefined;
		onopenchange?: StateChangeCallback<boolean, DisclosureBond>;
		factory?: (options: DisclosureOptions) => DisclosureBond;
	} = $props();

	// Only ownership shape is fixed at init. All state and policy inputs remain live.
	const grouped = untrack(() => mode === 'grouped');
	const parent = grouped
		? AccordionBond.create({
				get values() {
					return values;
				},
				get multiple() {
					return multiple;
				},
				get collapsible() {
					return collapsible;
				},
				get disabled() {
					return disabled;
				}
			})
		: undefined;
	parent?.bindCommit((next) => {
		values = next;
	});

	// The parent keeps its real policy, including toggle != explicit close.
	const state: DisclosurePort = parent
		? {
				get: () => parent.isValueOpen('item'),
				set: (next) => (next ? parent.open(['item']) : parent.close(['item'])),
				toggle: () => parent.toggle('item')
			}
		: controlledDisclosure(
				{
					get: () => open,
					set: (next) => {
						open = next;
					}
				},
				() => bond,
				(next, context) => onopenchange?.(next, context)
			);
	const bond: DisclosureBond = DisclosureContext.share(
		untrack(() => factory)({
			name: grouped ? 'accordion-item' : 'collapsible',
			seed: grouped ? 'item' : ID,
			state,
			disabled: () => disabled
		})
	);
	export const getBond = () => bond;
	export const getParent = () => parent;

	const root = Kernel.element(() => ({}), {
		preset: 'collapsible',
		class: 'border-border flex w-full flex-col overflow-hidden',
		state: bond,
		attrs: () => ({ id: bond.partId('root') })
	});
</script>

<div {...root.attrs}><Parts {native} {onclick} /></div>
