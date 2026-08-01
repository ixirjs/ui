<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
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

<!--
	Real-world: an account settings panel. Each Tab.Body holds a section of the
	form; the active section is teleported into Tabs.Content below the header.
-->
<Story name="Account Settings" args={{}}>
	<div class="flex items-start justify-center p-8">
		<ATabs.Root class="w-96" value="profile">
			<ATabs.Header>
				<Tab.Root value="profile">
					<Tab.Header>Profile</Tab.Header>
					<Tab.Body class="flex flex-col gap-3 p-4">
						<label class="flex flex-col gap-1 text-sm">
							Display name
							<input
								class="rounded-md border px-2.5 py-1.5 text-sm"
								type="text"
								value="Ada Lovelace"
							/>
						</label>
						<label class="flex flex-col gap-1 text-sm">
							Email
							<input
								class="rounded-md border px-2.5 py-1.5 text-sm"
								type="email"
								value="ada@example.com"
							/>
						</label>
					</Tab.Body>
				</Tab.Root>

				<Tab.Root value="password">
					<Tab.Header>Password</Tab.Header>
					<Tab.Body class="flex flex-col gap-3 p-4">
						<label class="flex flex-col gap-1 text-sm">
							Current password
							<input class="rounded-md border px-2.5 py-1.5 text-sm" type="password" />
						</label>
						<label class="flex flex-col gap-1 text-sm">
							New password
							<input class="rounded-md border px-2.5 py-1.5 text-sm" type="password" />
						</label>
					</Tab.Body>
				</Tab.Root>

				<Tab.Root value="billing">
					<Tab.Header>Billing</Tab.Header>
					<Tab.Body class="flex flex-col gap-2 p-4 text-sm">
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">Plan</span>
							<span class="font-medium">Pro</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">Renews</span>
							<span class="font-medium">Jan 1, 2027</span>
						</div>
					</Tab.Body>
				</Tab.Root>
			</ATabs.Header>

			<ATabs.Body>
				<ATabs.Content />
			</ATabs.Body>
		</ATabs.Root>
	</div>
</Story>

<Story name="Basic" args={{ disabled: false }}>
	{#snippet template(args)}
		<div class="flex items-start justify-center p-8">
			<ATabs.Root class="w-96">
				<ATabs.Header>
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
					<ATabs.Content />
				</ATabs.Body>
			</ATabs.Root>
		</div>
	{/snippet}
</Story>

<Story name="Uncontrolled" args={{}}>
	<ATabs.Root>
		<ATabs.Header>
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
			<ATabs.Content />
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
			<ATabs.Header>
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
				<ATabs.Content />
			</ATabs.Body>
		</ATabs.Root>

		<code class="bg-muted/50 text-muted-foreground rounded-md border px-3 py-2 text-xs font-mono">
			bind:value → <span class="text-foreground">"{value}"</span>
		</code>
	</div>
</Story>
