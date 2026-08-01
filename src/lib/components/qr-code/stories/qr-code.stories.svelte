<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import QrCodeComponent from '$ixirjs/ui/components/qr-code/qr-code.svelte';

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
		<QrCodeComponent class="text-primary-foreground bg-primary size-64 rounded-2xl p-1" {...args} />
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

<!-- Real-world: a guest WiFi card. The value is a standard WIFI: connection string. -->
<Story name="Guest WiFi">
	<div class="border-border bg-card w-72 rounded-2xl border p-6 text-center shadow-sm">
		<h3 class="text-foreground text-base font-semibold">Guest WiFi</h3>
		<p class="text-muted-foreground mt-1 text-sm">Scan with your camera to connect</p>
		<QrCodeComponent
			class="text-foreground bg-card mx-auto my-5 size-44"
			value="WIFI:S:AtomsCafe;T:WPA;P:welcome123;;"
		/>
		<dl class="text-muted-foreground space-y-1 text-xs">
			<div class="flex justify-between">
				<dt>Network</dt>
				<dd class="text-foreground font-medium">AtomsCafe</dd>
			</div>
			<div class="flex justify-between">
				<dt>Password</dt>
				<dd class="text-foreground font-medium">welcome123</dd>
			</div>
		</dl>
	</div>
</Story>

<!-- The same component encodes any string — a URL or arbitrary text. -->
<Story name="Content">
	<div class="flex flex-wrap items-start justify-center gap-6">
		<div class="flex flex-col items-center gap-2">
			<QrCodeComponent
				class="text-primary-foreground bg-primary size-48 rounded-2xl p-1"
				value="https://svelte.dev"
			/>
			<code class="text-muted-foreground text-xs font-mono">URL</code>
		</div>
		<div class="flex flex-col items-center gap-2">
			<QrCodeComponent
				class="text-foreground bg-card size-48 rounded-2xl border p-1"
				value="Hello World 123"
			/>
			<code class="text-muted-foreground text-xs font-mono">Plain text</code>
		</div>
	</div>
</Story>
