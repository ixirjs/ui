<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Dialog as ADialog } from '..';
	import { Popover } from '$svelte-atoms/core/components/popover';
	import { Button } from '../../button';
	import { zAnchor } from '$svelte-atoms/core/attachments';

	// A Portal is a containment scope.
	//
	// 1. CONTAINMENT: the Popover opened inside the Dialog resolves to the Dialog's own
	//    Portal, whose container is the Dialog card. floating-ui uses that as its (soft)
	//    boundary, so the Popover flips/shifts to stay within the Dialog and hide()s when
	//    the trigger scrolls out — rather than spilling into the viewport.
	//
	// 2. STICKY-UNDER: the Dialog header is `sticky` and registers itself
	//    as a ZLayer anchor (`zAnchor('dialog-header')`). The "Behind header" Popover
	//    declares `order={{ below: 'dialog-header' }}`, so it renders *beneath* the sticky
	//    header as it scrolls under it — while the default Popover renders above.
	const { Story } = defineMeta({
		title: 'Atoms/Dialog/Nested Popover',
		parameters: { layout: 'fullscreen' }
	});
</script>

<script lang="ts">
	let nestedOpen = $state(false);
	const filler = Array.from({ length: 14 }, (_, i) => i + 1);
</script>

<Story name="Nested Popover">
	<div class="flex flex-col items-start justify-center p-8">
		<Button variant="primary" onclick={() => (nestedOpen = true)}>Open Dialog</Button>

		<ADialog.Root class="bg-neutral-900/20" z-index={10} bind:open={nestedOpen}>
			<ADialog.Content class="h-[60svh] max-w-120">
				<!--
					Sticky header registered as a z-anchor. Inside a Dialog the Overlay host resets the
					ambient ZLayer to base 0, so a default `positioned` popover resolves to z≈10. We pick
					a header z (and matching anchor value) of 5 — below the default popover (10, "above
					header") and above the `{ below }` popover (5−1=4, "behind header"). The anchor value
					must equal the header's CSS z so computed order matches paint order.
				-->
				<ADialog.Header
					class="bg-card sticky top-0 z-5 flex items-center"
					{@attach zAnchor('dialog-header', 5)}
				>
					<div class="font-semibold">Containment demo</div>
					<ADialog.CloseButton class="ml-auto" />
				</ADialog.Header>

				<ADialog.Body class="flex flex-col gap-3 overflow-y-auto">
					<div class="flex gap-2">
						<!-- Default popover: renders ABOVE the sticky header. -->
						<Popover.Root placement="bottom">
							<Popover.Trigger class="rounded border px-3 py-1">Above header</Popover.Trigger>
							<Popover.Content class="w-56">
								<p class="p-2 text-sm">
									I clip to the Dialog and stack above the sticky header (default).
								</p>
							</Popover.Content>
						</Popover.Root>

						<!-- Sticky-under: ordered below the registered header anchor. -->
						<Popover.Root placement="bottom">
							<Popover.Trigger class="rounded border px-3 py-1">Behind header</Popover.Trigger>
							<Popover.Content class="w-56" order={{ below: 'dialog-header' }}>
								<p class="p-2 text-sm">
									I render <strong>under</strong> the sticky header — scroll up and the header passes
									over me.
								</p>
							</Popover.Content>
						</Popover.Root>
					</div>

					{#each filler as n (n)}
						<p class="text-muted-foreground">
							Row {n}. Scroll the dialog body; an open popover stays within this container (soft
							boundary) and never spills into the viewport.
						</p>
					{/each}
				</ADialog.Body>

				<ADialog.Footer class="gap-4">
					<button onclick={() => (nestedOpen = false)}>Close</button>
				</ADialog.Footer>
			</ADialog.Content>
		</ADialog.Root>
	</div>
</Story>
