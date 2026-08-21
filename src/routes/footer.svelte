<script lang="ts">
	import Logo from './logo.svelte';
	import { navGroups } from '$docs/nav';
	import pkg from '../../package.json';

	// Three link columns beside the brand, sourced from the same nav manifest as the sidebar.
	const columns = $derived(
		navGroups
			.filter((group) => group.title !== 'Components')
			.slice(0, 3)
			.map((group) => ({ title: group.title, items: group.items.slice(0, 4) }))
	);
</script>

<footer class="border-border bg-bg-subtle mt-auto border-t">
	<div
		class="mx-auto grid max-w-[1480px] grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] gap-8 px-5 pt-10 pb-5 max-[900px]:grid-cols-[minmax(0,1fr)]"
	>
		<div class="flex flex-col gap-2.5">
			<div class="flex items-center gap-[9px]">
				<Logo size={22} class="text-primary" />
				<span class="font-display text-[13.5px] font-semibold">IXIR UI</span>
			</div>
			<p class="text-muted-foreground m-0 max-w-[280px] text-[12.5px] leading-[1.6]">
				Headless Svelte 5 primitives. Presentation is yours; behaviour and accessibility are ours.
			</p>
			<span class="text-fg-faint font-mono text-[11px]">MIT · {pkg.name} v{pkg.version}</span>
		</div>

		{#each columns as column (column.title)}
			<div class="flex flex-col gap-2">
				<span class="text-fg-faint text-[11px] font-semibold tracking-[0.07em] uppercase"
					>{column.title}</span
				>
				{#each column.items as item (item.href)}
					<a
						href={item.href}
						class="text-muted-foreground hover:text-foreground text-[13px] transition-colors"
						>{item.label}</a
					>
				{/each}
			</div>
		{/each}
	</div>

	<div
		class="border-border mx-auto flex max-w-[1480px] flex-wrap items-center gap-4 border-t px-5 pt-3.5 pb-6"
	>
		<a
			href="https://github.com/ixirjs/ui"
			target="_blank"
			rel="noopener noreferrer"
			class="text-muted-foreground hover:text-foreground text-[12.5px] transition-colors">GitHub</a
		>
		<a
			href="https://www.npmjs.com/package/{pkg.name}"
			target="_blank"
			rel="noopener noreferrer"
			class="text-muted-foreground hover:text-foreground text-[12.5px] transition-colors">npm</a
		>
		<a
			href="/docs/llms.txt"
			data-sveltekit-reload
			class="text-muted-foreground hover:text-foreground text-[12.5px] transition-colors"
			>llms.txt</a
		>
		<span class="text-fg-faint ml-auto font-mono text-[11px]">llms.txt · MCP · Markdown</span>
	</div>
</footer>
