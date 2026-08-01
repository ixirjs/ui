<script lang="ts">
	import { Icon, type IconProps } from '$svelte-atoms/core/components/icon';

	let {
		class: klass = '',
		preset = 'input.icon',
		children = undefined,
		...restProps
	}: IconProps = $props();
</script>

<Icon
	{preset}
	class={[
		'flex aspect-square h-full items-center justify-center bg-transparent text-sm leading-0',
		'$preset',
		klass
	]}
	{...restProps}
>
	{@render children?.({})}
</Icon>
