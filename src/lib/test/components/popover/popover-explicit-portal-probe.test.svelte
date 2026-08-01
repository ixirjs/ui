<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import { Popover } from '$ixirjs/ui/components/popover';
	import { Portal } from '$ixirjs/ui/components/portal';
</script>

<Root>
	<Portal.Outer id="explicit">
		<Portal.Inner class="explicit-portal-sink" style="width: 1px; height: 1px;" />
	</Portal.Outer>

	<Popover.Root open={true} portal="explicit">
		<Popover.Trigger style="margin-left: 200px;">Open</Popover.Trigger>
		<Popover.Content>Panel</Popover.Content>
	</Popover.Root>
</Root>
