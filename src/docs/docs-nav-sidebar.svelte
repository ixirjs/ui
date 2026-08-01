<script lang="ts">
	import type { PageContent } from './content-sidebar.svelte';
	import ContentSidebar from './content-sidebar.svelte';
	import { animateDrawerContent, Drawer } from '$lib/components/drawer';
	import { DURATION } from '$svelte-atoms/core';

	type Props = {
		data: PageContent[];
		pathname: string;
		open?: boolean;
		onclose?: () => void;
	};

	let { data, pathname, open = $bindable(false), onclose }: Props = $props();
</script>

<!-- Desktop: always-visible sticky sidebar -->
<ContentSidebar {data} {pathname} />

<!-- Mobile: Drawer from left -->
<Drawer.Root bind:open {onclose} side="left" class="lg:hidden">
	{#snippet children({ drawer })}
		<Drawer.Backdrop
			class={[
				'duration-75 bg-black/0 transition-[backdrop-filter]',
				drawer.state.props.open ? 'backdrop-grayscale-100' : ''
			]}
		/>
		<Drawer.Content
			class="bg-background border-border w-80 border-r p-0 shadow-xl flex flex-col"
			animate={animateDrawerContent({ duration: DURATION.smooth / 1000 })}
		>
			<Drawer.Header class="border-b border-border px-6 py-4 flex items-center justify-between">
				<h2 class="text-foreground text-lg font-semibold">Navigation</h2>
				<button
					class="text-muted-foreground hover:text-foreground transition-colors"
					onclick={() => (open = false)}
					aria-label="Close navigation"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				</button>
			</Drawer.Header>
			<Drawer.Body class="flex-1 overflow-y-auto p-0">
				<ContentSidebar {data} {pathname} mobile={true} />
			</Drawer.Body>
		</Drawer.Content>
	{/snippet}
</Drawer.Root>
