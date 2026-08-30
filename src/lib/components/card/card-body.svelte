<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CardContext } from './bond.svelte';
	import type { CardContentProps } from './types';

	const props: CardContentProps = $props();
	const el = Kernel.element(() => props, {
		preset: 'card.content',
		class: 'card-content border-border px-4 pb-4',
		state: CardContext.get()
	});
</script>

<div {...el.attrs}>{@render props.children?.()}</div>
