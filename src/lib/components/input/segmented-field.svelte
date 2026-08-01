<!--
  Shared "segmented colored-overlay" text field. A transparent <input> (caret, selection,
  native editing) sits over an aria-hidden overlay that renders the value as colored segments.
  Single source of truth for the two-layer markup + scroll-sync + value write-through that was
  duplicated verbatim across the email and url controls; each caller supplies only its own
  `parseSegments`-derived `segments` and per-kind `kindStyle`.
-->
<script lang="ts">
	import { cn, toClassValue, type ClassValue } from '$svelte-atoms/core/utils';
	import { writeInputValue } from './shared';
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
		preset?: { class?: ClassValue } | undefined;
		bond?: InputBond | undefined;
		onchange?: ((ev: Event, detail: { value: string }) => void) | undefined;
		oninput?: ((ev: Event, detail: { value: string }) => void) | undefined;
		[key: string]: unknown;
	} = $props();

	let inputEl = $state<HTMLInputElement>();
	let scrollLeft = $state(0);

	// Keep the overlay scrolled in lockstep with the real input.
	function syncScroll() {
		scrollLeft = inputEl?.scrollLeft ?? 0;
	}

	function handleInput(ev: Event) {
		const input = ev.currentTarget as HTMLInputElement;
		value = input.value;
		writeInputValue(bond, value);
		syncScroll();
		oninput?.(ev, { value });
	}

	function handleChange(ev: Event) {
		onchange?.(ev, { value });
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
		oninput={handleInput}
		onchange={handleChange}
		onscroll={syncScroll}
		{...restProps}
	/>
</span>
