<script lang="ts">
	type Props = {
		prev?: { label: string; href: string } | undefined;
		next?: { label: string; href: string } | undefined;
	};

	let { prev, next }: Props = $props();
</script>

<div class="border-border mt-12 flex items-center justify-between gap-4 border-t pt-8">
	{#if prev}
		<a
			href={prev.href}
			class="group hover:bg-muted/50 border-border/50 flex flex-1 flex-col gap-1 rounded-lg border p-4 transition-colors"
		>
			<div
				class="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase"
			>
				<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				Previous
			</div>
			<div class="text-foreground group-hover:text-foreground font-semibold">{prev.label}</div>
		</a>
	{:else}
		<div class="flex-1"></div>
	{/if}

	{#if next}
		<a
			href={next.href}
			class="group hover:bg-muted/50 border-border/50 flex flex-1 flex-col gap-1 rounded-lg border p-4 text-right transition-colors"
		>
			<div
				class="text-muted-foreground flex items-center justify-end gap-2 text-xs font-medium tracking-wide uppercase"
			>
				Next
				<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</div>
			<div class="text-foreground group-hover:text-foreground font-semibold">{next.label}</div>
		</a>
	{/if}
</div>
