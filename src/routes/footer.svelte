<script lang="ts">
	import Logo from './logo.svelte';

	const links = [
		{ label: 'Quick Start', href: '/docs/quick-start' },
		{ label: 'Installation', href: '/docs/setup' },
		{ label: 'Overview', href: '/docs/overview' },
		{ label: 'Components', href: '/docs/components' },
		{ label: 'Philosophy', href: '/docs/philosophy' },
		{ label: 'Styling', href: '/docs/styling' },
		{ label: 'Accessibility', href: '/docs/accessibility' }
	];

	const year = new Date().getFullYear();
</script>

<footer class="border-border border-t">
	<div class="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
		<!-- Brand row -->
		<div class="flex items-start justify-between gap-4">
			<div class="space-y-2">
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href="/" class="flex items-center gap-2">
					<Logo class="h-5 w-5" />
					<span class="font-semibold tracking-tight">Atoms for Svelte</span>
				</a>
				<p class="text-muted-foreground max-w-64 text-xs leading-relaxed">
					Headless, composable UI primitives. Build your design system, your way.
				</p>
			</div>

			<a
				href="https://github.com/svelte-atoms/core"
				target="_blank"
				rel="noopener noreferrer"
				class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
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
				>
					<path
						d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
					/>
					<path d="M9 18c-4.51 2-5-2-7-2" />
				</svg>
				GitHub
			</a>
		</div>

		<!-- Flat nav — no section headings -->
		<!-- eslint-disable svelte/no-navigation-without-resolve -->
		<nav class="flex flex-wrap gap-x-5 gap-y-2">
			{#each links as link (link.href)}
				<a
					href={link.href}
					class="text-muted-foreground hover:text-foreground text-sm transition-colors"
				>
					{link.label}
				</a>
			{/each}
		</nav>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->

		<!-- Bottom bar -->
		<div
			class="border-border flex flex-col gap-1 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"
		>
			<p class="text-muted-foreground text-xs">© {year} Atoms for Svelte — MIT License</p>
			<p class="text-muted-foreground text-xs">Svelte 5 · Runes · TailwindCSS</p>
		</div>
	</div>
</footer>
