<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { controlledProp, useRoot } from '@ixirjs/ui/shared';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { CollapsibleBond } from './bond.svelte';
	import type { CollapsibleRootProps } from './types';

	const ID = $props.id();

	let {
		open = $bindable(false),
		class: klass = '',
		preset = undefined,
		value,
		data = undefined,
		disabled = false,
		factory = undefined,
		onopenchange = undefined,
		children = undefined,
		...restProps
	}: CollapsibleRootProps<E, B> = $props();

	const openProp = controlledProp<boolean, CollapsibleBond>({
		get: () => open,
		set: (value) => (open = value),
		onchange: (value, context) => onopenchange?.(value, context)
	});

	const root = useRoot(
		CollapsibleBond,
		{
			open: openProp,
			data: () => data,
			disabled: () => disabled,
			value: () => value
		},
		{
			preset: () => preset,
			id: () => ID,
			factory: () => factory
		}
	);
	const bond = root.bond;

	export function getBond() {
		return bond;
	}

	const el = usePartElement(root, () => ({
		class: ['border-border flex w-full flex-col overflow-hidden', '$preset', klass],
		...root.props,
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({ collapsible: bond })}
{/snippet}

{@render partElement(el, body)}
