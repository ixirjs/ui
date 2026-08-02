<script
	lang="ts"
	generics="D extends string, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { onMount } from 'svelte';
	import { TabsBond } from './bond.svelte';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import type { TabsRootProps } from './types';

	const ID = $props.id();

	let {
		class: klass = '',
		value = $bindable(),
		children,
		onvaluechange = undefined,
		onchange = undefined,
		preset = undefined,
		presets = undefined,
		...restProps
	}: TabsRootProps<D, E, B> = $props();

	let callbacksReady = false;
	const valueProp = controlledProp<string | undefined, TabsBond>({
		get: () => value,
		set: (next) => (value = next as D | undefined),
		onchange: (next, context) => onvaluechange?.(next as D | undefined, context),
		notifyWhen: () => callbacksReady
	});

	const root = useRoot(
		TabsBond,
		{ value: valueProp, presets: () => presets },
		{
			preset: () => preset,
			id: () => ID
		}
	);
	const bond = root.bond;
	onMount(() => {
		callbacksReady = true;
	});

	export function getBond() {
		return bond;
	}

	const el = usePartElement(root, () => ({
		class: ['flex w-full flex-1 flex-col', '$preset', klass],
		variantProps: root.props,
		...restProps,
		onchange
	}));
</script>

{@render partElement(el, children, { tabs: bond })}
