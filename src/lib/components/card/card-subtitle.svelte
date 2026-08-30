<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CardContext } from './bond.svelte';
	import type { CardSubtitleProps } from './types';

	const props: CardSubtitleProps = $props();
	const el = Kernel.element(() => props, {
		preset: 'card.subtitle',
		class: 'card-subtitle border-border text-sm font-medium text-gray-600',
		state: CardContext.get()
	});
</script>

<p {...el.attrs}>{@render props.children?.()}</p>
