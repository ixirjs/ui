<script lang="ts" module>
	import type { ContextMenuBond } from './bond.svelte';

	export let capturedBond: ContextMenuBond | undefined;

	export function resetCapturedBond() {
		capturedBond = undefined;
	}
</script>

<script lang="ts">
	import { Root } from '$svelte-atoms/core/components/root';
	import { ContextMenu } from './index';

	function capture(bond: unknown): string {
		capturedBond = bond as ContextMenuBond;
		return '';
	}
</script>

<Root>
	<ContextMenu.Root open={true}>
		{#snippet children({ popover }: { popover: unknown })}
			{capture(popover)}
			<ContextMenu.Trigger>Open</ContextMenu.Trigger>
			<ContextMenu.Content>
				<ContextMenu.Item>Copy</ContextMenu.Item>
			</ContextMenu.Content>
		{/snippet}
	</ContextMenu.Root>
</Root>
