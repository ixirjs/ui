<script lang="ts" generics="T = string">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { RadioGroupBond, RadioGroupContext } from './bond.svelte';
	import type { RadioGroupProps } from './types';

	const ID = $props.id();

	let {
		disabled = false,
		readonly = false,
		required = false,
		name = undefined,
		value = $bindable(),
		onvaluechange = undefined,
		children = undefined,
		...restProps
	}: RadioGroupProps<T> = $props();

	// Live props: the Bond reads through these getters, and writes the selected value through the
	// setter — `select()` owns the callback order, so the write is not a separate commit.
	const bondProps = {
		get id() {
			return ID;
		},
		get value() {
			return value;
		},
		set value(next: T | undefined) {
			value = next;
		},
		get disabled() {
			return disabled;
		},
		get readonly() {
			return readonly;
		},
		get required() {
			return required;
		},
		get name() {
			return name;
		},
		get onvaluechange() {
			return onvaluechange;
		}
	};
	const bond = RadioGroupBond.create<T>(bondProps);
	RadioGroupContext.share(bond as RadioGroupBond<unknown>);
	export const getBond = () => bond;

	const el = Kernel.element(() => restProps, {
		preset: 'radio.group',
		class: 'flex flex-col gap-1',
		state: bond
	});
</script>

<div {...el.attrs}>{@render children?.({})}</div>
