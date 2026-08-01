<script lang="ts">
	type Props = {
		features: string[];
		title?: string | undefined;
	};

	let { features, title = '' }: Props = $props();
</script>

<div class="border-primary/40 border-l-2 pl-4">
	{#if title}
		<p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">{title}</p>
	{/if}
	<ul class="space-y-1.5">
		{#each features as feature, i (i)}
			<li class="flex items-start gap-2">
				<svg
					class="text-primary/60 mt-0.5 h-3.5 w-3.5 flex-shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2.5"
						d="M5 13l4 4L19 7"
					/>
				</svg>
				<span class="text-foreground/80 text-sm">{feature}</span>
			</li>
		{/each}
	</ul>
</div>
