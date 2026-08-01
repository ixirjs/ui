<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { StackBond } from './bond.svelte';
	import type { StackRootProps } from './types';
	import './stack.css';

	const ID = $props.id();

	let {
		value = $bindable<string | undefined>(undefined),
		class: klass = '',
		preset = undefined,
		factory = undefined,
		onvaluechange = undefined,
		children,
		...restProps
	}: StackRootProps<E, B> = $props();

	const valueProp = controlledProp<string | undefined, StackBond>({
		get: () => value,
		set: (next) => (value = next),
		onchange: (next, context) => onvaluechange?.(next, context)
	});

	const root = useRoot(
		StackBond,
		{
			value: valueProp
		},
		{
			// `stack.root` is the fallback preset key, not `atom.preset` — keep the existing selection.
			preset: () => preset ?? 'stack.root',
			id: () => ID,
			factory: () => factory
		}
	);
	const bond = root.bond;

	export function getBond() {
		return bond;
	}

	const el = usePartElement(root, () => ({
		class: ['stack-root', '$preset', klass],
		...root.props,
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({})}
{/snippet}

{@render partElement(el, body)}
