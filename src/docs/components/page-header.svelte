<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	type Props = {
		title: string;
		description: string;
		status?: 'stable' | 'beta' | 'experimental' | 'deprecated' | undefined;
		llms?: boolean;
		children?: Snippet;
	};

	let { title, description, status = 'stable', llms = false, children }: Props = $props();

	let titleSize = $state(1.875);
	let descSize = $state(1.125);
	let descLineHeight = $state(1.75);
	let paddingY = $state(2);

	onMount(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			const maxScroll = 200; // Shrink over first 200px of scroll

			const progress = Math.min(1, scrollY / maxScroll);

			// Title: 1.875rem -> 1.125rem
			titleSize = 1.875 - 0.75 * progress;

			// Description: 1.125rem -> 0.875rem
			descSize = 1.125 - 0.25 * progress;

			// Line height: 1.75rem -> 1.25rem
			descLineHeight = 1.75 - 0.5 * progress;

			// Padding: 2rem -> 0.75rem
			paddingY = 2 - 1.25 * progress;
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();

		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<div
	class="doc-header border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
	style="padding-top: {paddingY}rem; padding-bottom: {paddingY}rem; transition: padding 0.15s ease-out;"
>
	<div class="mb-2 flex flex-wrap items-center gap-2">
		<h1
			class="doc-title font-bold text-foreground"
			style="font-size: {titleSize}rem; transition: font-size 0.15s ease-out;"
		>
			{title}
		</h1>
		<span
			class="rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground capitalize"
		>
			{status}
		</span>
		{#if llms}
			<span
				class="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
			>
				llms.txt
			</span>
		{/if}
	</div>
	<p
		class="page-description font-normal text-muted-foreground max-w-3xl"
		style="font-size: {descSize}rem; line-height: {descLineHeight}rem; transition: font-size 0.15s ease-out, line-height 0.15s ease-out;"
	>
		{description}
	</p>
	{#if children}
		<div class="page-children mt-4">
			{@render children()}
		</div>
	{/if}
</div>
