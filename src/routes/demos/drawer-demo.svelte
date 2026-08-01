<script lang="ts">
	import { clickoutDrawer, Drawer } from '$svelte-atoms/core/components/drawer';
	import { Button } from '$svelte-atoms/core/components/button';
	import { Badge } from '$svelte-atoms/core/components/badge';
	import Icon from '$svelte-atoms/core/components/icon/icon.svelte';
	import CloseIcon from '$svelte-atoms/core/icons/icon-close.svelte';

	let open = $state(false);

	type Notification = {
		id: number;
		title: string;
		body: string;
		time: string;
		read: boolean;
		type: 'mention' | 'deploy' | 'comment';
	};

	let notifications = $state<Notification[]>([
		{
			id: 1,
			title: 'Adrian mentioned you',
			body: 'In "Q4 Roadmap" — @you can you review the API spec?',
			time: '2m ago',
			read: false,
			type: 'mention'
		},
		{
			id: 2,
			title: 'Deploy succeeded',
			body: 'Production · main@a3f9c12 deployed in 47s',
			time: '14m ago',
			read: false,
			type: 'deploy'
		},
		{
			id: 3,
			title: 'Sara commented',
			body: 'On "Auth refactor" — looks good, just one nit on line 42.',
			time: '1h ago',
			read: false,
			type: 'comment'
		},
		{
			id: 4,
			title: 'Deploy failed',
			body: 'Staging · feat/notifications@b12f failed at build step',
			time: '3h ago',
			read: true,
			type: 'deploy'
		}
	]);

	const unread = $derived(notifications.filter((n) => !n.read).length);

	function markAllRead() {
		notifications = notifications.map((n) => ({ ...n, read: true }));
	}

	function dismiss(id: number) {
		notifications = notifications.filter((n) => n.id !== id);
	}

	const icons: Record<Notification['type'], string> = {
		mention: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
		deploy:
			'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
		comment: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'
	};

	const colors: Record<Notification['type'], string> = {
		mention: 'bg-blue-500/10 text-blue-500',
		deploy: 'bg-green-500/10 text-green-500',
		comment: 'bg-primary/10 text-primary'
	};
</script>

<!--
  Scenario: notification tray drawer — a real app-shell pattern.
-->
<Drawer.Root bind:open side="right">
	<Drawer.Content
		class="bg-background border-border fixed top-0 right-0 flex h-full w-80 flex-col border-l shadow-xl"
		{@attach clickoutDrawer()}
	>
		<Drawer.Header class="border-border flex items-center justify-between border-b px-4 py-3">
			<Drawer.Title class="flex items-center gap-2 text-base font-semibold">
				Notifications
				{#if unread > 0}
					<Badge variant="primary" class="px-1.5 py-0 text-[10px]">{unread}</Badge>
				{/if}
			</Drawer.Title>
			<div class="flex items-center gap-1">
				{#if unread > 0}
					<button
						onclick={markAllRead}
						class="text-muted-foreground hover:text-primary rounded px-2 py-1 text-xs transition-colors"
					>
						Mark all read
					</button>
				{/if}
				<button
					onclick={() => (open = false)}
					class="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
				>
					<Icon class="h-4 w-4"><CloseIcon /></Icon>
				</button>
			</div>
		</Drawer.Header>

		<Drawer.Body class="flex-1 overflow-y-auto">
			{#if notifications.length === 0}
				<div
					class="text-muted-foreground flex flex-col items-center justify-center gap-2 py-16 text-sm"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="opacity-30"
					>
						<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path
							d="M13.73 21a2 2 0 0 1-3.46 0"
						/>
					</svg>
					All caught up!
				</div>
			{:else}
				{#each notifications as n (n.id)}
					<div
						class="border-border group relative flex gap-3 border-b px-4 py-3 {n.read
							? 'opacity-60'
							: ''}"
					>
						{#if !n.read}
							<span class="bg-primary absolute top-4 left-2 h-1.5 w-1.5 rounded-full"></span>
						{/if}
						<div
							class="shrink-0 {colors[
								n.type
							]} mt-0.5 flex h-8 w-8 items-center justify-center rounded-full"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d={icons[n.type]} />
							</svg>
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-medium">{n.title}</p>
							<p class="text-muted-foreground mt-0.5 text-xs leading-relaxed">{n.body}</p>
							<p class="text-muted-foreground mt-1 text-[10px]">{n.time}</p>
						</div>
						<button
							onclick={() => dismiss(n.id)}
							class="text-muted-foreground hover:text-foreground invisible absolute top-2.5 right-3 rounded p-1 opacity-0 transition-all group-hover:visible group-hover:opacity-100"
							aria-label="Dismiss"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M18 6 6 18M6 6l12 12" />
							</svg>
						</button>
					</div>
				{/each}
			{/if}
		</Drawer.Body>

		<Drawer.Footer class="border-border border-t px-4 py-3">
			<a
				href="/notifications"
				class="text-muted-foreground hover:text-foreground text-center text-xs transition-colors w-full block"
			>
				View all notifications →
			</a>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>

<Button variant="outline" class="relative w-full gap-2" onclick={() => (open = true)}>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
	</svg>
	Notifications
	{#if unread > 0}
		<Badge variant="primary" class="ml-auto px-1.5 py-0 text-[10px]">{unread}</Badge>
	{/if}
</Button>
