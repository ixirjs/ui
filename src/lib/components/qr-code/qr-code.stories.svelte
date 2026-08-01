<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import QrCodeComponent from './qr-code.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/QR Code',
		parameters: { layout: 'centered' },
		args: {
			value: 'https://example.com'
		},
		argTypes: {
			value: {
				control: 'text',
				description: 'The text or URL to encode in the QR code — edit it to regenerate live'
			}
		}
	});
</script>

<script lang="ts">
	// The module/finder SHAPE is controlled by the `dots` and `finder` options
	// (`round`: 0 = square … 1 = circular; `scale`: module fill). Same value, different look.
	const dotStyles = [
		{ label: 'Square', dots: { scale: 1, round: 0 }, finder: { round: 0 } },
		{ label: 'Soft', dots: { scale: 0.85, round: 0.5 }, finder: { round: 0.35 } },
		{ label: 'Dots', dots: { scale: 0.75, round: 1 }, finder: { round: 0.5 } },
		{ label: 'Fluid', dots: { scale: 1, round: 1 }, finder: { round: 1 } }
	];
</script>

<Story name="Basic">
	{#snippet template(args)}
		<QrCodeComponent
			class="text-primary-foreground bg-primary size-64 rounded-2xl p-1"
			{...args}
		/>
	{/snippet}
</Story>

<!--
	Module Styles: the `dots` and `finder` options reshape each module without
	changing the encoded value. `round` morphs squares → circles; `scale` sets fill.
-->
<Story name="Module Styles">
	<div class="flex flex-wrap items-start justify-center gap-6">
		{#each dotStyles as style (style.label)}
			<div class="flex flex-col items-center gap-2">
				<QrCodeComponent
					class="text-primary-foreground bg-primary size-36 rounded-xl p-1"
					value="https://svelte.dev"
					dots={style.dots}
					finder={style.finder}
				/>
				<code class="text-muted-foreground text-xs font-mono">{style.label}</code>
			</div>
		{/each}
	</div>
</Story>

<Story name="URL">
	<QrCodeComponent
		class="text-primary-foreground bg-primary size-64 rounded-2xl p-1"
		value="https://svelte.dev"
	/>
</Story>

<Story name="Plain Text">
	<QrCodeComponent
		class="text-primary-foreground bg-primary size-64 rounded-2xl p-1"
		value="Hello World 123"
	/>
</Story>

<Story name="Neutral">
	<QrCodeComponent
		class="text-foreground bg-card size-64 rounded-2xl p-1 border"
		value="https://example.com"
	/>
</Story>

<Story name="Large">
	<QrCodeComponent
		class="text-primary-foreground bg-primary size-96 rounded-2xl p-2"
		value="https://example.com"
	/>
</Story>
