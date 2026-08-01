<script lang="ts">
	import { HtmlAtom, mergePresetProps } from '$ixirjs/ui/components/atom';
	import type { SwatchProps } from './types';

	let { class: klass = '', color = '', preset = undefined, ...restProps }: SwatchProps = $props();

	const isEmpty = $derived(!color.trim());
	const swatchProps = $derived(mergePresetProps(preset, 'swatch', restProps));
</script>

<HtmlAtom
	as="span"
	role="img"
	aria-label={isEmpty ? 'No color' : `Color: ${color}`}
	title={color || undefined}
	class={['swatch', '$preset', klass]}
	{...swatchProps}
>
	<span aria-hidden="true" class="checkerboard absolute inset-[0.5px] rounded-inherit"></span>
	{#if !isEmpty}
		<span aria-hidden="true" class="fill absolute -inset-px" style="background-color: {color};"
		></span>
	{/if}
</HtmlAtom>

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
