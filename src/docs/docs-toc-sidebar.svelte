<script lang="ts">
	// "On this page", plus the two agent-facing affordances the design puts under it. Hidden below
	// 1180px, where the page headings themselves are the table of contents.
	import { createCopier } from '$docs/utils';

	type TocEntry = { id: string; text: string };

	type Props = { toc: TocEntry[]; activeId?: string; pathname: string };

	let { toc, activeId = '', pathname }: Props = $props();

	const copier = createCopier();

	// Every docs route serves its own Markdown at `<path>/llms.txt` — the same body an agent reads.
	const markdownHref = $derived(`${pathname.replace(/\/$/, '')}/llms.txt`);

	const issueHref = $derived(
		`https://github.com/ixirjs/ui/issues/new?title=${encodeURIComponent(`Docs: ${pathname}`)}`
	);
</script>

<aside
	class="sticky top-14 hidden flex-col gap-2 pt-8 pb-12 min-[1180px]:flex"
	aria-label="On this page"
>
	{#if toc.length > 0}
		<p
			class="text-muted-foreground m-0 mb-0.5 text-[11px] font-semibold tracking-[0.07em] uppercase"
		>
			On this page
		</p>
		{#each toc as entry (entry.id)}
			<a
				href="#{entry.id}"
				class={[
					'border-l-2 px-2.5 py-[3px] text-[13px] transition-colors',
					activeId === entry.id
						? 'text-foreground border-l-primary font-medium'
						: 'border-l-border text-muted-foreground hover:text-foreground'
				]}>{entry.text}</a
			>
		{/each}
	{/if}

	<div
		class={[
			'flex flex-col gap-[7px]',
			toc.length > 0 ? 'border-border mt-3.5 border-t pt-3.5' : ''
		]}
	>
		<button
			type="button"
			onclick={() => copier.run(fetch(markdownHref).then((r) => r.text()))}
			class="text-muted-foreground hover:text-foreground cursor-pointer border-0 bg-transparent p-0 text-left text-[12.5px] transition-colors"
		>
			{copier.label('', 'Copy as Markdown')}
		</button>
		<a
			href={issueHref}
			target="_blank"
			rel="noopener noreferrer"
			class="text-muted-foreground hover:text-foreground text-[12.5px] transition-colors"
			>Report a problem</a
		>
	</div>
</aside>
