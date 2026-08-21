<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import {
		mergeAtomProps,
		type RenderProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';
	import { createAtomInstance } from '$ixirjs/ui/shared/bond';
	import { StackBond } from './bond.svelte';
	import { untrack } from 'svelte';

	const bond = StackBond.getOrThrow('Stack.Item must be used within a Stack.Root component.');

	let {
		class: klass = '',
		preset = undefined,
		value,
		children,
		style: userStyle = '',
		...restProps
	}: RenderProps<E, B> & { value: string } & BasePropsOf<B> = $props();

	$effect.pre(() => {
		if (!bond) return;
		if (value == null) return;

		bond.registerItem(value);

		return () => {
			bond.unregisterItem(value);
		};
	});

	const zIndex = $derived(bond?.getZIndex(value) ?? 0);

	const atom = createAtomInstance(
		untrack(() => `item:${value}`),
		{
			bond,
			factory: (owner) => owner!.item(value),
			// The atom names itself `item-<value>`; registration keeps the `item:` key it always had.
			register: { key: untrack(() => `item:${value}`) }
		}
	);

	const itemProps = $derived({
		...mergeAtomProps(atom, preset ?? 'stack.item', restProps),
		// Append the atom's z-index to any user-supplied style.
		style: userStyle ? `${userStyle}; z-index: ${zIndex}` : `z-index: ${zIndex}`
	});

	const isActive = $derived(bond?.props.value === value);

	// `mergeAtomProps` already folded the Atom spread into `itemProps`, so Kernel must not read it twice.
	const el = Kernel.element(
		{ atom: undefined, bond: undefined, preset: undefined, presetLayer: undefined },
		() => ({
			class: ['stack-item', '$preset', klass],
			'data-value': value,
			'data-active': isActive,
			...itemProps
		})
	);
</script>

{@render Kernel.render(el)(el, children)}
