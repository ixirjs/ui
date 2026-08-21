<script lang="ts">
	type Props = { items: Array<{ label: string; href?: string }> };

	let { items }: Props = $props();
</script>

<nav
	class="text-muted-foreground mb-[18px] flex items-center gap-[7px] text-[13px]"
	aria-label="Breadcrumb"
>
	<a href="/docs" class="text-muted-foreground hover:text-foreground transition-colors">Docs</a>
	{#each items as item, index (index)}
		<span class="text-fg-faint" aria-hidden="true">/</span>
		{#if item.href}
			<a href={item.href} class="text-muted-foreground hover:text-foreground transition-colors"
				>{item.label}</a
			>
		{:else}
			<span class="text-foreground">{item.label}</span>
		{/if}
	{/each}
</nav>
