<script module lang="ts">
	// The renderer half of the part-element seam (see use-part-element.svelte.ts). A module snippet,
	// deliberately:
	// `{@render partElement(...)}` is a function call into the caller's renderer — no component
	// boundary, no props proxy, no context scope. The `body` parameter exists because several
	// parts render children with arguments (`children?.({ card: bond })`); they pass a local
	// wrapper snippet, parts with plain children pass `children` directly.
	import type { Snippet } from 'svelte';
	import HtmlAtom from './html-atom.svelte';
	import type { PartElement } from './use-part-element.svelte';

	// Both halves of the seam live behind one import, so a part takes one line rather than two.
	export { usePartElement } from './use-part-element.svelte';
	export { partElement };
</script>

{#snippet partElement(el: PartElement, body?: Snippet)}
	{@render (el.native() ? native : component)(el, body)}
{/snippet}

{#snippet native(el: PartElement, body?: Snippet)}
	<svelte:element this={el.tag()} class={el.class()} {...el.attrs()}>
		{@render body?.()}
	</svelte:element>
{/snippet}

{#snippet component(el: PartElement, body?: Snippet)}
	<HtmlAtom {...el.richProps()}>
		{@render body?.()}
	</HtmlAtom>
{/snippet}
