<script lang="ts">
	// The wrapper-re-skin path, measured on its own.
	//
	// A SEPARATE fixture for the reason `datagrid-ablation.test.svelte` spells out: the ladder's
	// per-rung output SHA is the equivalence anchor, and a differently-shaped branch there would move
	// the bytes of every existing rung.
	//
	// The unit is one MENU ITEM. `DropdownMenu.Item` is the shape this fixture exists to price: it
	// owns an Atom and a registration, then mounts `List.Item` and forwards to it with `{...spread}`
	// — a second component boundary plus a `spread_props` proxy per item. Nothing else in the library
	// multiplies a wrapper boundary by list length, and no other perf layer covers it.
	//
	// Items sit directly under the root rather than inside `Content`, because `Content` portals and a
	// portal renders nothing on the server — inside it, this fixture would measure an empty page. The
	// item's cost does not depend on a portal being in its ancestry.
	import { DropdownMenu } from '$ixirjs/ui/components/dropdown-menu';

	let { n = 100 }: { n?: number } = $props();
</script>

<DropdownMenu.Root open>
	<DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
	{#each { length: n } as _, i (i)}
		<DropdownMenu.Item>Item {i}</DropdownMenu.Item>
	{/each}
</DropdownMenu.Root>
