<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import Kbd from './kbd.svelte';
	import type { ShortcutProps } from './types';

	let { keys = [], separator = '+', children = undefined, ...restProps }: ShortcutProps = $props();

	const el = Kernel.element(() => restProps, {
		preset: 'shortcut',
		class: 'shortcut inline-flex items-center gap-1',
		attrs: () => ({ 'aria-label': keys.join(' ' + separator + ' ') })
	});
</script>

<span {...el.attrs}>{@render (children ?? defaultChildren)()}</span>

{#snippet defaultChildren()}
	{#each keys as key, i (key)}
		{@const content = i > 0 ? separatorContent : null}

		{@render content?.()}
		<Kbd>{key}</Kbd>
	{/each}
{/snippet}

{#snippet separatorContent()}
	<span class="text-muted-foreground text-xs">{separator}</span>
{/snippet}
