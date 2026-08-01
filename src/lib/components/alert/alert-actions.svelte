<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { AlertBond } from './bond.svelte';
	import type { AlertActionsProps } from './types';

	type Element = HTMLElementTagNameMap[E];

	const bond = AlertBond.get();

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertActionsProps<E, B> & HTMLAttributes<Element> = $props();

	const actionsProps = $derived(mergePresetProps(preset, 'alert.actions', { ...bond?.actions(), ...restProps }));
</script>

<HtmlAtom
	{bond}
	class={['alert-actions border-border mt-3 flex items-center gap-2', '$preset', klass]}
	{...actionsProps}
>
	{@render children?.({ alert: bond! })}
</HtmlAtom>
