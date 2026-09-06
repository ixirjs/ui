<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Kernel } from '@ixirjs/ui/shared';
	import type { StateChangeCallback } from '@ixirjs/ui';
	import { TilesBond, TilesContext, type TilesProps } from './tiles.svelte';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		value?: string;
		factory?: (props: TilesProps) => TilesBond;
		onvaluechange?: StateChangeCallback<string, TilesBond>;
		children?: Snippet<[{ tiles: TilesBond }]>;
	};
	const ID = $props.id();
	let { value = $bindable(''), factory, onvaluechange, children, ...rest }: Props = $props();
	const liveProps = {
		get id() {
			return ID;
		},
		get value() {
			return value;
		}
	};
	const build = untrack(() => factory);
	const tiles = TilesContext.share(build ? build(liveProps) : TilesBond.create(liveProps));
	tiles.bindCommit((next, context) => {
		value = next;
		onvaluechange?.(next, context);
	});
	export const getBond = () => tiles;
	const el = Kernel.element(() => rest, {
		class: 'border-border flex items-center gap-3 rounded border p-3',
		state: tiles,
		attrs: () => ({ id: tiles.rootId })
	});
</script>

<div {...el.attrs}>{@render children?.({ tiles })}</div>
