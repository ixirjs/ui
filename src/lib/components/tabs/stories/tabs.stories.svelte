<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { animate } from 'motion';
	import { Tabs as ATabs, Tab } from '..';

	// https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Atoms/Tabs',
		parameters: {
			// https://storybook.js.org/docs/configure/story-layout
			layout: 'fullscreen'
		},
		args: {
			disabled: false
		},
		argTypes: {
			disabled: {
				control: 'boolean',
				description: 'Disable all tab items'
			}
		}
	});
</script>

<script lang="ts">
	let value = $state('ar');

	const array = $state([
		{
			value: 'en',
			label: 'English',
			description: 'This content is teleported from Tab.Body to Tabs.Content component.'
		},
		{
			value: 'ar',
			label: 'Arabic',
			description: 'هذا المحتوى يتم نقله من Tab.Body إلى مكون Tabs.Content.'
		},
		{
			value: 'fr',
			label: 'French',
			description: 'Ce contenu est téléporté de Tab.Body vers le composant Tabs.Content.'
		}
	]);
</script>

<Story name="Basic" args={{ disabled: false }}>
	{#snippet template(args)}
		<div class="flex items-start justify-center p-8">
			<ATabs.Root class="w-96">
				<ATabs.Header class="border-b">
					{#each array as item, i (i)}
						<Tab.Root value={item.value} disabled={args.disabled}>
							<Tab.Header>{item.label}</Tab.Header>
							<Tab.Body class="p-4">
								<h3 class="font-bold mb-2">{item.label} Content</h3>
								<p>{item.description}</p>
							</Tab.Body>
						</Tab.Root>
					{/each}
				</ATabs.Header>

				<ATabs.Body>
					<ATabs.Content
						enter={(node) => {
							const duration = 0.3;
							animate(node, { opacity: [0, 1] }, { duration });
							return { duration };
						}}
						exit={(node) => {
							const duration = 0.1;
							animate(node, { opacity: [1, 0] }, { duration });
							return { duration };
						}}
					/>
				</ATabs.Body>
			</ATabs.Root>
		</div>
	{/snippet}
</Story>

<Story name="Uncontrolled" args={{}}>
	<ATabs.Root>
		<ATabs.Header class="border-b">
			{#each array as item, i (i)}
				<Tab.Root value={item.value}>
					<Tab.Header>{item.label}</Tab.Header>
					<Tab.Body class="p-4">
						<h3 class="font-bold mb-2">{item.label} Content</h3>
						<p>{item.description}</p>
					</Tab.Body>
				</Tab.Root>
			{/each}
		</ATabs.Header>

		<ATabs.Body>
			<ATabs.Content
				enter={(node) => {
					const duration = 0.3;
					animate(node, { opacity: [0, 1] }, { duration });
					return { duration };
				}}
				exit={(node) => {
					const duration = 0.1;
					animate(node, { opacity: [1, 0] }, { duration });
					return { duration };
				}}
			/>
		</ATabs.Body>
	</ATabs.Root>
</Story>

<!--
	Controlled: `bind:value` makes the active tab a two-way bound prop.
	Read it back for display, or set it from outside to switch tabs programmatically.
-->
<Story name="Controlled" args={{}}>
	<div class="flex flex-col items-center gap-4 p-8">
		<!-- Drive the tabs from outside the component -->
		<div class="flex items-center gap-2">
			<span class="text-muted-foreground text-sm">Jump to:</span>
			{#each array as item (item.value)}
				<button
					class={[
						'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
						value === item.value
							? 'bg-primary text-primary-foreground border-primary'
							: 'border-border hover:bg-muted'
					]}
					onclick={() => (value = item.value)}
				>
					{item.label}
				</button>
			{/each}
		</div>

		<ATabs.Root class="w-96" bind:value>
			<ATabs.Header class="border-b">
				{#each array as item, i (i)}
					<Tab.Root value={item.value}>
						<Tab.Header>{item.label}</Tab.Header>
						<Tab.Body class="p-4">
							<h3 class="font-bold mb-2">{item.label} Content</h3>
							<p>{item.description}</p>
						</Tab.Body>
					</Tab.Root>
				{/each}
			</ATabs.Header>

			<ATabs.Body>
				<!-- Tab bodies are defined separately and teleported to Tabs.Content -->
				<ATabs.Content
					enter={(node) => {
						const duration = 0.3;
						animate(node, { opacity: [0, 1] }, { duration });
						return { duration };
					}}
					exit={(node) => {
						const duration = 0.1;
						animate(node, { opacity: [1, 0] }, { duration });
						return { duration };
					}}
				/>
			</ATabs.Body>
		</ATabs.Root>

		<code class="bg-muted/50 text-muted-foreground rounded-md border px-3 py-2 text-xs font-mono">
			bind:value → <span class="text-foreground">"{value}"</span>
		</code>
	</div>
</Story>
