<script lang="ts">
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';
	import type { KbdProps } from './types';

	let { class: klass = '', preset = undefined, children, ...restProps }: KbdProps = $props();

	const kbdProps = $derived(mergePresetProps(preset, 'kbd', restProps));
</script>

<HtmlAtom
	as="kbd"
	class={[
		'kbd border-border bg-muted text-foreground inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 font-mono text-xs font-medium shadow-[inset_0_-1px_0] shadow-black/10',
		'$preset',
		klass
	]}
	{...kbdProps}
>
	{@render children?.()}
</HtmlAtom>
