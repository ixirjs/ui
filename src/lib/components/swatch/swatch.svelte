<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import type { SwatchProps } from './types';

	let { class: klass = '', color = '', preset = undefined, ...restProps }: SwatchProps = $props();

	const isEmpty = $derived(!color.trim());
	const swatchProps = $derived(mergePresetProps(preset, 'swatch', restProps));

	// Element seam instead of a component boundary. The inline children move into a local
	// snippet because the seam takes a body rather than markup — Svelte compiled them to a
	// `children` snippet for the component call anyway, so the shape is unchanged.
	const el = Kernel.element(Kernel.static, () => ({
		as: 'span',
		role: 'img',
		'aria-label': isEmpty ? 'No color' : `Color: ${color}`,
		title: color || undefined,
		class: ['swatch', '$preset', klass],
		...swatchProps
	}));
</script>

{@render Kernel.render(el)(el, swatchBody)}

{#snippet swatchBody()}
	<span aria-hidden="true" class="checkerboard absolute inset-[0.5px] rounded-inherit"></span>
	{@render (!isEmpty ? fill : undefined)?.()}
{/snippet}

<!-- Keep this local declaration at template top level; a snippet inside component children becomes a prop. -->
{#snippet fill()}
	<span aria-hidden="true" class="fill absolute -inset-px" style="background-color: {color};"
	></span>
{/snippet}

<style>
	:global(.swatch) {
		position: relative;
		display: inline-block;
		flex-shrink: 0;
		overflow: hidden;
		isolation: isolate;
		/* Background fills the anti-aliased edge gap at rounded corners */
		background-color: color-mix(in oklch, var(--foreground) 5%, transparent);
	}

	.checkerboard {
		background-image:
			repeating-conic-gradient(
				color-mix(in oklch, var(--foreground) 100%, transparent) 0% 25%,
				transparent 0% 50%
			),
			repeating-conic-gradient(
				color-mix(in oklch, var(--foreground) 100%, transparent) 0% 25%,
				transparent 0% 50%
			);
		background-size:
			8px 8px,
			8px 8px;
		background-position:
			0 0,
			4px 4px;
		mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 40%, transparent 100%);
		-webkit-mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 40%, transparent 100%);
	}
</style>
