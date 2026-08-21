<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import type { ButtonProps } from './types';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';

	let {
		class: klass = '',
		type = 'button',
		preset = undefined,
		children = undefined,
		...restProps
	}: ButtonProps = $props();

	// Keep the rest-props proxy intact: `type` is passed separately, after this spread, so the
	// semantic default and an explicit caller value both win over preset attributes.
	const buttonProps = $derived(mergePresetProps(preset, 'button', restProps));

	// Object-literal order preserves presentation and attribute precedence.
	const el = Kernel.element(Kernel.static, () => ({
		as: 'button',
		class: [
			'button border-border disabled:bg-muted disabled:text-muted-foreground w-fit cursor-pointer rounded-md px-3 py-2 transition-colors duration-200',
			'$preset',
			klass
		],
		...buttonProps,
		type
	}));
</script>

{@render Kernel.render(el)(el, children)}
