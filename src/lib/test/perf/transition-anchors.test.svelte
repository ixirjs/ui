<script lang="ts">
	// Every ordinary fixture behind `anchor-budget.spec.ts` is motionless. This one records the
	// hydration cost of Kernel's transition leaf and the retained public HtmlElement renderer.
	import { HtmlElement } from '$ixirjs/ui/components/element';
	import KernelElement from '$ixirjs/ui/test/components/atom/kernel-element.test.svelte';

	export type TransitionArm = 'kernel' | 'element';

	let { n = 100, arm = 'kernel' }: { n?: number; arm?: TransitionArm } = $props();

	const fade = () => ({ duration: 20, css: (t: number) => `opacity: ${t}` });
	const MOTION = { enter: fade } as never;
</script>

{#each { length: n } as _, i (i)}
	{@render (arm === 'kernel' ? kernelItem : elementItem)(i)}
{/each}

{#snippet kernelItem(i: number)}
	<KernelElement class={['px-4 py-2']} motion={MOTION}>Item {i}</KernelElement>
{/snippet}

{#snippet elementItem(i: number)}
	<HtmlElement class="px-4 py-2" exit={fade}>Item {i}</HtmlElement>
{/snippet}
