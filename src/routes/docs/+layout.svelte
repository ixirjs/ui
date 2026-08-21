<script lang="ts">
	import DocsNavSidebar from '$docs/docs-nav-sidebar.svelte';
	import DocsTocSidebar from '$docs/docs-toc-sidebar.svelte';
	import { allNavItems, isActive } from '$docs/nav';
	import PageNavigation from '$docs/components/page-navigation.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	type TocEntry = { id: string; text: string };
	let toc = $state<TocEntry[]>([]);
	let activeId = $state('');
	let mainEl = $state<HTMLElement | undefined>(undefined);
	let mobileNavOpen = $state(false);

	const pathname = $derived(page.url.pathname);

	// Shown next to the mobile menu button — the design's `crumbLabel`. Exact match first: the last
	// prefix match on a component page is the catalog, not the component.
	const crumbLabel = $derived(
		allNavItems.find((item) => item.href === pathname)?.label ??
			allNavItems.filter((item) => isActive(pathname, item.href)).pop()?.label ??
			'Docs'
	);

	// Component pages get prev/next from `DocComponentPage`; every other docs page gets it here, in
	// sidebar order, so a guide is never a dead end.
	const ownsNavigation = $derived(/^\/docs\/components\/.+/.test(pathname));
	const siblings = $derived.by(() => {
		const at = allNavItems.findIndex((item) => item.href === pathname);
		return at < 0 ? {} : { prev: allNavItems[at - 1], next: allNavItems[at + 1] };
	});

	$effect(() => {
		void pathname;
		mobileNavOpen = false;
	});

	$effect(() => {
		void pathname;
		let observer: IntersectionObserver | undefined;

		const frame = requestAnimationFrame(() => {
			if (!mainEl) return;
			const headings = Array.from(mainEl.querySelectorAll('h2[id]'));
			// The heading owns a trailing `#` anchor, and Svelte's block anchors are comment nodes whose
			// `textContent` is their marker text — so the label is read off a clone with both removed.
			toc = headings.map((h) => {
				const clone = h.cloneNode(true) as HTMLElement;
				clone.querySelectorAll('[data-anchor]').forEach((node) => node.remove());
				return { id: h.id, text: (clone.textContent ?? '').trim() };
			});
			activeId = headings[0]?.id ?? '';

			observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							activeId = entry.target.id;
							break;
						}
					}
				},
				{ rootMargin: '-20% 0px -60% 0px', threshold: 0 }
			);
			headings.forEach((h) => observer!.observe(h));
		});

		return () => {
			cancelAnimationFrame(frame);
			observer?.disconnect();
		};
	});
</script>

<!-- 232 / content / 200 with a 40px gutter. The TOC column drops at 1180px, the nav column at 900. -->
<div
	class="mx-auto grid w-full max-w-[1480px] grid-cols-[232px_minmax(0,1fr)_200px] items-start gap-10 px-5 max-[1180px]:grid-cols-[232px_minmax(0,1fr)] max-[899px]:grid-cols-[minmax(0,1fr)] max-[899px]:gap-0"
>
	<!-- Below 900px: the sidebar collapses into a menu button. -->
	<div class="border-border flex items-center gap-2.5 border-b py-2.5 min-[900px]:hidden">
		<button
			type="button"
			onclick={() => (mobileNavOpen = !mobileNavOpen)}
			aria-expanded={mobileNavOpen}
			class="border-border bg-surface text-foreground flex cursor-pointer items-center gap-2 rounded-[7px] border px-[11px] py-[7px] text-[13px]"
		>
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				aria-hidden="true"
			>
				<path d="M4 6h16M4 12h16M4 18h16" />
			</svg>
			Docs menu
		</button>
		<span class="text-muted-foreground truncate text-[13px]">{crumbLabel}</span>
	</div>

	<DocsNavSidebar {pathname} bind:open={mobileNavOpen} />

	<main bind:this={mainEl} class="docs-scroll min-w-0 pt-7 pb-18">
		{@render children?.()}
		{#if !ownsNavigation}
			<PageNavigation prev={siblings.prev} next={siblings.next} />
		{/if}
	</main>

	<DocsTocSidebar {toc} {activeId} {pathname} />
</div>
