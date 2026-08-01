<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ContainerCmp from './container.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Container',
		parameters: { layout: 'fullscreen' },
		args: {
			type: 'inline-size',
			name: undefined
		},
		argTypes: {
			type: {
				control: 'select',
				options: ['inline-size', 'size'],
				description: 'CSS container-type value — "inline-size" tracks width only, "size" tracks both axes'
			},
			name: {
				control: 'text',
				description: 'Optional CSS container-name, enabling named container queries'
			}
		}
	});
</script>

<Story name="Basic">
	{#snippet template(args)}
		<ContainerCmp {...args} class="flex w-full flex-col items-center gap-4 p-4">
			<div class="flex w-full gap-4">
				{#each { length: 5 } as _, i (i)}
					<div class="bg-foreground h-80 flex-1 rounded-lg"></div>
				{/each}
			</div>

			<div class="bg-foreground h-80 w-[50cqw] rounded-lg"></div>
		</ContainerCmp>
	{/snippet}
</Story>

<Story name="Size Reporting" parameters={{ layout: 'fullscreen' }}>
	<ContainerCmp class="flex w-full flex-col gap-4 p-4">
		{#snippet children({ clientWidth, clientHeight })}
			<div class="bg-surface-2 rounded-lg p-4 text-sm">
				<p>Container dimensions (updated via ResizeObserver):</p>
				<p class="text-foreground-2 font-mono">
					{clientWidth} × {clientHeight} px
				</p>
			</div>
			<div class="flex w-full gap-4">
				{#each { length: 3 } as _, i (i)}
					<div class="bg-foreground h-40 flex-1 rounded-lg"></div>
				{/each}
			</div>
		{/snippet}
	</ContainerCmp>
</Story>

<Story name="Named Container" parameters={{ layout: 'fullscreen' }}>
	<ContainerCmp name="layout" class="flex w-full flex-col items-center gap-4 p-4">
		<div class="flex w-full gap-4">
			{#each { length: 4 } as _, i (i)}
				<div class="bg-foreground h-64 flex-1 rounded-lg"></div>
			{/each}
		</div>
		<p class="text-foreground-2 text-sm">
			This container is named "layout" and can be targeted with <code>@container layout</code> in CSS.
		</p>
	</ContainerCmp>
</Story>
