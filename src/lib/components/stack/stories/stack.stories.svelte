<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Atoms/Stack',
		parameters: {
			layout: 'centered'
		},
		args: {
			value: 'c'
		},
		argTypes: {
			value: {
				control: 'select',
				options: ['a', 'b', 'c'],
				description: 'The value of the topmost (front) item — bindable, updates reactively'
			}
		}
	});
</script>

<script lang="ts">
	import { Stack } from '..';
	import type { StackBond } from '../bond.svelte';
	import { Button } from '$lib/components/button';

	// Photo editing layers scenario
	const layers = [
		{
			id: 'background',
			label: 'Background',
			bg: 'bg-gradient-to-br from-sky-300 to-blue-500',
			emoji: '🌄'
		},
		{
			id: 'shapes',
			label: 'Shapes',
			bg: 'bg-gradient-to-br from-pink-400 to-rose-500',
			emoji: '🔷'
		},
		{
			id: 'text',
			label: 'Text Layer',
			bg: 'bg-gradient-to-br from-amber-300 to-orange-500',
			emoji: '✏️'
		},
		{
			id: 'overlay',
			label: 'Overlay',
			bg: 'bg-gradient-to-br from-emerald-400 to-green-600',
			emoji: '🎨'
		},
		{
			id: 'effects',
			label: 'Effects',
			bg: 'bg-gradient-to-br from-violet-400 to-purple-600',
			emoji: '✨'
		}
	];

	let selected = $state('background');
	let root: { getBond: () => StackBond } | undefined = $state();
	const bond = $derived(root?.getBond());

	function getLabel(id: string) {
		return layers.find((l) => l.id === id)?.label ?? id;
	}

	function getEmoji(id: string) {
		return layers.find((l) => l.id === id)?.emoji ?? '';
	}
</script>

<Story name="Basic">
	{#snippet template(args)}
		<div class="relative" style="width: 340px; height: 240px;">
			<Stack.Root {...args} class="relative h-full w-full">
				<Stack.Item
					value="a"
					class="absolute flex items-center justify-center rounded-xl bg-linear-to-br from-sky-300 to-blue-500 text-white shadow-lg"
					style="width: 180px; height: 120px; top: 20px; left: 20px;"
				>
					<span class="text-sm font-semibold drop-shadow">Layer A</span>
				</Stack.Item>
				<Stack.Item
					value="b"
					class="absolute flex items-center justify-center rounded-xl bg-linear-to-br from-pink-400 to-rose-500 text-white shadow-lg"
					style="width: 180px; height: 120px; top: 60px; left: 80px;"
				>
					<span class="text-sm font-semibold drop-shadow">Layer B</span>
				</Stack.Item>
				<Stack.Item
					value="c"
					class="absolute flex items-center justify-center rounded-xl bg-linear-to-br from-violet-400 to-purple-600 text-white shadow-lg"
					style="width: 180px; height: 120px; top: 100px; left: 140px;"
				>
					<span class="text-sm font-semibold drop-shadow">Layer C</span>
				</Stack.Item>
			</Stack.Root>
		</div>
	{/snippet}
</Story>

<Story name="Layer Manager">
	<div class="flex gap-6 p-6" style="width: 820px;">
		<!-- Layer panel (left) -->
		<div class="border-border bg-card flex w-60 shrink-0 flex-col rounded-lg border">
			<div class="border-border border-b px-4 py-3">
				<h3 class="text-foreground text-sm font-semibold">Layers</h3>
			</div>

			<!-- Layer list -->
			<div class="flex flex-1 flex-col gap-1 p-2">
				{#each [...(bond?.state.items ?? [])].reverse() as item (item.id)}
					<button
						class={[
							'flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-all',
							selected === item.id
								? 'bg-primary/10 text-primary ring-primary/30 ring-1'
								: 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
						]}
						onclick={() => (selected = item.id)}
					>
						<span class="text-base">{getEmoji(item.id)}</span>
						<span class="flex-1 font-medium">{getLabel(item.id)}</span>
						<span class="text-muted-foreground tabular-nums text-xs"
							>z{bond?.getZIndex(item.id)}</span
						>
					</button>
				{/each}
			</div>

			<!-- Controls -->
			<div class="border-border flex flex-wrap gap-1.5 border-t p-2">
				<Button
					variant="outline"
					size="sm"
					class="flex-1 text-xs"
					onclick={() => bond?.bringToFront(selected)}
				>
					⬆ Front
				</Button>
				<Button
					variant="outline"
					size="sm"
					class="flex-1 text-xs"
					onclick={() => bond?.state.bringForward(selected)}
				>
					↑ Up
				</Button>
				<Button
					variant="outline"
					size="sm"
					class="flex-1 text-xs"
					onclick={() => bond?.state.sendBackward(selected)}
				>
					↓ Down
				</Button>
				<Button
					variant="outline"
					size="sm"
					class="flex-1 text-xs"
					onclick={() => bond?.sendToBack(selected)}
				>
					⬇ Back
				</Button>
			</div>
		</div>

		<!-- Canvas (right) -->
		<div class="flex flex-1 flex-col gap-3">
			<div
				class="border-border bg-muted relative overflow-hidden rounded-lg border"
				style="height: 400px;"
			>
				<Stack.Root bind:this={root} class="relative h-full w-full">
					{#each layers as layer, i (layer.id)}
						<Stack.Item
							value={layer.id}
							class={[
								'absolute flex cursor-pointer flex-col items-center justify-center rounded-xl text-white shadow-lg transition-all',
								layer.bg,
								selected === layer.id
									? 'ring-4 ring-white/80 ring-offset-2'
									: 'hover:brightness-110'
							]}
							style="width: 180px; height: 120px; top: {30 + i * 40}px; left: {40 + i * 60}px;"
							onclick={() => (selected = layer.id)}
						>
							<span class="text-2xl">{layer.emoji}</span>
							<span class="mt-1 text-sm font-semibold drop-shadow">{layer.label}</span>
						</Stack.Item>
					{/each}
				</Stack.Root>
			</div>

			<!-- Breadcrumb order -->
			<div class="text-muted-foreground flex items-center gap-1.5 text-xs">
				<span class="text-foreground font-medium">Back → Front:</span>
				{#each bond?.state.items ?? [] as item, i (item.id)}
					<span
						class={[
							'rounded px-2 py-0.5 text-xs font-medium',
							item.id === selected ? 'bg-primary text-primary-foreground' : 'bg-foreground/10'
						]}
					>
						{getLabel(item.id)}
					</span>
					{#if i < (bond?.state.items.length ?? 0) - 1}
						<span class="text-muted-foreground">›</span>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</Story>
