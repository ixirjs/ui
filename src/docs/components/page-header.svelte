<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { createCopier } from '$docs/utils';

	type Props = {
		title: string;
		description: string;
		status?: 'stable' | 'beta' | 'experimental' | 'deprecated' | undefined;
		/** Rendered as the mono pill after the status — the design's `compound` chip. */
		kind?: string | undefined;
		/** Rendered as the plain pill after the kind — the design's `intermediate` chip. */
		depth?: string | undefined;
		/** Shows the agent affordances (Copy as Markdown / Use with an agent). */
		llms?: boolean;
		children?: Snippet;
	};

	let {
		title,
		description,
		status = 'stable',
		kind = undefined,
		depth = undefined,
		llms = false,
		children
	}: Props = $props();

	let agentOpen = $state(false);

	const copier = createCopier();

	const markdownHref = $derived(`${page.url.pathname.replace(/\/$/, '')}/llms.txt`);
	const mcpConfig = $derived(
		JSON.stringify({ mcpServers: { 'ixir-ui': { url: `${page.url.origin}/api/mcp` } } })
	);
	const markdownBody = () => fetch(markdownHref).then((response) => response.text());

	const agentRows = $derived([
		{
			path: '/docs/llms.txt',
			desc: 'Curated index of every page, as Markdown links.',
			run: () => copier.run(`${page.url.origin}/docs/llms.txt`, 'llms'),
			label: copier.label('llms', 'Copy URL')
		},
		{
			path: markdownHref.split('/').slice(-2).join('/'),
			desc: 'This page as clean Markdown — no nav, no chrome.',
			run: () => copier.run(markdownBody(), 'md-row'),
			label: copier.label('md-row')
		},
		{
			path: 'MCP server',
			desc: 'Query the docs live from Claude Code or Cursor.',
			run: () => copier.run(mcpConfig, 'mcp'),
			label: copier.label('mcp', 'Copy config')
		}
	]);
</script>

<div class="flex flex-wrap items-start justify-between gap-6">
	<div class="min-w-0">
		<div class="mb-2 flex flex-wrap items-center gap-[9px]">
			<h1 class="font-display m-0 text-[32px] font-bold tracking-[-0.025em]">{title}</h1>
			{#if status}
				<span
					class="border-accent-line bg-accent-soft text-primary rounded-full border px-[9px] py-0.5 text-[11px] font-medium"
					>{status}</span
				>
			{/if}
			{#if kind}
				<span
					class="border-border text-muted-foreground rounded-full border px-[9px] py-0.5 font-mono text-[11px]"
					>{kind}</span
				>
			{/if}
			{#if depth}
				<span
					class="border-border text-muted-foreground rounded-full border px-[9px] py-0.5 text-[11px]"
					>{depth}</span
				>
			{/if}
		</div>
		<p class="text-muted-foreground m-0 max-w-[640px] text-base leading-[1.6]">{description}</p>
	</div>

	{#if llms}
		<div class="flex shrink-0 gap-1.5">
			<button
				type="button"
				onclick={() => copier.run(markdownBody(), 'md')}
				class="border-border bg-surface text-muted-foreground hover:text-foreground hover:border-border-strong flex cursor-pointer items-center gap-1.5 rounded-[7px] border px-2.5 py-1.5 text-xs transition-colors"
			>
				<svg
					width="13"
					height="13"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<rect x="9" y="9" width="12" height="12" rx="2" />
					<path d="M5 15V5a2 2 0 0 1 2-2h10" />
				</svg>
				{copier.label('md', 'Copy as Markdown')}
			</button>
			<button
				type="button"
				onclick={() => (agentOpen = !agentOpen)}
				aria-expanded={agentOpen}
				class="border-border bg-surface text-muted-foreground hover:text-foreground hover:border-border-strong flex cursor-pointer items-center gap-1.5 rounded-[7px] border px-2.5 py-1.5 text-xs transition-colors"
			>
				Use with an agent
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					aria-hidden="true"
					class={['transition-transform', agentOpen ? 'rotate-180' : '']}
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</button>
		</div>
	{/if}
</div>

{#if agentOpen}
	<div
		class="border-border bg-bg-subtle mt-4 flex flex-col gap-2.5 rounded-[10px] border px-4 py-3.5"
	>
		<p class="text-muted-foreground m-0 text-xs">This page, in agent-readable form.</p>
		<div class="flex flex-col gap-1.5">
			{#each agentRows as row (row.path)}
				<div class="flex flex-wrap items-center gap-3">
					<code class="text-primary w-[150px] shrink-0 font-mono text-xs">{row.path}</code>
					<span class="text-muted-foreground min-w-0 flex-1 text-[12.5px]">{row.desc}</span>
					<button
						type="button"
						onclick={row.run}
						class="border-border bg-surface text-muted-foreground hover:text-foreground cursor-pointer rounded-md border px-2 py-[3px] text-[11px] transition-colors"
						>{row.label}</button
					>
				</div>
			{/each}
		</div>
	</div>
{/if}

{#if children}
	<div class="mt-4">{@render children()}</div>
{/if}
