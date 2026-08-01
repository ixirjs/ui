<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import { Popover } from '$ixirjs/ui/components/popover';
	import { ZLayer } from '$ixirjs/ui/components/portal';

	function legacyAnchor(name: string, value: number) {
		return (_node: HTMLElement) => ZLayer.anchor(name, () => value);
	}
</script>

<Root>
	<div {@attach legacyAnchor('sticky-header', 5)}>Header</div>
	<Popover.Root open={true}>
		<Popover.Trigger>Open</Popover.Trigger>
		<Popover.Content order={{ below: 'sticky-header' }}>Panel</Popover.Content>
	</Popover.Root>
</Root>
