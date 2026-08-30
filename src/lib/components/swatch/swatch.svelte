<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { SwatchProps } from './types';

	let { color = '', ...restProps }: SwatchProps = $props();

	const isEmpty = $derived(!color.trim());

	const el = Kernel.element(() => restProps, {
		preset: 'swatch',
		class: 'swatch',
		as: 'span',
		attrs: () => ({
			role: 'img',
			'aria-label': isEmpty ? 'No color' : `Color: ${color}`,
			title: color || undefined
		})
	});
	// Dispatches rather than writing a literal `<span>`: this component owns a scoped style block
	// (`.checkerboard`), and Svelte stamps its scope hash onto any spread-bearing element in the
	// template. The leaf renders the element from Kernel's module, so the hash stays off it.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, swatchBody)}

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
