<!--
  Shared "segmented colored-overlay" text field. A transparent <input> (caret, selection,
  native editing) sits over an aria-hidden overlay that renders the value as colored segments.
  Single source of truth for the two-layer markup + scroll-sync + value write-through that was
  duplicated verbatim across the email and url controls; each caller supplies only its own
  `parseSegments`-derived `segments` and per-kind `kindStyle`.
-->
<script lang="ts">
	import { cn, toClassValue, type ClassValue } from '$ixirjs/ui/utils';
	import type { PresentationView } from '$ixirjs/ui/components/atom/presentation.svelte';
	import { inputChangeContext, writeInputValue } from './shared';
	import type { InputBond } from './bond.svelte';

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
		preset = undefined,
		bond = undefined,
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
		preset?: PresentationView | undefined;
		bond?: InputBond | undefined;
		onchange?: ((event: Event) => void) | undefined;
		oninput?: ((event: Event) => void) | undefined;
		onvaluechange?: import('$ixirjs/ui/types').StateChangeCallback<string, InputBond> | undefined;
		[key: string]: unknown;
	} = $props();

	let inputEl = $state<HTMLInputElement>();
	let scrollLeft = $state(0);

	// Keep the overlay scrolled in lockstep with the real input.
	function syncScroll() {
		scrollLeft = inputEl?.scrollLeft ?? 0;
	}

	function handleInput(event: Event) {
		oninput?.(event);
		if (event.defaultPrevented) return;

		value = (event.currentTarget as HTMLInputElement).value;
		writeInputValue(bond, value);
		syncScroll();
		onvaluechange?.(value, inputChangeContext(bond, event, 'input'));
	}

	function handleChange(event: Event) {
		onchange?.(event);
	}
</script>

<span class="relative flex h-full w-full flex-1 items-center overflow-hidden">
	<!-- Coloured overlay — scrolls with the input -->
	<span
		aria-hidden="true"
		class={cn(
			'pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre px-2 font-mono text-sm',
			preset?.class,
			toClassValue(klass, bond)
		)}
	>
		<span style="transform: translateX(-{scrollLeft}px)">
			{#if segments.length}
				{#each segments as seg (seg.kind + seg.text)}
					<span style={kindStyle[seg.kind]}>{seg.text}</span>
				{/each}
			{:else}
				<span class="text-muted-foreground">{placeholder}</span>
			{/if}
		</span>
	</span>

	<!-- Real input — transparent text, visible caret -->
	<input
		bind:this={inputEl}
		{type}
		bind:value
		{placeholder}
		{disabled}
		{readonly}
		class={cn(
			'relative h-full w-full flex-1 bg-transparent px-2 font-mono text-sm text-transparent caret-foreground outline-none',
			'placeholder:text-transparent',
			disabled && 'cursor-not-allowed',
			preset?.class,
			toClassValue(klass, bond)
		)}
		{...preset?.attrs}
		{...restProps}
		oninput={handleInput}
		onchange={handleChange}
		onscroll={syncScroll}
	/>
</span>
