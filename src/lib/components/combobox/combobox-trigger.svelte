<script lang="ts" generics="E extends HtmlElementTagName = 'button', B extends Base = Base">
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import { Trigger } from '$ixirjs/ui/components/select/atoms';
	import { ComboboxContext } from './bond.svelte';
	import type { ComboboxTriggerProps } from './types';

	const bond = ComboboxContext.getOrThrow('ComboboxTrigger must be used within a Combobox');

	let {
		class: klass = '',
		as = 'button' as E,
		preset = undefined,
		children = undefined,
		...restProps
	}: ComboboxTriggerProps<E, B> & BasePropsOf<B> = $props();
</script>

<Trigger
	{as}
	preset={preset ?? 'combobox.trigger'}
	class={['border-border h-8 w-40', '$preset', klass]}
	onclick={(ev: Event) => {
		// Preventing the default skips the trigger's own toggle; a combobox trigger only opens.
		ev.preventDefault();
		bond.open();
	}}
	{...restProps}
>
	{@render children?.({ combobox: bond })}
</Trigger>
