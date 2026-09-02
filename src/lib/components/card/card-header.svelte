<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CardContext } from './bond.svelte';
	import type { CardHeaderProps } from './types';

	const props: CardHeaderProps = $props();
	const el = Kernel.element(() => props, {
		preset: 'card.header',
		class: 'card-header border-border flex flex-col space-y-1.5 px-4 py-4',
		state: CardContext
	});
</script>

<div {...el.attrs}>{@render props.children?.()}</div>
