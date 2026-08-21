<script lang="ts">
	// The API table: 180 / content / 96, description tucked under its type.
	import { DataGrid } from '$lib/components/datagrid';
	import type { PropDefinition } from '$docs/types';

	let { data = [] }: { data?: PropDefinition[] } = $props();

	// `...renderProps` and friends are the inherited Atom/render props — one toggle rather than the
	// same row repeated at the bottom of fifty tables.
	const isInherited = (row: PropDefinition) => row.name.startsWith('...');
	const hasInherited = $derived(data.some(isInherited));

	let showInherited = $state(false);

	const rows = $derived(showInherited ? data : data.filter((row) => !isInherited(row)));

	const HEAD =
		'text-muted-foreground px-3.5 py-[9px] text-left text-[11px] font-semibold tracking-[0.06em] uppercase';
</script>

<div class="border-border overflow-hidden rounded-[10px] border">
	<DataGrid.Root class="props-grid min-w-full" fallbackTemplate="180px minmax(0,1fr) 96px">
		<DataGrid.Header class="bg-bg-subtle max-[700px]:hidden">
			<DataGrid.Row class="border-border border-b">
				<DataGrid.Column width="180px" class={HEAD}>Prop</DataGrid.Column>
				<DataGrid.Column width="minmax(0,1fr)" class={HEAD}>Type</DataGrid.Column>
				<DataGrid.Column width="96px" class={HEAD}>Default</DataGrid.Column>
			</DataGrid.Row>
		</DataGrid.Header>

		<DataGrid.Body>
			{#each rows as item (item.name)}
				<DataGrid.Row class="border-border items-start border-b">
					<DataGrid.Cell
						class="text-foreground min-w-0 px-3.5 py-[11px] text-left font-mono text-[12.5px] font-medium break-words"
						>{item.name}</DataGrid.Cell
					>
					<DataGrid.Cell
						class="flex min-w-0 flex-col items-start gap-[5px] px-3.5 py-[11px] text-left"
					>
						<code class="text-muted-foreground font-mono text-xs leading-[1.5] break-words"
							>{item.type}</code
						>
						{#if item.description}
							<span class="text-muted-foreground text-[13px] leading-[1.55]"
								>{item.description}</span
							>
						{/if}
					</DataGrid.Cell>
					<DataGrid.Cell
						class="text-fg-faint min-w-0 px-3.5 py-[11px] text-left font-mono text-xs break-words"
						>{item.default}</DataGrid.Cell
					>
				</DataGrid.Row>
			{/each}
		</DataGrid.Body>
	</DataGrid.Root>

	{#if hasInherited}
		<button
			type="button"
			onclick={() => (showInherited = !showInherited)}
			aria-expanded={showInherited}
			class="bg-bg-subtle text-muted-foreground hover:text-foreground flex w-full cursor-pointer items-center gap-2 border-0 px-3.5 py-2.5 text-left text-[12.5px] transition-colors"
		>
			<svg
				width="12"
				height="12"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				aria-hidden="true"
				class={['shrink-0 transition-transform', showInherited ? 'rotate-90' : '']}
			>
				<path d="m9 6 6 6-6 6" />
			</svg>
			{showInherited
				? 'Hide inherited props'
				: 'Show inherited props — class, style, ref, data-*, ARIA'}
		</button>
	{/if}
</div>

<style>
	/* DataGrid takes its columns from an inline `--template-columns`, so the narrow-screen fallback
	   has to out-rank that. `:global` because the class reaches DataGrid.Root as a prop; 180 + 96 of
	   fixed track leaves the type column unreadable on a phone. */
	@media (max-width: 700px) {
		:global(.props-grid) {
			--template-columns: minmax(0, 1fr) !important;
		}
	}
</style>
