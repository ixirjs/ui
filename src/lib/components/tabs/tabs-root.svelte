<script
	lang="ts"
	generics="D extends string, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { TabsBond, TabsBondState, type TabsBondProps } from './bond.svelte';
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import { HtmlAtom as Atom, type Base } from '$svelte-atoms/core/components/atom';
	import type { TabsRootProps } from './types';

	let {
		class: klass = '',
		value = $bindable(),
		children,
		onchange,
		preset = undefined,
		...restProps
	}: TabsRootProps<D, E, B> = $props();

	let revision = $state(0);

	const binding = bindBond<TabsBond>(
		(props) => defaultFactory(props),
		{
			value: [
				() => {
					void revision; // Ensure reactivity in uncontrolled mode
					return value;
				},
				(v) => {
					value = v as D | undefined;
					revision++; // Trigger reactivity in uncontrolled mode
				}
			]
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();

	function defaultFactory(props: TabsBondProps) {
		const tabsState = new TabsBondState(props);
		return new TabsBond(tabsState);
	}

	$effect.pre(() => {
		onchange?.(value as D);
	});

	export function getBond() {
		return bond;
	}
</script>

<Atom
	class={['flex w-full flex-1 flex-col', '$preset', klass]}
	{...binding.props}
	{...restProps}
>
	{@render children?.({ tabs: bond })}
</Atom>
