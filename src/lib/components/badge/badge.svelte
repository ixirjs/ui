<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { BadgeProps } from './types';

	const props: BadgeProps = $props();

	const el = Kernel.element(() => props, {
		preset: 'badge',
		class:
			'bg-foreground/10 border-border text-foreground inline-flex h-auto w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
	});
</script>

<span {...el.attrs}>{@render props.children?.()}</span>
