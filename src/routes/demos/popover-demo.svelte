<script lang="ts">
	import { Popover } from '$ixirjs/ui/components/popover';
	import { Button } from '$ixirjs/ui/components/button';
	import { Badge } from '$ixirjs/ui/components/badge';

	let open = $state(false);

	const filters = ['Bug', 'Feature', 'Design', 'Docs'];
	let active = $state<string[]>(['Bug']);

	function toggle(f: string) {
		active = active.includes(f) ? active.filter((x) => x !== f) : [...active, f];
	}
</script>

<!--
  Scenario: an issue tracker "Filter" button that opens a label
  picker popover — a real pattern from GitHub / Linear.
-->
<Popover.Root bind:open offset={0}>
	<Popover.Trigger base={Button} variant="outline" class="gap-2">
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
			<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
		</svg>
		Filter
		{#if active.length}
			<Badge variant="primary" class="ml-1 px-1.5 py-0 text-[10px]">{active.length}</Badge>
		{/if}
		<Popover.Indicator class="ml-1" />
	</Popover.Trigger>

	<Popover.Content class="bg-popover border-border w-52 rounded-lg border p-3 shadow-lg">
		<p class="text-muted-foreground mb-2 px-1 text-xs font-semibold tracking-wide uppercase">
			Labels
		</p>
		<div class="space-y-0.5">
			{#each filters as label, i (i)}
				<button
					onclick={() => toggle(label)}
					class="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
				>
					<span
						class="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border {active.includes(
							label
						)
							? 'bg-primary border-primary'
							: 'border-border'}"
					>
						{#if active.includes(label)}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="10"
								height="10"
								viewBox="0 0 24 24"
								fill="none"
								stroke="white"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg
							>
						{/if}
					</span>
					{label}
				</button>
			{/each}
		</div>
		<div class="border-border mt-2 border-t pt-2">
			<button
				onclick={() => (active = [])}
				class="text-muted-foreground hover:text-foreground w-full rounded px-2 py-1 text-left text-xs transition-colors"
			>
				Clear filters
			</button>
		</div>
		<Popover.Tail />
	</Popover.Content>
</Popover.Root>
