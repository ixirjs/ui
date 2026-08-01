<script
	lang="ts"
	generics="D extends string, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { onMount } from 'svelte';
	import { TabsBond, type TabsBondProps } from './bond.svelte';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
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
			id: () => ID,
			factory: (props) => defaultFactory(props)
		}
	);
	const bond = root.bond;
	onMount(() => {
		callbacksReady = true;
	});

	function defaultFactory(props: TabsBondProps) {
		return TabsBond.create(props);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	class={['flex w-full flex-1 flex-col', '$preset', klass]}
	{...root.props}
	{...restProps}
	part={root}
	{onchange}
>
	{@render children?.({ tabs: bond })}
</HtmlAtom>
