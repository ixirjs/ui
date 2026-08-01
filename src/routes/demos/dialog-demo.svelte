<script lang="ts">
	import { Dialog } from '$svelte-atoms/core/components/dialog';
	import { Button } from '$svelte-atoms/core/components/button';
	import { Input } from '$svelte-atoms/core/components/input';

	let open = $state(false);
	let teamName = $state('');
	let deleting = $state(false);

	const CONFIRM_PHRASE = 'delete my team';
	const canDelete = $derived(teamName.trim().toLowerCase() === CONFIRM_PHRASE);

	async function handleDelete() {
		if (!canDelete) return;
		deleting = true;
		await new Promise((r) => setTimeout(r, 1200));
		deleting = false;
		open = false;
		teamName = '';
	}
</script>

<!--
  Scenario: destructive "Delete team" confirmation dialog that
  requires typing a specific phrase to unlock — like GitHub / Vercel.
-->
<Button variant="destructive" class="w-full gap-2" onclick={() => (open = true)}>
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
		<path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
			d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
		/>
	</svg>
	Delete team…
</Button>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<div class="flex items-center gap-3">
				<div
					class="bg-destructive/10 text-destructive flex h-9 w-9 items-center justify-center rounded-full"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
							d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
						/>
					</svg>
				</div>
				<div>
					<h4 class="text-base font-semibold">Delete team</h4>
					<p class="text-muted-foreground text-xs">
						This action is permanent and cannot be undone.
					</p>
				</div>
			</div>
			<Dialog.CloseButton class="ml-auto self-start" />
		</Dialog.Header>

		<Dialog.Body class="space-y-4">
			<div class="bg-destructive/5 border-destructive/20 rounded-md border p-3 text-sm">
				<p class="text-destructive font-medium">
					You are about to delete <strong>Acme Corp</strong>.
				</p>
				<p class="text-muted-foreground mt-1 text-xs">
					All projects, members, and billing data will be permanently removed.
				</p>
			</div>

			<div>
				<label for="confirm-input" class="text-muted-foreground mb-1.5 block text-xs">
					Type <code class="bg-muted text-foreground rounded px-1 font-mono">{CONFIRM_PHRASE}</code> to
					confirm
				</label>
				<Input.Root class="rounded-md">
					<Input.Control
						id="confirm-input"
						bind:value={teamName}
						placeholder={CONFIRM_PHRASE}
						class="px-3 py-2 text-sm font-mono"
					/>
				</Input.Root>
			</div>
		</Dialog.Body>

		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => {
					open = false;
					teamName = '';
				}}
			>
				Cancel
			</Button>
			<Button
				variant="destructive"
				disabled={!canDelete || deleting}
				onclick={handleDelete}
				class="min-w-[120px] gap-2"
			>
				{#if deleting}
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
						class="animate-spin"
					>
						<path d="M21 12a9 9 0 1 1-6.219-8.56" />
					</svg>
					Deleting…
				{:else}
					Delete team
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
