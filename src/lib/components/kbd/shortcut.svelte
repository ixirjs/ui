<script lang="ts">
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';
	import Kbd from './kbd.svelte';
	import type { ShortcutProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		keys = [],
		separator = '+',
		children,
		...restProps
	}: ShortcutProps = $props();

	const shortcutProps = $derived(mergePresetProps(preset, 'shortcut', restProps));

	let content = $derived(children ?? defaultChildren);
</script>

{#snippet separatorContent()}
	<span class="text-muted-foreground text-xs">{separator}</span>
{/snippet}

{#snippet defaultChildren()}
	{#each keys as key, i (key)}
		{@const content = i > 0 ? separatorContent : null}

		{@render content?.()}
		<Kbd>{key}</Kbd>
	{/each}
{/snippet}

<HtmlAtom
	as="span"
	class={['shortcut inline-flex items-center gap-1', '$preset', klass]}
	aria-label={keys.join(' ' + separator + ' ')}
	{...shortcutProps}
>
	{@render content()}
</HtmlAtom>
