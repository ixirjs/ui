<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type HtmlAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { StackBond } from './bond.svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ElementType } from '$svelte-atoms/core/components/atom';

	type Element = ElementType<E>;

	const bond = StackBond.getOrThrow('Stack.Item must be used within a Stack.Root component.');

	let {
		class: klass = '',
		preset = undefined,
		value,
		children,
		style: userStyle = '',
		...restProps
	}: HtmlAtomProps<E, B> & HTMLAttributes<Element> & { value: string } = $props();

	$effect.pre(() => {
		if(!bond) return;

		bond.state.register(value)

		return () => {
			bond.state.unregister(value)
		};
	});

	const zIndex = $derived(bond?.state.getZIndex(value) ?? 0);

	// `value` is reactive and `item(value)` is keyed by it, so the atom must be
	// derived — a plain const would freeze it to the initial value's atom.
	const atom = $derived(bond?.item(value));

	const itemProps = $derived({
		preset: preset ?? 'stack.item',
		...atom?.spread,
		...restProps,
		// Append the atom's z-index to any user-supplied style.
		style: userStyle ? `${userStyle}; z-index: ${zIndex}` : `z-index: ${zIndex}`
	});

	const isActive = $derived(bond?.state.props.value === value);
</script>

<HtmlAtom
	class={['stack-item', '$preset', klass]}
	data-value={value}
	data-active={isActive}
	{...itemProps}
>
	{@render children?.()}
</HtmlAtom>
