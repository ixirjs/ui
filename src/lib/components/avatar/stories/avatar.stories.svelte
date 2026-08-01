<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Avatar } from '..';

	const { Story } = defineMeta({
		title: 'Atoms/Avatar',
		parameters: { layout: 'centered' },
		args: {
			alt: 'Jane Doe',
			src: ''
		},
		argTypes: {
			alt: {
				control: 'text',
				description: 'Alternative text — also used to derive initials when no image is available'
			},
			src: {
				control: 'text',
				description: 'Image URL. Leave empty to show the initials fallback.'
			}
		}
	});
</script>

<Story name="Basic">
	{#snippet template(args)}
		<Avatar {...args} />
	{/snippet}
</Story>

<Story name="Initials Fallback">
	<div class="flex items-center gap-4">
		<Avatar alt="Jane Doe" />
		<Avatar alt="John Smith" />
		<Avatar alt="Alice" />
		<Avatar alt="Bob Martinez" />
	</div>
</Story>

<Story name="With Image">
	<div class="flex items-center gap-4">
		<Avatar src="https://picsum.photos/seed/avatar1/80/80" alt="User photo" />
		<Avatar src="https://picsum.photos/seed/avatar2/80/80" alt="Second user" />
		<Avatar alt="Broken Image" src="https://example.com/does-not-exist.jpg" />
	</div>
</Story>

<Story name="States">
	<div class="flex flex-col gap-4">
		<div class="flex items-center gap-3">
			<Avatar alt="Jane Doe" />
			<span class="text-sm">Initials (no image)</span>
		</div>
		<div class="flex items-center gap-3">
			<Avatar src="https://picsum.photos/seed/avatar3/80/80" alt="With photo" />
			<span class="text-sm">With photo</span>
		</div>
		<div class="flex items-center gap-3">
			<Avatar alt="Broken" src="https://example.com/does-not-exist.jpg" />
			<span class="text-sm">Broken src falls back to initials</span>
		</div>
	</div>
</Story>

<Story name="Sizes">
	<div class="flex items-end gap-4">
		<Avatar alt="XS" class="h-6 text-[10px]" />
		<Avatar alt="SM" class="h-8 text-xs" />
		<Avatar alt="MD" />
		<Avatar alt="LG" class="h-14 text-base" />
		<Avatar alt="XL" class="h-20 text-xl" />
	</div>
</Story>

<Story name="Group">
	<div class="flex -space-x-3">
		<Avatar
			src="https://picsum.photos/seed/avatar1/80/80"
			alt="User 1"
			class="ring-background ring-2"
		/>
		<Avatar alt="Jane Doe" class="ring-background ring-2" />
		<Avatar alt="John Smith" class="ring-background ring-2" />
		<Avatar alt="+4" class="ring-background ring-2" />
	</div>
</Story>

<Story name="Team Members">
	<!-- Real-world use case: a member list row, avatar paired with name + role -->
	<div class="w-80 rounded-xl border p-4">
		<h3 class="mb-3 text-sm font-semibold">Project team</h3>
		<ul class="flex flex-col gap-3">
			<li class="flex items-center gap-3">
				<Avatar src="https://picsum.photos/seed/avatar2/80/80" alt="Jane Doe" />
				<div class="min-w-0">
					<p class="truncate text-sm font-medium">Jane Doe</p>
					<p class="text-muted-foreground truncate text-xs">Product designer</p>
				</div>
			</li>
			<li class="flex items-center gap-3">
				<Avatar alt="Marcus Lee" />
				<div class="min-w-0">
					<p class="truncate text-sm font-medium">Marcus Lee</p>
					<p class="text-muted-foreground truncate text-xs">Frontend engineer</p>
				</div>
			</li>
			<li class="flex items-center gap-3">
				<Avatar alt="Priya Nair" />
				<div class="min-w-0">
					<p class="truncate text-sm font-medium">Priya Nair</p>
					<p class="text-muted-foreground truncate text-xs">Engineering manager</p>
				</div>
			</li>
		</ul>
	</div>
</Story>
