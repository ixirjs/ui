<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import { Portal } from '$ixirjs/ui/components/portal';
	import DialogRoot from '$ixirjs/ui/components/dialog/dialog-root.svelte';

	let {
		firstOpen = true,
		secondOpen = true,
		firstDisabled = false,
		firstType = 'modal'
	}: {
		firstOpen?: boolean;
		secondOpen?: boolean;
		firstDisabled?: boolean;
		firstType?: 'modal' | 'non-modal';
	} = $props();
</script>

<Root>
	<Portal.Outer id="local">
		<Portal.Inner data-testid="dialog-local-sink">
			<div data-testid="dialog-local-background">local background</div>
		</Portal.Inner>
	</Portal.Outer>
	<div data-testid="dialog-outside-local">outside local portal</div>

	<DialogRoot
		as="section"
		portal="local"
		open={firstOpen}
		disabled={firstDisabled}
		type={firstType}
		data-testid="dialog-first"
	>
		{#snippet children()}first{/snippet}
	</DialogRoot>
	<DialogRoot portal="local" open={secondOpen} data-testid="dialog-second">
		{#snippet children()}second{/snippet}
	</DialogRoot>
</Root>
