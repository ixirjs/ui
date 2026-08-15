<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import type { BadgeProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		as = 'span',
		children = undefined,
		...restProps
	}: BadgeProps = $props();

	const badgeProps = $derived(mergePresetProps(preset, 'badge', restProps));

	const el = Kernel.element(Kernel.static, () => ({
		class: [
			'bg-foreground/10 border-border text-foreground inline-flex h-auto w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
			'$preset',
			klass
		],
		as,
		...badgeProps
	}));
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), children, undefined, el.motion(), el)}
