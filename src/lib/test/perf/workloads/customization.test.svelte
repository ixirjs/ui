<script lang="ts" module>
	import type { AnimationController } from '$ixirjs/ui/utils/animate';
	const STATIC = Object.freeze({ class: 'benchmark-theme', attrs: { 'data-theme': 'static' } });
	export const SCENARIOS = [
		'default',
		'static',
		'merged',
		'variants',
		'reactive',
		'selection',
		'motion'
	] as const;
	export type Scenario = (typeof SCENARIOS)[number];
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { Button } from '$ixirjs/ui/components/button';
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';
	import { createSelection } from '$ixirjs/ui/capability';
	import { animate } from '$ixirjs/ui/utils/animate';

	let { n = 100, scenario = 'default' }: { n?: number; scenario?: Scenario } = $props();
	const mode = untrack(() => scenario);
	let phase = $state(false);
	let values = $state<number[]>([]);
	let clicks = $state(0);
	const controllers: AnimationController[] = [];
	const selection = createSelection({
		get: () => values,
		set: (next) => {
			values = next;
		},
		mode: () => 'multiple',
		indexed: true
	});
	// Every scenario has a context theme: global/context installation costs are not conflated.
	setPreset(defaultPreset);
	if (mode === 'static' || mode === 'merged') setPreset({ button: () => STATIC });
	if (mode === 'merged') setPreset({ button: () => ({ attrs: { 'data-layer': 'second' } }) });
	if (mode === 'variants')
		setPreset({
			button: () => ({
				variants: { tone: { hot: { class: 'benchmark-theme', 'data-tone': 'hot' } } },
				defaults: { tone: 'hot' }
			})
		});
	if (mode === 'reactive')
		setPreset({ button: () => ({ attrs: { 'data-phase': phase ? 'after' : 'before' } }) });

	function drive(node: HTMLElement) {
		const controller = animate(node, { height: [0, 'auto'] }, { duration: 0.04 });
		controllers.push(controller);
		return controller;
	}
	const motion = mode === 'motion' ? { animate: drive } : undefined;
	export function update() {
		phase = !phase;
		if (mode === 'selection') selection.select(Array.from({ length: n }, (_, i) => i));
	}
	export async function settled() {
		await Promise.all(controllers.map((controller) => controller.finished));
	}
	export function snapshot() {
		return { selected: values.length, clicks, animations: controllers.length };
	}
</script>

<section class="benchmark-workload">
	{#each { length: n } as _, i (i)}
		<Button
			data-index={i}
			class={phase ? 'benchmark-after' : 'benchmark-before'}
			aria-pressed={selection.isSelected(i)}
			{motion}
			onclick={() => clicks++}>Item {i}</Button
		>
	{/each}
</section>
