<script lang="ts" module>
	import type { DialogBond } from './bond.svelte';

	export let capturedBond: DialogBond | undefined;

	export function resetCapturedBond() {
		capturedBond = undefined;
	}
</script>

<script lang="ts">
	import { Root } from '$svelte-atoms/core/components/root';
	import { Dialog } from './index';

	function capture(bond: DialogBond | undefined): string {
		capturedBond = bond;
		return '';
	}
</script>

<Root>
	<Dialog.Root open={true}>
		{#snippet children({ dialog }: { dialog: DialogBond | undefined })}
			{capture(dialog)}
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Phase 8 dialog</Dialog.Title>
					<Dialog.Close />
				</Dialog.Header>
				<Dialog.Description>Dialog node migration probe.</Dialog.Description>
				<Dialog.Body>Body</Dialog.Body>
				<Dialog.Footer>Footer</Dialog.Footer>
			</Dialog.Content>
		{/snippet}
	</Dialog.Root>
</Root>
