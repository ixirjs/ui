<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import type { QRCodeBrowser } from '@qrcode-js/browser';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import type { QRCodeProps } from './types';

	type Render = typeof QRCodeBrowser;

	let {
		class: klass = '',
		preset = undefined,
		value = '',
		finder = {
			round: 0.5
		},
		dots = {
			scale: 0.75,
			round: 1
		},
		drawFunction = 'telegram',
		gradient = undefined,
		logo = undefined,
		margin = undefined,
		qr = undefined,
		...restProps
	}: QRCodeProps = $props();

	let canvasElement: HTMLCanvasElement | undefined = $state();

	let clientWidth = $state(0);
	let isReady = $state(false);
	let render: Render | undefined = $state();
	let computedColor = $state('black');

	const qrCodeProps = $derived(mergePresetProps(preset, 'qr-code', restProps));

	import('@qrcode-js/browser').then((result) => {
		render = result.QRCodeBrowser;
	});

	$effect(() => {
		if (!canvasElement) return;
		if (!render) return;
		if (!isReady) return;

		computedColor = getComputedStyle(canvasElement).color;

		const qrcode = render(canvasElement);

		qrcode.setOptions({
			text: value,
			size: clientWidth,
			color: computedColor,
			dots,
			finder,
			drawFunction,
			...(gradient && { gradient }),
			...(margin && { margin }),
			...(logo && { logo }),
			...(qr && { qr })
		});

		qrcode.draw();
	});

	// Element seam instead of a component boundary; key order matches the previous call exactly.
	const el = Kernel.element(Kernel.static, () => ({
		class: ['$preset', klass],
		...qrCodeProps
	}));
</script>

{@render Kernel.render(el)(el, qrCodeBody)}

{#snippet qrCodeBody()}
	<div bind:clientWidth class="size-full">
		<canvas
			{@attach (node) => {
				canvasElement = node;
				isReady = true;
			}}
			width={clientWidth}
			height={clientWidth}
		></canvas>
	</div>
{/snippet}
