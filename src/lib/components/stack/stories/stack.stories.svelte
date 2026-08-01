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
	import type { StackBond } from '$ixirjs/ui/components/stack/bond.svelte';
	import { Button } from '$lib/components/button';

	// Photo editing layers scenario
	const layers = [
		{ id: 'background', label: 'Background', bg: 'bg-gradient-to-br from-sky-300 to-blue-500' },
		{ id: 'shapes', label: 'Shapes', bg: 'bg-gradient-to-br from-pink-400 to-rose-500' },
		{ id: 'text', label: 'Text Layer', bg: 'bg-gradient-to-br from-amber-300 to-orange-500' },
		{ id: 'overlay', label: 'Overlay', bg: 'bg-gradient-to-br from-emerald-400 to-green-600' },
		{ id: 'effects', label: 'Effects', bg: 'bg-gradient-to-br from-violet-400 to-purple-600' }
	];

	let selected = $state('background');
	let root: { getBond: () => StackBond } | undefined = $state();
	const bond = $derived(root?.getBond());

	function getLabel(id: string) {
		return layers.find((l) => l.id === id)?.label ?? id;
	}

	function getBg(id: string) {
		return layers.find((l) => l.id === id)?.bg ?? '';
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
				{#each [...(bond?.items ?? [])].reverse() as item (item.id)}
					<button
						class={[
							'flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-all',
							selected === item.id
								? 'bg-primary/10 text-primary ring-primary/30 ring-1'
								: 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
						]}
						onclick={() => (selected = item.id)}
					>
						<!-- Swatch ties the row to its coloured layer on the canvas. -->
						<span class={['h-4 w-4 shrink-0 rounded', getBg(item.id)]}></span>
						<span class="flex-1 font-medium">{getLabel(item.id)}</span>
						<span class="text-muted-foreground text-xs tabular-nums"
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
					class="flex-1 gap-1 text-xs"
					onclick={() => bond?.bringToFront(selected)}
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-3.5 w-3.5"
					>
						<path d="m17 11-5-5-5 5" />
						<path d="m17 18-5-5-5 5" />
					</svg>
					Front
				</Button>
				<Button
					variant="outline"
					size="sm"
					class="flex-1 gap-1 text-xs"
					onclick={() => bond?.bringForward(selected)}
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-3.5 w-3.5"
					>
						<path d="m18 15-6-6-6 6" />
					</svg>
					Up
				</Button>
				<Button
					variant="outline"
					size="sm"
					class="flex-1 gap-1 text-xs"
					onclick={() => bond?.sendBackward(selected)}
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-3.5 w-3.5"
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
					Down
				</Button>
				<Button
					variant="outline"
					size="sm"
					class="flex-1 gap-1 text-xs"
					onclick={() => bond?.sendToBack(selected)}
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-3.5 w-3.5"
					>
						<path d="m7 6 5 5 5-5" />
						<path d="m7 13 5 5 5-5" />
					</svg>
					Back
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
							<span class="text-sm font-semibold drop-shadow">{layer.label}</span>
						</Stack.Item>
					{/each}
				</Stack.Root>
			</div>

			<!-- Breadcrumb order -->
			<div class="text-muted-foreground flex items-center gap-1.5 text-xs">
				<span class="text-foreground font-medium">Back to front:</span>
				{#each bond?.items ?? [] as item, i (item.id)}
					<span
						class={[
							'rounded px-2 py-0.5 text-xs font-medium',
							item.id === selected ? 'bg-primary text-primary-foreground' : 'bg-foreground/10'
						]}
					>
						{getLabel(item.id)}
					</span>
					{#if i < (bond?.items.length ?? 0) - 1}
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-muted-foreground h-3 w-3 shrink-0"
						>
							<path d="m9 18 6-6-6-6" />
						</svg>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</Story>
