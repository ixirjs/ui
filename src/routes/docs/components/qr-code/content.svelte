<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import { qRCodeProps } from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'QRCode', presetKey: 'qr-code', props: qRCodeProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Basic QrCode"
			description="Encode a short-lived pairing token for a phone to scan."
			{...ex('./examples/basic.svelte')}
		/>
	{/snippet}
</DocComponentPage>
