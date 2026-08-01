<script lang="ts">
	import { Tooltip } from '$svelte-atoms/core/components/tooltip';
	import { Button } from '$svelte-atoms/core/components/button';

	let open = $state(false);
</script>

<!--
  Scenario: a "Publish" action that's disabled because there are
  unsaved changes — tooltip explains why the button is disabled.
-->
<Tooltip.Root bind:open offset={0}>
	<Tooltip.Trigger
		base={Button}
		variant="primary"
		class="w-full cursor-not-allowed opacity-50"
		aria-disabled="true"
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
			class="mr-1.5"
		>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line
				x1="12"
				x2="12"
				y1="3"
				y2="15"
			/>
		</svg>
		Publish
	</Tooltip.Trigger>
	<Tooltip.Content class="bg-popover border-border rounded-md border px-3 py-2 text-xs shadow-md">
		<p class="font-medium">Unsaved changes</p>
		<p class="text-muted-foreground mt-0.5">Save your draft before publishing.</p>
		<Tooltip.Arrow />
	</Tooltip.Content>
</Tooltip.Root>
