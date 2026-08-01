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

	const variantStyles: Record<Variant, string> = {
		info: 'border-primary/50 text-muted-foreground',
		warning: 'border-yellow-500/60 text-muted-foreground',
		success: 'border-green-500/60 text-muted-foreground',
		tip: 'border-blue-500/60 text-muted-foreground',
		note: 'border-border text-muted-foreground'
	};

	const defaultTitles: Record<Variant, string> = {
		info: 'Info',
		warning: 'Warning',
		success: 'Success',
		tip: 'Tip',
		note: 'Note'
	};

	const resolvedTitle = $derived(title ?? defaultTitles[variant]);
	const variantClass = $derived(variantStyles[variant]);
</script>

<div class={['border-l-2 pl-4 py-2 my-4', variantClass, klass].filter(Boolean).join(' ')}>
	{#if resolvedTitle}
		<p class="text-sm font-semibold text-foreground mb-1">{resolvedTitle}</p>
	{/if}
	<div class="text-sm leading-relaxed">
		{@render children()}
	</div>
</div>
