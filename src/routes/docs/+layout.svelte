<script lang="ts">
	import { type PageContent } from '$docs/content-sidebar.svelte';
	import { components } from '$docs/registry';
	import DocsNavSidebar from '$docs/docs-nav-sidebar.svelte';
	import DocsTocSidebar from '$docs/docs-toc-sidebar.svelte';
	import DocsFooter from '../docs-footer.svelte';
	import { page } from '$app/stores';

	let { children } = $props();

	type TocEntry = { id: string; text: string };
	let toc = $state<TocEntry[]>([]);
	let activeId = $state('');
	let mainEl = $state<HTMLElement | undefined>(undefined);
	let mobileNavOpen = $state(false);
	let mobileTocOpen = $state(false);

	// Close mobile nav on route change
	$effect(() => {
		void $page.url.pathname;
		mobileNavOpen = false;
		mobileTocOpen = false;
	});

	$effect(() => {
		void $page.url.pathname;
		requestAnimationFrame(() => {
			if (!mainEl) return;
			const headings = Array.from(mainEl.querySelectorAll('h2[id]'));
			toc = headings.map((h) => ({ id: h.id, text: h.textContent?.trim() ?? '' }));

			const observer = new IntersectionObserver(
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
			headings.forEach((h) => observer.observe(h));
			return () => observer.disconnect();
		});
	});

	const sidebarData: PageContent[] = [
		{
			title: 'Getting Started',
			href: '/docs',
			children: [
				{ title: 'Introduction', href: '/docs' },
				{ title: 'Quick Start', href: '/docs/quick-start' },
				{ title: 'Philosophy', href: '/docs/philosophy' },
				{ title: 'Migration Guide', href: '/docs/migration' }
			]
		},
		{
			title: 'Core Concepts',
			children: [
				{ title: 'Bonds', href: '/docs/bonds' },
				{ title: 'Extending & Fusing', href: '/docs/extending' },
				{ title: 'Preset System', href: '/docs/preset' },
				{ title: 'Styling', href: '/docs/styling' },
				{ title: 'Accessibility', href: '/docs/accessibility' }
			]
		},
		{
			title: 'Components',
			href: '/docs/components',
			children: components.map(({ title, href }) => ({ title, href }))
		}
	];
</script>

<!-- Mobile sticky bar (hidden on desktop) -->
<div
	class="border-border bg-background/80 sticky top-14 z-40 flex items-center border-b px-4 py-2 backdrop-blur-md lg:hidden"
>
	<!-- Left: hamburger -->
	<button
		onclick={() => {
			mobileNavOpen = !mobileNavOpen;
			mobileTocOpen = false;
		}}
		class="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
		aria-label="Toggle navigation"
	>
		{#if mobileNavOpen}
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		{:else}
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
		{/if}
		<span>Menu</span>
	</button>

	<!-- Right: current heading + TOC toggle -->
	{#if toc.length > 0}
		<button
			onclick={() => {
				mobileTocOpen = !mobileTocOpen;
				mobileNavOpen = false;
			}}
			class="text-muted-foreground hover:text-foreground hover:bg-muted ml-auto flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors"
			aria-label="Toggle table of contents"
		>
			<span class="max-w-[180px] truncate">
				{activeId ? (toc.find((t) => t.id === activeId)?.text ?? toc[0]?.text) : toc[0]?.text}
			</span>
			<svg
				class="h-3.5 w-3.5 shrink-0 transition-transform {mobileTocOpen ? 'rotate-180' : ''}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>
	{/if}
</div>

<!-- Layout -->
<div class="docs-layout w-full items-start gap-4 px-4 lg:gap-16 lg:px-6">
	<DocsNavSidebar
		data={sidebarData}
		pathname={$page.url.pathname}
		open={mobileNavOpen}
		ondismiss={() => (mobileNavOpen = false)}
	/>

	<main bind:this={mainEl} class="docs-scroll min-w-0 flex-1 py-8">
		{@render children?.()}
		<DocsFooter />
	</main>

	<DocsTocSidebar {toc} {activeId} open={mobileTocOpen} ondismiss={() => (mobileTocOpen = false)} />
</div>

<style>
	.docs-layout {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
	}
</style>
