<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Kernel } from '@ixirjs/ui/shared';
	import { TilesContext } from './tiles.svelte';

	let { value, children, ...rest }: HTMLButtonAttributes & { value: string } = $props();
	const tiles = TilesContext.getOrThrow('TilesTrigger requires TilesRoot');
	const claim = Kernel.claimId(tiles, tiles.id, 'tiles-trigger');
	$effect(() => claim.release);
	const el = Kernel.element(() => rest, {
		class: 'border-border rounded border px-3 py-1',
		state: tiles,
		attrs: () => ({
			id: claim.id,
			type: 'button',
			onclick: (event: MouseEvent) => {
				if (!event.defaultPrevented) tiles.select(value, event);
			}
		})
	});
</script>

<button {...el.attrs}>{@render children?.()}</button>
