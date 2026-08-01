<script lang="ts">
	import type { Placement } from '@floating-ui/dom';
	import { Root } from '$ixirjs/ui/components/root';
	import { Popover } from '$ixirjs/ui/components/popover';

	let {
		placement = 'right',
		tailPadding = undefined,
		borderWidth = 0
	}: { placement?: Placement; tailPadding?: number; borderWidth?: number } = $props();

	const contentStyle = $derived(
		`overflow: visible; border-style: solid; border-color: black; border-width: ${borderWidth}px;`
	);
</script>

<Root>
	<div class="flex h-60 w-96 items-center justify-center">
		<Popover.Root open={true} {placement} placements={[placement]} offset={0}>
			<Popover.Trigger style="width: 80px; height: 40px;">Trigger</Popover.Trigger>
			<Popover.Content class="border-0 p-0 shadow-none" style={contentStyle}>
				<div style="width: 60px; height: 30px;">Panel</div>
				<Popover.Tail padding={tailPadding} />
			</Popover.Content>
		</Popover.Root>
	</div>
</Root>

<style>
	:global([data-kind='popover-tail']) {
		position: absolute;
	}
</style>
