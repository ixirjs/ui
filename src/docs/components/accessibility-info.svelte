<script lang="ts">
	type Props = { features: string[]; title?: string | undefined };

	let { features, title = 'Handled for you' }: Props = $props();
</script>

<div class="border-border rounded-[10px] border p-4">
	{#if title}
		<p class="text-muted-foreground m-0 mb-3 text-xs font-semibold tracking-[0.06em] uppercase">
			{title}
		</p>
	{/if}
	<div class="flex flex-col gap-2">
		{#each features as feature, i (i)}
			<div class="flex items-start gap-[9px]">
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					class="text-primary mt-[3px] shrink-0"
					aria-hidden="true"
				>
					<path d="M20 6 9 17l-5-5" />
				</svg>
				<span class="text-muted-foreground text-[13.5px] leading-[1.5]">{feature}</span>
			</div>
		{/each}
	</div>
</div>
