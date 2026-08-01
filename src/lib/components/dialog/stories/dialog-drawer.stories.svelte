<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Dialog as ADialog } from '..';
	import { clickoutDrawer, Drawer, animateDrawerContent } from '../../drawer';
	import { Button } from '../../button';

	// A Drawer opened *inside* Dialog content resolves to the Dialog's own
	// Portal scope, so its backdrop and panel slide in over the dialog card rather than the
	// viewport. See "Containment" / "Nested Popover" for the same scoping with a Popover.
	const { Story } = defineMeta({
		title: 'Atoms/Dialog/Drawer',
		parameters: { layout: 'fullscreen' }
	});
</script>

<script lang="ts">
	let open = $state(false);
	let drawerOpen = $state(false);

	const filters = ['Active', 'Archived', 'Starred', 'Shared with me'];
	// Track selected filters so the drawer demonstrates real interaction, not just layout.
	let selected = $state<string[]>(['Active']);

	const toggle = (item: string) => {
		selected = selected.includes(item) ? selected.filter((f) => f !== item) : [...selected, item];
	};
</script>

<!-- Drawer-in-Dialog: the nested Drawer is contained by the Dialog's Portal, not the viewport. -->
<Story name="Drawer">
	<div class="flex flex-col items-start gap-3 p-8">
		<Button variant="primary" onclick={() => (open = true)}>Open dialog</Button>
		<!-- Live readout — house style for interactive stories. -->
		<code class="text-muted-foreground font-mono text-xs">
			drawer open → {drawerOpen} · filters → [{selected.join(', ')}]
		</code>

		<ADialog.Root class="bg-neutral-900/40" z-index={10} bind:open type="modal">
			<ADialog.Content class="relative h-100 max-w-2xl overflow-hidden">
				<ADialog.Header class="flex items-center">
					<ADialog.Title>Project</ADialog.Title>
					<ADialog.CloseButton class="ml-auto" />
				</ADialog.Header>

				<ADialog.Body class="flex-1">
					<ADialog.Description>
						Open the filters drawer — it slides in from the right edge of <strong>this card</strong
						>, bounded by the dialog's own Portal rather than the page viewport.
					</ADialog.Description>
					<Button class="mt-4" variant="outline" onclick={() => (drawerOpen = true)}>
						Open filters
					</Button>
				</ADialog.Body>

				<Drawer.Root bind:open={drawerOpen} side="right" position="absolute">
					<Drawer.Backdrop class="bg-black/30 backdrop-blur-sm" />
					<Drawer.Content
						class="bg-background flex h-full w-72 flex-col border-l shadow-xl"
						animate={animateDrawerContent()}
						{@attach clickoutDrawer((_, bond) => {
							bond?.state?.close?.();
						})}
					>
						<!-- justify-between keeps the close button pinned top-right beside the title block. -->
						<Drawer.Header class="flex items-start justify-between gap-4 border-b px-5 py-4">
							<div class="flex flex-col gap-0.5">
								<Drawer.Title class="text-base font-semibold">Filters</Drawer.Title>
								<Drawer.Description class="text-muted-foreground text-sm">
									Narrow the results.
								</Drawer.Description>
							</div>
							<button
								class="text-muted-foreground hover:bg-muted hover:text-foreground -mr-1 rounded-md p-1.5 transition-colors"
								onclick={() => (drawerOpen = false)}
								aria-label="Close drawer"
							>
								&#x2715;
							</button>
						</Drawer.Header>

						<Drawer.Body class="flex-1 overflow-y-auto px-3 py-3">
							<div class="flex flex-col gap-0.5">
								{#each filters as item (item)}
									{@const isSelected = selected.includes(item)}
									<button
										class={[
											'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
											isSelected
												? 'bg-primary/10 text-foreground font-medium'
												: 'text-muted-foreground hover:bg-muted hover:text-foreground'
										]}
										aria-pressed={isSelected}
										onclick={() => toggle(item)}
									>
										<!-- Checkbox-style indicator reflects selection state. -->
										<span
											class={[
												'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
												isSelected
													? 'border-primary bg-primary text-primary-foreground'
													: 'border-border'
											]}
										>
											{#if isSelected}
												<svg
													class="size-3"
													viewBox="0 0 16 16"
													fill="none"
													stroke="currentColor"
													stroke-width="2.5"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<path d="M3 8.5 6.5 12 13 4" />
												</svg>
											{/if}
										</span>
										{item}
									</button>
								{/each}
							</div>
						</Drawer.Body>

						<Drawer.Footer class="flex items-center gap-2 border-t px-5 py-4">
							<button
								class="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
								onclick={() => (selected = [])}
							>
								Clear
							</button>
							<button
								class="bg-primary text-primary-foreground hover:bg-primary/90 ml-auto rounded-md px-4 py-2 text-sm font-medium transition-colors"
								onclick={() => (drawerOpen = false)}
							>
								Apply{selected.length ? ` (${selected.length})` : ''}
							</button>
						</Drawer.Footer>
					</Drawer.Content>
				</Drawer.Root>

				<ADialog.Footer class="flex justify-end gap-2">
					<Button variant="outline" onclick={() => (open = false)}>Close</Button>
				</ADialog.Footer>
			</ADialog.Content>
		</ADialog.Root>
	</div>
</Story>
