<script lang="ts">
	import { Card } from '$ixirjs/ui/components/card';
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		href,
		linkText = 'Learn more',
		icon,
		class: className = ''
	}: {
		title: string;
		description: string;
		href: string;
		linkText?: string;
		icon?: Snippet;
		class?: string;
	} = $props();
</script>

<Card.Root
	class="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl {className}"
>
	<Card.Body class="p-6">
		{#if icon}
			<div class="text-primary mb-4 transition-transform group-hover:scale-110">
				{@render icon()}
			</div>
		{/if}
		<h3 class="mb-2 text-lg font-semibold">{title}</h3>
		<p class="text-muted-foreground mb-4 text-sm">
			{description}
		</p>
		<a
			{href}
			class="text-primary inline-flex items-center gap-1 text-sm font-semibold transition-all hover:gap-2"
		>
			{linkText}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M5 12h14M12 5l7 7-7 7" />
			</svg>
		</a>
	</Card.Body>
</Card.Root>
