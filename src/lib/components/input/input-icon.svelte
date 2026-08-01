<script lang="ts">
	import { Icon, type IconProps } from '$ixirjs/ui/components/icon';

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
		'flex aspect-square h-full items-center justify-center bg-transparent text-sm leading-0 size-4 p-0',
		'$preset',
		klass
	]}
	{...restProps}
>
	{@render children?.({})}
</Icon>
