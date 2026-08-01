<script
	lang="ts"
	generics="D extends string, E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import { TabsBond, TabsRootAtom, type TabsBondProps } from './bond.svelte';
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { HtmlAtom, mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import type { TabsRootProps } from './types';

	let {
		class: klass = '',
		value = $bindable(),
		children,
		onchange,
		preset = undefined,
		...restProps
	}: TabsRootProps<D, E, B> = $props();

	let valueState = $derived<D | undefined>(value as D | undefined);

	const binding = bindBond<TabsBond>(
		(props) => defaultFactory(props),
		{
			value: [
				() => valueState,
				(v) => {
					valueState = v as D | undefined;
					value = valueState;
				}
			]
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();
	const rootAtom = createAtomInstance<TabsRootAtom, TabsBond>('root', {
		bond,
		factory: (owner) => new TabsRootAtom(owner as TabsBond)
	});
	const rootProps = $derived(
		mergeAtomProps(rootAtom, preset, { ...binding.stateProps, ...restProps })
	);

	function defaultFactory(props: TabsBondProps) {
		return TabsBond.create(props);
	}

	$effect.pre(() => {
		onchange?.(valueState as D);
	});

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom class={['flex w-full flex-1 flex-col', '$preset', klass]} {...rootProps}>
	{@render children?.({ tabs: bond })}
</HtmlAtom>
