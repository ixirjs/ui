<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import type { KbdProps } from './types';

	let { class: klass = '', preset = undefined, children, ...restProps }: KbdProps = $props();

	const kbdProps = $derived(mergePresetProps(preset, 'kbd', restProps));

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const el = Kernel.element(Kernel.static, () => ({
		as: 'kbd',
		class: [
			'kbd border-border bg-muted text-foreground inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 font-mono text-xs font-medium shadow-[inset_0_-1px_0] shadow-black/10',
			'$preset',
			klass
		],
		...kbdProps
	}));
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), children, undefined, el.motion(), el)}
