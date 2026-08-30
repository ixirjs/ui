<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CardContext } from './bond.svelte';
	import type { CardMediaProps } from './types';

	const props: CardMediaProps = $props();
	const el = Kernel.element(() => props, {
		preset: 'card.media',
		class: 'card-media border-border overflow-hidden',
		state: CardContext.get()
	});
</script>

<div {...el.attrs}>{@render props.children?.()}</div>
