<script lang="ts">
	import { Stack, type StackBond } from '$lib/components/stack';

	let stackRoot = $state<{ getBond: () => StackBond }>();
	let stackSelected = $state('s-a');
	const stackBond = $derived(stackRoot?.getBond());

	const stackLayers = [
		{ id: 's-a', bg: 'bg-gradient-to-br from-sky-400 to-blue-500', emoji: '🌄' },
		{ id: 's-b', bg: 'bg-gradient-to-br from-pink-400 to-rose-500', emoji: '🔷' },
		{ id: 's-c', bg: 'bg-gradient-to-br from-amber-300 to-orange-500', emoji: '✨' }
	];
</script>

<div class="flex gap-3 items-center">
	<div class="relative w-28 h-20">
		<Stack.Root bind:this={stackRoot} class="relative h-full w-full">
			{#each stackLayers as layer, i (layer.id)}
				<Stack.Item
					value={layer.id}
					class={[
						'absolute rounded-lg shadow-md cursor-pointer transition-all flex items-center justify-center text-lg',
						layer.bg,
						stackSelected === layer.id ? 'ring-2 ring-white/70' : 'opacity-90 hover:opacity-100'
					]}
					style="width: 64px; height: 44px; top: {i * 14}px; left: {i * 16}px;"
					onclick={() => (stackSelected = layer.id)}
				>
					{layer.emoji}
				</Stack.Item>
			{/each}
		</Stack.Root>
	</div>
	<div class="flex flex-col gap-1">
		<button
			class="text-xs text-primary hover:underline text-left"
			onclick={() => stackBond?.bringToFront(stackSelected)}>↑ Front</button
		>
		<button
			class="text-xs text-muted-foreground hover:text-foreground text-left"
			onclick={() => stackBond?.sendToBack(stackSelected)}>↓ Back</button
		>
	</div>
</div>
