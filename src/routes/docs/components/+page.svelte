<script lang="ts">
	import ComponentPreview from '$docs/component-preview.svelte';
	import { components } from '$docs/registry';
	import { COMPONENT_CATEGORIES } from '$docs/types';

	const categories = ['All', ...COMPONENT_CATEGORIES];

	let selectedCategory = $state('All');
	let searchQuery = $state('');

	const filtered = $derived(
		components.filter((c) => {
			const q = searchQuery.trim().toLowerCase();
			const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
			const matchesSearch =
				q === '' || c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q);
			return matchesCategory && matchesSearch;
		})
	);

	const categoryCount = (category: string) =>
		category === 'All'
			? components.length
			: components.filter((c) => c.category === category).length;
</script>

<svelte:head>
	<title>Components — IXIR UI</title>
	<meta
		name="description"
		content="Browse every component in @ixirjs/ui — accessible, composable, and built for Svelte 5."
	/>
</svelte:head>

<div class="animate-page-in">
	<p class="text-muted-foreground m-0 mb-2.5 font-mono text-[11px] tracking-[0.05em] uppercase">
		Reference
	</p>
	<h1 class="font-display m-0 mb-3 text-[32px] font-bold tracking-[-0.025em]">
		Every UI piece you need.
	</h1>
	<p class="text-muted-foreground m-0 mb-6 max-w-[640px] text-base leading-[1.6]">
		Accessible, composable components built for Svelte 5. Each one is unstyled by default and fully
		configurable through the preset system.
	</p>

	<div class="mb-4 flex flex-wrap items-center gap-3">
		<div
			class="border-border bg-surface focus-within:border-border-strong flex w-[320px] max-w-full items-center gap-[9px] rounded-lg border px-[11px] py-2 transition-colors"
		>
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				class="text-muted-foreground shrink-0"
				aria-hidden="true"
			>
				<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
			</svg>
			<input
				type="search"
				bind:value={searchQuery}
				placeholder="Filter by name or summary…"
				aria-label="Filter components"
				class="text-foreground min-w-0 flex-1 border-0 bg-transparent font-mono text-[12.5px] outline-none"
			/>
		</div>
		<span class="text-muted-foreground text-[12.5px]">
			{searchQuery.trim() || selectedCategory !== 'All'
				? `${filtered.length} of ${components.length}`
				: `${components.length} components`}
		</span>
	</div>

	<div class="mb-6 flex flex-wrap gap-1.5">
		{#each categories as category (category)}
			<button
				type="button"
				onclick={() => (selectedCategory = category)}
				aria-pressed={selectedCategory === category}
				class={[
					'cursor-pointer rounded-md border px-2.5 py-[3px] text-[11px] transition-colors',
					selectedCategory === category
						? 'border-accent-line bg-accent-soft text-primary'
						: 'border-border bg-surface text-muted-foreground hover:border-border-strong'
				]}
			>
				{category}
				<span class="ml-1 font-mono opacity-60">{categoryCount(category)}</span>
			</button>
		{/each}
	</div>

	{#if filtered.length > 0}
		<div class="grid grid-cols-3 gap-3 max-[1180px]:grid-cols-2 max-[640px]:grid-cols-1">
			{#each filtered as component (component.href)}
				<div
					class="border-border hover:border-border-strong bg-surface flex flex-col overflow-hidden rounded-[10px] border transition-colors"
				>
					<div class="border-border flex items-center gap-2 border-b px-2.5 py-2">
						<a
							href={component.href}
							class="text-foreground hover:text-primary text-[12.5px] font-medium transition-colors"
							>{component.title}</a
						>
						<span
							class={[
								'font-mono text-[10px]',
								component.status === 'beta' ? 'text-warn' : 'text-fg-faint'
							]}>{component.status === 'beta' ? 'beta' : component.category}</span
						>
					</div>
					<div
						class="bg-bg-subtle flex min-h-[128px] flex-1 items-center justify-center overflow-hidden px-3.5 py-[18px]"
					>
						<ComponentPreview name={component.slug} />
					</div>
					<a
						href={component.href}
						class="border-border text-muted-foreground hover:text-foreground border-t px-2.5 py-2.5 text-[12.5px] leading-[1.5] transition-colors"
						>{component.summary}</a
					>
				</div>
			{/each}
		</div>
	{:else}
		<div class="border-border rounded-[10px] border px-5 py-14 text-center">
			<p class="text-foreground m-0 mb-1.5 text-sm">Nothing matches “{searchQuery.trim()}”</p>
			<p class="text-muted-foreground m-0 mb-4 text-[13px]">
				Search covers component names and their one-line summaries.
			</p>
			<button
				type="button"
				onclick={() => {
					searchQuery = '';
					selectedCategory = 'All';
				}}
				class="border-border hover:border-border-strong text-foreground cursor-pointer rounded-[7px] border px-3 py-1.5 text-[13px] transition-colors"
				>Clear filters</button
			>
		</div>
	{/if}
</div>
