<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { List } from '..';

	const { Story } = defineMeta({
		title: 'Atoms/List',
		parameters: { layout: 'centered' }
	});
</script>

<!-- A List is a semantic container (default <ul>); Items, Titles, Dividers, and Groups compose inside. -->

<Story name="Basic">
	<div class="w-48">
		<List.Root>
			<List.Item>Dashboard</List.Item>
			<List.Item>Projects</List.Item>
			<List.Item>Settings</List.Item>
		</List.Root>
	</div>
</Story>

<Story name="With Title and Divider">
	<!-- Titles label sections; Dividers separate them. -->
	<div class="w-48">
		<List.Root>
			<List.Title>Account</List.Title>
			<List.Item>Profile</List.Item>
			<List.Item>Billing</List.Item>
			<List.Divider />
			<List.Title>Workspace</List.Title>
			<List.Item>Members</List.Item>
			<List.Item>Teams</List.Item>
		</List.Root>
	</div>
</Story>

<Story name="Navigation Menu">
	<!-- Real-world: a sidebar-style nav list. -->
	<div class="bg-card w-56 rounded-lg border p-2">
		<List.Root>
			<List.Title>General</List.Title>
			<List.Item>Overview</List.Item>
			<List.Item>Activity</List.Item>
			<List.Divider />
			<List.Title>Settings</List.Title>
			<List.Item>Profile</List.Item>
			<List.Item>Security</List.Item>
			<List.Item>Billing</List.Item>
		</List.Root>
	</div>
</Story>
