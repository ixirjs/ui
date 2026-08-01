<script lang="ts">
	import Logo from './logo.svelte';
	import { Theme } from './theme.svelte';
	import { page } from '$app/state';

	const theme = Theme.get();
	const isDark = $derived(theme.colorScheme === 'dark');
	let mobileOpen = $state(false);

	const navLinks = [
		{ label: 'Docs', href: '/docs' },
		{ label: 'Components', href: '/docs/components' },
		{ label: 'Quick Start', href: '/docs/quick-start' }
	];

	const isActive = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(href + '/');

	$effect(() => {
		if (page.url.pathname) mobileOpen = false;
	});
</script>

<header class="bg-background/80 border-border/60 sticky top-0 z-10 border-b backdrop-blur-sm">
	<div class="mx-auto flex h-14 max-w-5xl items-center px-4 sm:px-6 lg:px-8">
		<!-- Logo / Brand -->
		<a href="/" class="flex shrink-0 items-center gap-2.5">
			<Logo class="h-7 w-7 text-primary" />
			<span class="font-display text-sm font-semibold tracking-tight">Svelte Atoms</span>
		</a>

		<!-- Visual divider between logo and nav -->
		<div class="bg-border mx-5 hidden h-4 w-px shrink-0 sm:block" aria-hidden="true"></div>

		<!-- Desktop nav -->
		<nav class="hidden items-center gap-0.5 sm:flex" aria-label="Main navigation">
			{#each navLinks as link (link.href)}
				{@const active = isActive(link.href)}
				<a
					href={link.href}
					aria-current={active ? 'page' : undefined}
					class="relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors
						{active
						? 'text-foreground bg-muted'
						: 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}"
				>
					{link.label}
					{#if active}
						<span
							class="bg-primary absolute -bottom-px left-1/2 h-px w-4 -translate-x-1/2 rounded-full"
							aria-hidden="true"
						></span>
					{/if}
				</a>
			{/each}
		</nav>

		<!-- Right side actions -->
		<div class="ml-auto flex items-center gap-1">
			<!-- GitHub — icon + label on lg, icon-only on sm -->
			<a
				href="https://github.com/svelte-atoms/core"
				target="_blank"
				rel="noopener noreferrer"
				class="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors"
				aria-label="View on GitHub"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path
						d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
					/>
					<path d="M9 18c-4.51 2-5-2-7-2" />
				</svg>
				<span class="hidden lg:inline">GitHub</span>
			</a>

			<!-- Separator -->
			<div class="bg-border mx-0.5 h-4 w-px" aria-hidden="true"></div>

			<!-- Dark mode toggle -->
			<button
				onclick={() => theme.toggle()}
				title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
				aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
				class="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-2 transition-colors"
			>
				{#if isDark}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="4" />
						<path
							d="M12 2v2M12 20v2m-8-8H2m20 0h-2m-2.05-5.95-1.41 1.41M6.46 17.54l-1.41 1.41M17.54 17.54l1.41 1.41M7.87 6.46 6.46 4.93"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
					</svg>
				{/if}
			</button>

			<!-- Mobile menu toggle — sm and below only -->
			<button
				onclick={() => (mobileOpen = !mobileOpen)}
				aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
				aria-expanded={mobileOpen}
				class="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-2 transition-colors sm:hidden"
			>
				{#if mobileOpen}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M18 6 6 18" /><path d="m6 6 12 12" />
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<line x1="4" x2="20" y1="6" y2="6" />
						<line x1="4" x2="20" y1="12" y2="12" />
						<line x1="4" x2="20" y1="18" y2="18" />
					</svg>
				{/if}
			</button>
		</div>
	</div>

	<!-- Mobile nav panel -->
	{#if mobileOpen}
		<div class="border-border/60 border-t sm:hidden">
			<nav class="mx-auto max-w-5xl space-y-0.5 px-4 py-2" aria-label="Mobile navigation">
				{#each navLinks as link (link.href)}
					{@const active = isActive(link.href)}
					<a
						href={link.href}
						onclick={() => (mobileOpen = false)}
						aria-current={active ? 'page' : undefined}
						class="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors
							{active
							? 'text-foreground bg-muted'
							: 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}"
					>
						{#if active}
							<span class="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden="true"></span>
						{:else}
							<span class="h-1.5 w-1.5 shrink-0" aria-hidden="true"></span>
						{/if}
						{link.label}
					</a>
				{/each}
			</nav>
		</div>
	{/if}
</header>
