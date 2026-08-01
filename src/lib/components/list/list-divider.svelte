<script lang="ts">
	import { mergePresetProps } from '$svelte-atoms/core/components/atom';
	import { Divider } from '$svelte-atoms/core/components/divider';
	import { cn, toClassValue } from '$svelte-atoms/core/utils';

	let { class: klass = '', preset = undefined, vertical = false, children = undefined, ...restProps } = $props();

	const dividerProps = $derived(mergePresetProps(preset, 'list.divider', restProps));
</script>

<Divider
	class={cn(!vertical && 'my-1', vertical && 'mx-1', toClassValue(klass, {}))}
	{vertical}
	{...dividerProps}
/>
