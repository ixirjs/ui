<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { InputBond, InputState, type InputStateProps } from './bond.svelte';
	import { bondFactory } from '$svelte-atoms/core/shared';
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import type { Factory } from '$svelte-atoms/core/types';
	import type { InputRootProps } from './types';

	let {
		class: klass = '',
		value,
		checked = undefined,
		files = [],
		preset = undefined,
		children = undefined,
		factory = bondFactory(InputState, InputBond),
		...restProps
	}: InputRootProps<E, B> = $props();

	const binding = bindBond<InputBond>(
		(props) => (factory as Factory<InputBond>)(props),
		{
			// Bridge HTML-input prop shapes to the bond's domain props (was loose `defineProperty`).
			value: [() => value as InputStateProps['value'], (v) => { value = v as typeof value; }],
			checked: [() => checked as InputStateProps['checked'], (v) => { checked = v as typeof checked; }],
			files: [() => files as InputStateProps['files'], (v) => { files = [...(v ?? [])]; }]
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();


	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	class={[
		'border-border text-foreground bg-input relative flex h-10 w-auto items-center overflow-hidden rounded-md border',
		'$preset',
		klass
	]}
	{...binding.props}
	{...restProps}
>
	{@render children?.({ input: bond })}
</HtmlAtom>
