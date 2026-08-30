<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CardContext } from './bond.svelte';
	import type { CardFooterProps } from './types';

	const props: CardFooterProps = $props();
	const el = Kernel.element(() => props, {
		preset: 'card.footer',
		class: 'card-footer border-border flex items-center gap-2 px-4 pb-4',
		state: CardContext.get()
	});
</script>

<div {...el.attrs}>{@render props.children?.()}</div>
