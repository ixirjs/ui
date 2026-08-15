<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
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

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const el = Kernel.element(Kernel.static, () => ({
		as: 'span',
		class: ['shortcut inline-flex items-center gap-1', '$preset', klass],
		'aria-label': keys.join(' ' + separator + ' '),
		...shortcutProps
	}));
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), content, undefined, el.motion(), el)}

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
