<script lang="ts">
	import { Dialog } from '$ixirjs/ui/components/dialog';
	import { Drawer } from '$ixirjs/ui/components/drawer';
	import { Popover } from '$ixirjs/ui/components/popover';
	import { Select } from '$ixirjs/ui/components/select';
	import { Root } from '$ixirjs/ui/components/root';
	import type { DialogBond } from '$ixirjs/ui/components/dialog/bond.svelte';
	import type { PopoverBond } from '$ixirjs/ui/components/popover/bond.svelte';

	let dialog = $state<{ getBond(): DialogBond }>();
	let nested = $state<{ getBond(): PopoverBond }>();
	let first = $state<{ getBond(): PopoverBond }>();
	let second = $state<{ getBond(): PopoverBond }>();

	export function bonds() {
		return {
			dialog: dialog?.getBond(),
			nested: nested?.getBond(),
			first: first?.getBond(),
			second: second?.getBond()
		};
	}
</script>

<Root>
	<Dialog.Root bind:this={dialog} open={true}>
		<Dialog.Content>
			<Popover.Root bind:this={nested} open={true}>
				<Popover.Trigger>Nested trigger</Popover.Trigger>
				<Popover.Content>Nested content</Popover.Content>
			</Popover.Root>
		</Dialog.Content>
	</Dialog.Root>

	<Drawer.Root open={true}>
		<Drawer.Content>
			<Select.Root open={true} keys={['ada']}>
				{#snippet children()}
					<Select.Trigger>Choose</Select.Trigger>
					<Select.Content><Select.Item value="ada">Ada</Select.Item></Select.Content>
				{/snippet}
			</Select.Root>
		</Drawer.Content>
	</Drawer.Root>

	<Popover.Root bind:this={first} open={true}>
		<Popover.Trigger>First trigger</Popover.Trigger>
		<Popover.Content>First content</Popover.Content>
	</Popover.Root>
	<Popover.Root bind:this={second} open={true}>
		<Popover.Trigger>Second trigger</Popover.Trigger>
		<Popover.Content>Second content</Popover.Content>
	</Popover.Root>
</Root>
