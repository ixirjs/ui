<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { KbdProps } from './types';

	const props: KbdProps = $props();

	const el = Kernel.element(() => props, {
		preset: 'kbd',
		class:
			'kbd border-border bg-muted text-foreground inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 font-mono text-xs font-medium shadow-[inset_0_-1px_0] shadow-black/10'
	});
</script>

<kbd {...el.attrs}>{@render props.children?.()}</kbd>
