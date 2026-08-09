<!--
  Shared "segmented colored-overlay" text field. A transparent <input> (caret, selection,
  native editing) sits over an aria-hidden overlay that renders the value as colored segments.
  Single source of truth for the two-layer markup + scroll-sync + value write-through that was
  duplicated verbatim across the email and url controls; each caller supplies only its own
  `parseSegments`-derived `segments` and per-kind `kindStyle`.
-->
<script lang="ts">
	import {
		INPUT_DISABLED_CLASS,
		INPUT_OVERLAY_FIELD_CLASS
	} from '$ixirjs/ui/components/input/shared';
	import { cn, type ClassValue } from '$ixirjs/ui/utils';
	import SegmentOverlay from './segment-overlay.svelte';
	import type { InputControlHandle } from './shared';

	type Segment = { text: string; kind: string };

	let {
		value = $bindable(''),
		segments,
		kindStyle,
		type = 'text',
		placeholder = '',
		disabled = false,
		readonly = false,
		class: klass = '',
		overlayWhen = true,
		control,
		onchange = undefined,
		oninput = undefined,
		onvaluechange = undefined,
		...restProps
	}: {
		value?: string;
		segments: Segment[];
		kindStyle: Record<string, string>;
		type?: string;
		placeholder?: string;
		disabled?: boolean;
		readonly?: boolean;
		class?: ClassValue;
		// Whether the coloured overlay is up. `false` hands the field back to the native input —
		// real text, real placeholder. Callers that only colour while blurred (location) drive this
		// from their own focus state; the always-on callers (email, url) leave it alone.
		overlayWhen?: boolean;
		control: InputControlHandle;
		onchange?: ((event: Event) => void) | undefined;
		oninput?: ((event: Event) => void) | undefined;
		onvaluechange?:
			| import('$ixirjs/ui/types').StateChangeCallback<string, import('./bond.svelte').InputBond>
			| undefined;
		[key: string]: unknown;
	} = $props();

	let inputEl = $state<HTMLInputElement>();
	let scrollLeft = $state(0);

	const spans = $derived(segments.map((seg) => ({ text: seg.text, style: kindStyle[seg.kind] })));

	// Keep the overlay scrolled in lockstep with the real input.
	function syncScroll() {
		scrollLeft = inputEl?.scrollLeft ?? 0;
	}

	function handleInput(event: Event) {
		oninput?.(event);
		if (event.defaultPrevented) return;

		value = (event.currentTarget as HTMLInputElement).value;
		control.setValue(value);
		syncScroll();
		control.notify(onvaluechange, value, event, 'input');
	}
</script>

<span class="relative flex h-full w-full flex-1 items-center overflow-hidden">
	<!-- Coloured overlay — scrolls with the input -->
	{@render (overlayWhen ? overlay : undefined)?.()}

	<!-- Real input — transparent text while the overlay is up, visible caret either way -->
	<input
		bind:this={inputEl}
		{type}
		bind:value
		{placeholder}
		{disabled}
		{readonly}
		class={cn(
			INPUT_OVERLAY_FIELD_CLASS,
			overlayWhen
				? 'text-transparent placeholder:text-transparent'
				: 'text-foreground placeholder:text-muted-foreground',
			disabled && INPUT_DISABLED_CLASS,
			control.class,
			klass
		)}
		{...control.attrs}
		{...restProps}
		oninput={handleInput}
		{onchange}
		onscroll={syncScroll}
	/>
</span>

{#snippet overlay()}
	<SegmentOverlay {spans} {scrollLeft} {placeholder} class={[control.class, klass]} />
{/snippet}
