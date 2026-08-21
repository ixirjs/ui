<script lang="ts">
	import { page } from '$app/state';

	type Props = {
		prev?: { label: string; href: string } | undefined;
		next?: { label: string; href: string } | undefined;
	};

	let { prev, next }: Props = $props();

	// Docs pages live under `src/routes`, so the edit link is derivable from the route itself. A
	// component page is the exception: its route is dynamic (`[component]`), and the file a reader
	// would actually edit is that component's own `content.svelte`.
	const editHref = $derived.by(() => {
		const path = page.url.pathname.replace(/\/$/, '');
		const component = /^\/docs\/components\/([^/]+)$/.exec(path);
		const file = component
			? `src/routes/docs/components/${component[1]}/content.svelte`
			: `src/routes${path}/+page.svelte`;
		return `https://github.com/ixirjs/ui/edit/main/${file}`;
	});
</script>

<div
	class="border-border mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-[18px]"
>
	{#if prev}
		<a href={prev.href} class="text-foreground flex flex-col gap-0.5">
			<span class="text-fg-faint text-[11px]">Previous</span>
			<span class="text-sm font-medium">{prev.label}</span>
		</a>
	{:else}
		<span></span>
	{/if}

	<a
		href={editHref}
		target="_blank"
		rel="noopener noreferrer"
		class="text-muted-foreground hover:text-foreground text-[12.5px] transition-colors"
		>Edit this page on GitHub</a
	>

	{#if next}
		<a href={next.href} class="text-foreground flex flex-col gap-0.5 text-right">
			<span class="text-fg-faint text-[11px]">Next</span>
			<span class="text-sm font-medium">{next.label}</span>
		</a>
	{:else}
		<span></span>
	{/if}
</div>
