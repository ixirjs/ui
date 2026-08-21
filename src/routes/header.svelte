<script lang="ts">
	import Logo from './logo.svelte';
	import { Theme } from './theme.svelte';
	import { page } from '$app/state';
	import { headerNav, isActive } from '$docs/nav';
	import SearchPalette from '$docs/search-palette.svelte';
	import { getSearch } from '$docs/search.svelte';

	const theme = Theme.get();
	const search = getSearch();
	const isDark = $derived(theme.colorScheme === 'dark');

	// Deliberately state-plus-effect rather than a `$derived`: the platform is unknowable on the
	// server, and a derived would compute 'Ctrl' during hydration against SSR's '⌘' — a text
	// mismatch. Starting at the server's value and correcting after mount avoids that.
	// eslint-disable-next-line svelte/prefer-writable-derived
	let isMac = $state(true);

	$effect(() => {
		isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
	});

	// `/docs` is the Guides slot, so it cannot claim descendants by prefix — every docs page lives
	// under it. The most specific match wins, and Guides catches whatever is left inside /docs.
	const activeHref = $derived(
		headerNav
			.filter((link) => link.href !== '/docs' && isActive(page.url.pathname, link.href))
			.pop()?.href ?? (page.url.pathname.startsWith('/docs') ? '/docs' : '')
	);

	// ⌘K / Ctrl+K anywhere, and bare `/` when not already typing.
	function onkeydown(event: KeyboardEvent) {
		const el = document.activeElement as HTMLElement | null;
		const typing =
			!!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

		if ((event.metaKey || event.ctrlKey) && event.key?.toLowerCase() === 'k') {
			event.preventDefault();
			search.open = !search.open;
		} else if (event.key === '/' && !typing && !search.open) {
			event.preventDefault();
			search.open = true;
		}
	}
</script>

<svelte:window {onkeydown} />

<!--
	z-20, not the design's 30: portal surfaces in this library land on layer 21, so a header above
	them paints over every drawer, dialog and menu that overlaps it — which is what hid the top of
	the mobile docs menu. Overlays belong above the header.
-->
<header class="bg-background border-border sticky top-0 z-20 border-b">
	<div class="mx-auto flex h-14 max-w-[1480px] items-center px-5">
		<a href="/" class="text-foreground flex shrink-0 items-center gap-[9px]">
			<Logo size={26} class="text-primary" />
			<span class="font-display text-sm font-semibold tracking-[-0.01em]">IXIR UI</span>
		</a>

		<nav class="ml-[22px] flex items-center gap-0.5 max-[900px]:hidden" aria-label="Sections">
			{#each headerNav as link (link.href)}
				{@const active = activeHref === link.href}
				<a
					href={link.href}
					aria-current={active ? 'page' : undefined}
					class={[
						'rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
						active
							? 'text-foreground bg-surface-2'
							: 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
					]}
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="ml-auto flex items-center gap-1.5">
			<button
				type="button"
				onclick={() => (search.open = true)}
				aria-label="Search documentation"
				aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'}
				class="border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground flex w-[264px] cursor-pointer items-center gap-2 rounded-[7px] border py-1.5 pr-1.5 pl-2.5 text-[13px] transition-colors max-[900px]:w-9 max-[900px]:justify-center max-[900px]:px-0"
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
					class="shrink-0"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
				<span class="min-w-0 flex-1 truncate text-left max-[900px]:hidden">Search docs</span>
				<span class="flex shrink-0 gap-[3px] max-[900px]:hidden">
					<span class="border-border bg-kbd rounded border px-[5px] py-px font-mono text-[10px]"
						>{isMac ? '⌘' : 'Ctrl'}</span
					>
					<span class="border-border bg-kbd rounded border px-[5px] py-px font-mono text-[10px]"
						>K</span
					>
				</span>
			</button>

			<button
				type="button"
				onclick={() => theme.toggle()}
				aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
				title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
				class="border-border bg-surface text-muted-foreground hover:text-foreground hover:border-border-strong flex h-8 w-8 cursor-pointer items-center justify-center rounded-[7px] border transition-colors"
			>
				{#if isDark}
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
						<circle cx="12" cy="12" r="4" />
						<path
							d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
						/>
					</svg>
				{:else}
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
						<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
					</svg>
				{/if}
			</button>

			<a
				href="https://github.com/ixirjs/ui"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub"
				class="text-muted-foreground hover:text-foreground hover:bg-surface-2 flex h-8 w-8 items-center justify-center rounded-[7px] transition-colors"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<path
						d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
					/>
					<path d="M9 18c-4.51 2-5-2-7-2" />
				</svg>
			</a>
		</div>
	</div>
</header>

<SearchPalette bind:open={search.open} />
