<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Collapsible as ACollapsible } from '..';

	// https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Atoms/Collapsible',
		// Autodocs: https://storybook.js.org/docs/writing-docs/autodocs

		parameters: {
			// https://storybook.js.org/docs/configure/story-layout
			layout: 'centered'
		},
		args: {
			disabled: false,
			open: false
		},
		argTypes: {
			disabled: { control: 'boolean', description: 'Disable toggle interaction on the header' },
			open: { control: 'boolean', description: 'Initial open state of the collapsible' }
		}
	});
</script>

<Story name="Basic" args={{ disabled: false, open: false }}>
	{#snippet template(args)}
		<ACollapsible.Root {...args} class="w-80">
			{#snippet children({ collapsible })}
				{@const isOpen = collapsible.isOpen}

				<ACollapsible.Header>
					<div class="font-medium">What is ixirjs?</div>
					<ACollapsible.Indicator />
				</ACollapsible.Header>

				<ACollapsible.Body
					class={['pointer-events-none h-0 opacity-0', isOpen && 'pointer-events-auto']}
				>
					<div class="px-3 pb-3 text-sm text-muted-foreground">
						ixirjs is a headless component library built on Svelte 5 runes, providing accessible,
						composable primitives you can style to match your design system.
					</div>
				</ACollapsible.Body>
			{/snippet}
		</ACollapsible.Root>
	{/snippet}
</Story>

<!-- Real-world scene: a help-center FAQ where each question expands to reveal
     its answer. The header is the question, the body is the answer. -->
<Story name="FAQ" args={{}}>
	<div class="w-96">
		<h3 class="text-foreground mb-2 text-base font-semibold">Frequently asked questions</h3>
		<div class="flex flex-col gap-2">
			<ACollapsible.Root>
				{#snippet children({ collapsible })}
					{@const isOpen = collapsible.isOpen}

					<ACollapsible.Header>
						<div class="font-medium">Does it work with SvelteKit?</div>
						<ACollapsible.Indicator />
					</ACollapsible.Header>

					<ACollapsible.Body
						class={['pointer-events-none h-0 opacity-0', isOpen && 'pointer-events-auto']}
					>
						<div class="px-3 pb-3 text-sm text-muted-foreground">
							Yes. Components are SSR-safe and hydrate cleanly, so they drop into any SvelteKit
							route without extra configuration.
						</div>
					</ACollapsible.Body>
				{/snippet}
			</ACollapsible.Root>

			<ACollapsible.Root>
				{#snippet children({ collapsible })}
					{@const isOpen = collapsible.isOpen}

					<ACollapsible.Header>
						<div class="font-medium">Is it accessible?</div>
						<ACollapsible.Indicator />
					</ACollapsible.Header>

					<ACollapsible.Body
						class={['pointer-events-none h-0 opacity-0', isOpen && 'pointer-events-auto']}
					>
						<div class="px-3 pb-3 text-sm text-muted-foreground">
							ARIA roles and keyboard interaction are wired through capabilities, so disclosure,
							focus, and escape handling come for free.
						</div>
					</ACollapsible.Body>
				{/snippet}
			</ACollapsible.Root>
		</div>
	</div>
</Story>

<Story name="Multiple" args={{}}>
	<div class="flex w-80 flex-col gap-2">
		<ACollapsible.Root>
			{#snippet children({ collapsible })}
				{@const isOpen = collapsible.isOpen}

				<ACollapsible.Header>
					<div class="font-medium">Getting Started</div>
					<ACollapsible.Indicator />
				</ACollapsible.Header>

				<ACollapsible.Body
					class={['pointer-events-none h-0 opacity-0', isOpen && 'pointer-events-auto']}
				>
					<div class="px-3 pb-3 text-sm text-muted-foreground">
						Install via your package manager and import the components you need. No global
						configuration required — each component is self-contained.
					</div>
				</ACollapsible.Body>
			{/snippet}
		</ACollapsible.Root>

		<ACollapsible.Root>
			{#snippet children({ collapsible })}
				{@const isOpen = collapsible.isOpen}

				<ACollapsible.Header>
					<div class="font-medium">Styling & Theming</div>
					<ACollapsible.Indicator />
				</ACollapsible.Header>

				<ACollapsible.Body
					class={['pointer-events-none h-0 opacity-0', isOpen && 'pointer-events-auto']}
				>
					<div class="px-3 pb-3 text-sm text-muted-foreground">
						Components are headless by default. Use the preset prop or add Tailwind classes directly
						to control appearance without fighting opinionated defaults.
					</div>
				</ACollapsible.Body>
			{/snippet}
		</ACollapsible.Root>

		<ACollapsible.Root>
			{#snippet children({ collapsible })}
				{@const isOpen = collapsible.isOpen}

				<ACollapsible.Header>
					<div class="font-medium">Advanced Patterns</div>
					<ACollapsible.Indicator />
				</ACollapsible.Header>

				<ACollapsible.Body
					class={['pointer-events-none h-0 opacity-0', isOpen && 'pointer-events-auto']}
				>
					<div class="px-3 pb-3 text-sm text-muted-foreground">
						Nest collapsibles, bind the open state externally, or supply a custom factory to extend
						the bond with your own capabilities.
					</div>
				</ACollapsible.Body>
			{/snippet}
		</ACollapsible.Root>
	</div>
</Story>

<Story name="Disabled" args={{}}>
	<ACollapsible.Root disabled class="w-80">
		{#snippet children({ collapsible })}
			{@const isOpen = collapsible.isOpen}

			<ACollapsible.Header class="opacity-50">
				<div class="font-medium">This section is disabled</div>
				<ACollapsible.Indicator />
			</ACollapsible.Header>

			<ACollapsible.Body
				class={['pointer-events-none h-0 opacity-0', isOpen && 'pointer-events-auto']}
			>
				<div class="px-3 pb-3 text-sm text-muted-foreground">
					This content is not reachable while the collapsible is disabled.
				</div>
			</ACollapsible.Body>
		{/snippet}
	</ACollapsible.Root>
</Story>

<Story name="DefaultOpen" args={{}}>
	<ACollapsible.Root open class="w-80">
		{#snippet children({ collapsible })}
			{@const isOpen = collapsible.isOpen}

			<ACollapsible.Header>
				<div class="font-medium">Open by default</div>
				<ACollapsible.Indicator />
			</ACollapsible.Header>

			<ACollapsible.Body
				class={['pointer-events-none h-0 opacity-0', isOpen && 'pointer-events-auto']}
			>
				<div class="px-3 pb-3 text-sm text-muted-foreground">
					This collapsible starts in the open state. Pass <code>open</code> to control initial visibility
					without preventing the user from toggling it afterward.
				</div>
			</ACollapsible.Body>
		{/snippet}
	</ACollapsible.Root>
</Story>
