<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'info' | 'warning' | 'success' | 'tip' | 'note';

	interface Props {
		variant?: Variant;
		title?: string | undefined;
		class?: string;
		children: Snippet;
	}

	const { variant = 'info', title, class: klass = '', children }: Props = $props();

	// Accent wash for the neutral variants; the two alarming ones borrow warn / danger so a caution
	// still reads as one at a glance.
	const variantStyles: Record<Variant, string> = {
		info: 'border-l-accent-line bg-accent-soft',
		tip: 'border-l-accent-line bg-accent-soft',
		success: 'border-l-accent-line bg-accent-soft',
		warning: 'border-l-warn bg-warn/8',
		note: 'border-l-border bg-bg-subtle'
	};

	const defaultTitles: Record<Variant, string> = {
		info: 'Info',
		warning: 'Warning',
		success: 'Success',
		tip: 'Tip',
		note: 'Note'
	};

	const resolvedTitle = $derived(title ?? defaultTitles[variant]);
</script>

<div class={['my-6 rounded-r-lg border-l-2 px-4 py-3', variantStyles[variant], klass]}>
	{#if resolvedTitle}
		<p class="text-foreground m-0 mb-1 text-[13.5px] font-semibold">{resolvedTitle}</p>
	{/if}
	<div class="text-foreground text-[13.5px] leading-[1.6]">
		{@render children()}
	</div>
</div>
