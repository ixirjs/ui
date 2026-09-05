<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import { Popover } from '$ixirjs/ui/components/popover';
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';
	setPreset(defaultPreset);
	let offset = $state(8);
	let open = $state(true);
	export function move() {
		offset = 32;
	}
	export function close() {
		open = false;
	}
</script>

<Root style="width:800px;height:500px;position:relative">
	<Popover.Root bind:open {offset} placement="bottom">
		<Popover.Trigger data-bench-trigger style="margin:80px">Open</Popover.Trigger>
		<Popover.Content data-bench-content>Positioned content</Popover.Content>
	</Popover.Root>
</Root>
