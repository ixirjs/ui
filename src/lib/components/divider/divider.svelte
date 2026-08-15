<script>
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';

	let {
		class: klass = '',
		preset = undefined,
		as = 'div',
		vertical = false,
		transparent = false,
		...restProps
	} = $props();

	const dividerProps = $derived(mergePresetProps(preset, 'divider', restProps));

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const el = Kernel.element(Kernel.static, () => ({
		as,
		class: [
			'atoms-ui divider border-border',
			transparent && 'bg-transparent',
			!vertical && 'my-6 w-full border-b',
			vertical && 'mx-6 h-full border-r',
			!vertical && 'mx-0',
			vertical && 'my-0',
			'$preset',
			klass
		],
		...dividerProps
	}));
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), undefined, undefined, el.motion(), el)}
