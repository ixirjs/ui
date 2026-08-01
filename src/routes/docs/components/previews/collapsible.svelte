<script lang="ts">
	import { Collapsible } from '$lib/components/collapsible';

	let collOpen = $state(false);
</script>

<div class="w-52">
	<Collapsible.Root bind:open={collOpen} class="border-none bg-muted/50">
		<Collapsible.Header
			class="flex items-center justify-between px-3 py-2 cursor-pointer rounded-lg hover:bg-muted/60 text-sm font-medium border border-border"
		>
			<span>Toggle details</span>
			<svg
				class="h-4 w-4 transition-transform duration-200 {collOpen ? 'rotate-180' : ''}"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="m6 9 6 6 6-6" />
			</svg>
		</Collapsible.Header>
		<Collapsible.Body>
			<p
				class="px-3 py-2 text-xs text-muted-foreground bg-muted/20 rounded-b-lg border border-t-0 border-border"
			>
				Hidden content with smooth height animation.
			</p>
		</Collapsible.Body>
	</Collapsible.Root>
</div>
