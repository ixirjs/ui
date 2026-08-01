<script lang="ts">
	import { animateDrawerContent, Drawer } from '$lib/components/drawer';
	import { DURATION } from '$svelte-atoms/core';

	type TocEntry = { id: string; text: string };

	type Props = {
		toc: TocEntry[];
		activeId?: string;
		open?: boolean;
		onclose?: () => void;
	};

	let { toc, activeId = '', open = $bindable(false), onclose }: Props = $props();

	function handleClose() {
		open = false;
		onclose?.();
	}

	function handleAnchorClick(event: MouseEvent, id: string) {
		event.preventDefault();
		handleClose();

		setTimeout(() => {
			const target = document.getElementById(id);
			target?.scrollIntoView({ behavior: 'smooth' });
		}, 300);
	}
</script>

<!-- Desktop: always-visible fixed aside -->
{#if toc.length > 0}
	<div class="hidden w-52 shrink-0 xl:block" aria-hidden="true"></div>
	<aside
		class="bg-background fixed top-14 right-6 hidden h-[calc(100vh-3.5rem)] w-52 shrink-0 overflow-y-auto docs-scroll xl:block"
	>
		<div class="py-6 text-sm">
			<p class="text-muted-foreground mb-3 px-2 text-xs font-semibold uppercase tracking-widest">
				On this page
			</p>
			<nav class="flex flex-col">
				{#each toc as entry (entry.id)}
					<a
						href="#{entry.id}"
						onclick={(e) => handleAnchorClick(e, entry.id)}
						class={[
							'border-l-2 py-1.5 pl-3 pr-2 text-sm transition-colors',
							activeId === entry.id
								? 'border-primary text-foreground font-medium'
								: 'border-border text-muted-foreground hover:text-foreground'
						]}>{entry.text}</a
					>
				{/each}
			</nav>
		</div>
	</aside>
{/if}

<!-- Mobile: Drawer from right -->
<Drawer.Root bind:open {onclose} side="right" class="lg:hidden z-50">
	{#snippet children({ drawer })}
		<Drawer.Backdrop
			class={[
				'duration-75 bg-black/0 transition-[backdrop-filter]',
				drawer.state.props.open ? 'backdrop-grayscale-100' : ''
			]}
		/>
		<Drawer.Content
			class="bg-background border-border w-80 border-l p-0 shadow-xl flex flex-col"
			animate={animateDrawerContent({ duration: DURATION.smooth / 1000 })}
		>
			<Drawer.Header class="border-b border-border px-6 py-4 flex items-center justify-between">
				<h4 class="text-foreground text-lg font-semibold">On this page</h4>
				<button
					class="text-muted-foreground hover:text-foreground transition-colors"
					onclick={() => (open = false)}
					aria-label="Close table of contents"
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
			<Drawer.Body as="nav" class="flex-1 overflow-y-auto py-4">
				<div class="flex flex-col">
					{#each toc as entry (entry.id)}
						<a
							href="#{entry.id}"
							onclick={(e) => handleAnchorClick(e, entry.id)}
							class={[
								'border-l-2 mx-4 py-2 pl-3 pr-2 rounded-r-md text-sm transition-colors',
								activeId === entry.id
									? 'border-primary text-foreground bg-primary/8 font-medium'
									: 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
							]}>{entry.text}</a
						>
					{/each}
				</div>
			</Drawer.Body>
		</Drawer.Content>
	{/snippet}
</Drawer.Root>
