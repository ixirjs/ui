<!--
  The aria-hidden colour overlay that sits behind a transparent <input>, shared by every control
  that renders its value as styled spans: <SegmentedField> (email, url, location), the phone
  control's mask, and the currency control's Intl parts.

  It is the overlay only, deliberately. The three callers agree on this markup exactly and disagree
  on the <input> underneath it — SegmentedField binds `value`, phone holds masked text while `value`
  holds bare digits, currency holds a locale edit string — so sharing the field would mean a
  display-text override plus element exposure plus a flag per caller. Sharing the overlay needs
  none of that.
-->
<script lang="ts" module>
	// A span carries its own presentation: callers style by inline `style`, by class, or both.
	export type OverlaySpan = {
		text: string;
		class?: string | undefined;
		style?: string | undefined;
	};
</script>

<script lang="ts" generics="S extends OverlaySpan">
	import { cn, type ClassValue } from '$ixirjs/ui/utils';
	import type { Snippet } from 'svelte';

	let {
		spans,
		scrollLeft = 0,
		placeholder = '',
		class: klass = undefined,
		span: spanSnippet = undefined
	}: {
		spans: readonly S[];
		// Horizontal offset of the real input, so the overlay tracks its scroll.
		scrollLeft?: number;
		placeholder?: string;
		class?: ClassValue | undefined;
		// Replaces the rendering of one span, and sees the caller's own span type — the phone
		// control exposes this to consumers, whose spans carry a segment `type` this does not.
		span?: Snippet<[S]> | undefined;
	} = $props();
</script>

<span
	aria-hidden="true"
	class={cn(
		'pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre px-2 font-mono text-sm',
		klass
	)}
>
	<span style="transform: translateX(-{scrollLeft}px)">
		{@render (spans.length ? spanList : placeholderSpan)()}
	</span>
</span>

{#snippet spanList()}
	<!-- Keyed by index: spans are a positional list and repeat freely — a coordinate renders two
	     `symbol°` spans, which a content-based key reports as a duplicate. -->
	{#each spans as span, i (i)}
		{@render (spanSnippet ?? defaultSpan)(span)}
	{/each}
{/snippet}

{#snippet defaultSpan(span: OverlaySpan)}
	<span class={span.class} style={span.style}>{span.text}</span>
{/snippet}

{#snippet placeholderSpan()}
	<span class="text-muted-foreground">{placeholder}</span>
{/snippet}
