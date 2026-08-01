<script lang="ts">
	import { Drawer } from '$lib/components/drawer';
	import { Button } from '$lib/components/button';

	let open = $state(false);

	const notifications = [
		{ title: 'New message from Alex', time: '2 min ago', read: false },
		{ title: 'Your report is ready', time: '1 hour ago', read: false },
		{ title: 'Deployment succeeded', time: '3 hours ago', read: true }
	];
</script>

<div class="flex flex-wrap gap-3">
	<Button onclick={() => (open = true)}>Open Notifications</Button>
	<Drawer.Root bind:open>
		<Drawer.Content class="w-80 flex flex-col">
			<Drawer.Header class="border-b border-border px-6 py-4">
				<div class="flex items-center justify-between">
					<div>
						<Drawer.Title>Notifications</Drawer.Title>
						<Drawer.Description class="mt-1"
							>You have {notifications.filter((n) => !n.read).length} unread</Drawer.Description
						>
					</div>
				</div>
			</Drawer.Header>
			<Drawer.Body class="flex-1 overflow-y-auto px-4 py-3">
				<div class="space-y-2">
					{#each notifications as n, i (i)}
						<div
							class="flex items-start gap-3 rounded-lg p-3 transition-colors {n.read
								? 'bg-muted/30 hover:bg-muted/50'
								: 'bg-primary/5 hover:bg-primary/10 border border-primary/20'}"
						>
							<div
								class="mt-1.5 size-2.5 shrink-0 rounded-full {n.read
									? 'bg-muted-foreground/40'
									: 'bg-primary'}"
							></div>
							<div class="flex-1 min-w-0">
								<p
									class="text-sm font-medium {n.read
										? 'text-muted-foreground'
										: 'text-foreground'} leading-tight"
								>
									{n.title}
								</p>
								<p class="text-muted-foreground text-xs mt-1">{n.time}</p>
							</div>
						</div>
					{/each}
				</div>
			</Drawer.Body>
			<Drawer.Footer class="border-t border-border px-6 py-4">
				<Button variant="primary" class="w-full" onclick={() => (open = false)}
					>Mark all as read</Button
				>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
</div>
