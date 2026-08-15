<script lang="ts">
	import { Card } from '$ixirjs/ui/components/card';
	import KernelElement from '$ixirjs/ui/test/components/atom/kernel-element.test.svelte';

	export type LeafHost = 'bonded' | 'static';

	let {
		host = 'bonded' as LeafHost,
		open = true,
		withMotion = true,
		ondestroy = undefined,
		global: isGlobal = undefined,
		onexitend = undefined,
		onintroend = undefined,
		animate = undefined
	}: {
		host?: LeafHost;
		open?: boolean;
		withMotion?: boolean;
		ondestroy?: ((node: Element) => void) | undefined;
		global?: boolean | undefined;
		onexitend?: ((event: TransitionEvent) => void) | undefined;
		onintroend?: ((event: TransitionEvent) => void) | undefined;
		animate?: ((node: Element) => void | (() => void)) | undefined;
	} = $props();

	const fade = () => ({ duration: 20, css: (t: number) => `opacity: ${t}` });
	const handlers = $derived({
		...(isGlobal === undefined ? {} : { global: isGlobal }),
		...(onintroend ? { onintroend } : {}),
		...(onexitend ? { onexitend } : {}),
		...(ondestroy ? { ondestroy } : {})
	});
</script>

{@render (open ? leaf : undefined)?.()}

{#snippet leaf()}
	{@render (host === 'static' ? staticLeaf : bondedLeaf)()}
{/snippet}

{#snippet staticLeaf()}
	<KernelElement
		data-testid="leaf"
		motion={withMotion ? { enter: fade, exit: fade, animate } : {}}
		{...handlers}
	>
		Body
	</KernelElement>
{/snippet}

{#snippet bondedLeaf()}
	<Card.Root
		data-testid="leaf"
		motion={withMotion ? { enter: fade, exit: fade, animate } : {}}
		{...handlers}
	>
		Body
	</Card.Root>
{/snippet}
