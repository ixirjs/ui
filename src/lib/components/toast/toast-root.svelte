<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { ToastBond } from './bond.svelte';
	import type { ToastRootProps } from './types';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';

	const ID = $props.id();

	let {
		open = $bindable(true),
		disabled = false,
		duration = 0,
		dismissible = true,
		preset = undefined,
		factory = undefined,
		children = undefined,
		onopenchange = undefined,
		...restProps
	}: ToastRootProps<E, B> = $props();

	const openProp = controlledProp<boolean, ToastBond>({
		get: () => open,
		set: (value) => (open = value),
		onchange: (value, context) => onopenchange?.(value, context),
		context: (bond) => bond.takeOpenChangeContext()
	});

	const root = useRoot(
		ToastBond,
		{
			open: openProp,
			disabled: () => disabled,
			dismissible: () => dismissible,
			duration: () => duration
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
		// This part declares no base classes; `''` is exactly HtmlAtom's own `class` default.
		class: '',
		...root.props,
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({ toast: bond })}
{/snippet}

{@render partElement(el, body)}
