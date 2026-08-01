<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import { Popover } from '$ixirjs/ui/components/popover';
	import { ZLayer } from '$ixirjs/ui/components/portal';

	new ZLayer('modal', () => 0).share();
</script>

<Root>
	<Popover.Root open={true}>
		<Popover.Trigger>Open</Popover.Trigger>
		<Popover.Content>Panel</Popover.Content>
	</Popover.Root>
</Root>
