<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { DisclosureContext } from './bond';
	import { disclosureRegion, disclosureTrigger } from './parts';

	let {
		native = false,
		onclick = undefined
	}: { native?: boolean; onclick?: ((event: MouseEvent) => void) | undefined } = $props();
	const bond = DisclosureContext.getOrThrow();
	const trigger = disclosureTrigger(bond, {
		id: bond.partId('header'),
		controls: () => bond.partId('body'),
		activation: () => (native ? 'native-button' : 'non-native')
	});
	const region = disclosureRegion(bond, {
		id: bond.partId('body'),
		labelledBy: () => bond.partId('header')
	});
	// An absent consumer handler must be omitted, not forwarded as an explicit override.
	const header = Kernel.element(() => (onclick ? { onclick } : {}), {
		preset: 'collapsible.header',
		class: 'border-border flex cursor-pointer items-center gap-2',
		state: bond,
		attrs: trigger.attrs
	});
	const body = Kernel.element(() => ({}), {
		preset: 'collapsible.body',
		class: 'border-border',
		state: bond,
		attrs: region.attrs
	});
</script>

{@render (native ? nativeTrigger : nonNativeTrigger)()}
<div {...body.attrs}>Body</div>

{#snippet nativeTrigger()}
	<button {...header.attrs}>Toggle</button>
{/snippet}

{#snippet nonNativeTrigger()}
	<div {...header.attrs}>Toggle</div>
{/snippet}
