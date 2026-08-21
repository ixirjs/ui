<script lang="ts">
	// The design's 404 state: say what changed, offer search, then list the most-requested pages.
	import { page } from '$app/state';
	import { quickLinks } from '$docs/nav';
	import { getSearch } from '$docs/search.svelte';

	const search = getSearch();

	const isMissing = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{page.status} — IXIR UI</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="animate-page-in mx-auto max-w-[560px] px-5 pt-16 pb-24">
	<p class="text-muted-foreground m-0 mb-2.5 font-mono text-xs">{page.status}</p>
	<h1 class="font-display m-0 mb-3 text-[30px] font-bold tracking-[-0.025em]">
		{isMissing ? 'That page moved or never existed' : 'Something went wrong'}
	</h1>
	<p class="text-muted-foreground m-0 mb-6 text-[15px] leading-[1.65]">
		{#if isMissing}
			Component pages live under <code class="text-primary font-mono text-[13.5px]"
				>/docs/components/&lt;name&gt;</code
			>. If a link sent you somewhere else, search below — every page is indexed by name and
			summary.
		{:else}
			{page.error?.message ?? 'The page could not be rendered.'}
		{/if}
	</p>

	<button
		type="button"
		onclick={() => (search.open = true)}
		class="border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground mb-6 flex w-full cursor-pointer items-center gap-[9px] rounded-lg border px-3 py-2.5 text-sm transition-colors"
	>
		<svg
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			aria-hidden="true"
		>
			<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
		</svg>
		<span class="flex-1 text-left">Search the docs instead</span>
		<span class="border-border bg-kbd rounded border px-[5px] py-px font-mono text-[10px]">⌘K</span>
	</button>

	<p class="text-muted-foreground m-0 mb-2.5 text-xs font-semibold tracking-[0.06em] uppercase">
		Most requested
	</p>
	<div class="border-border flex flex-col border-t">
		{#each quickLinks as link (link.href)}
			<a
				href={link.href}
				class="border-border hover:bg-bg-subtle text-foreground flex items-baseline gap-3.5 border-b px-0.5 py-[11px] transition-colors"
			>
				<span class="text-fg-faint w-24 shrink-0 font-mono text-[11px]"
					>{link.group.toLowerCase()}</span
				>
				<span class="text-sm">{link.label}</span>
			</a>
		{/each}
	</div>
</div>
