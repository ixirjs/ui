<script lang="ts">
	// The SHIPPED Accordion, imported part by part instead of through the `AccordionItem` namespace.
	// The behavioural counterpart of `ixir-card-direct`: same components, same props, one call-site
	// difference — a member expression is a dynamic component, a direct import is not.
	import AccordionRoot from '$ixirjs/ui/components/accordion/accordion-root.svelte';
	import ItemRoot from '$ixirjs/ui/components/accordion/item/accordion-item-root.svelte';
	import ItemHeader from '$ixirjs/ui/components/accordion/item/accordion-item-header.svelte';
	import ItemBody from '$ixirjs/ui/components/accordion/item/accordion-item-body.svelte';
	import type { FixtureProps } from './props.js';
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();

	setPreset(defaultPreset);

	const values = $derived([...Array.from({ length: n }, (_, i) => String(i)), 'probe']);
</script>

<AccordionRoot multiple {values}>
	{#each { length: n } as _, i (i)}
		<ItemRoot value={String(i)} class={tint}>
			<ItemHeader>Section {i}</ItemHeader>
			<ItemBody>Body {i}</ItemBody>
		</ItemRoot>
	{/each}
	<ItemRoot value="probe" class={bump}>
		<ItemHeader>Probe</ItemHeader>
		<ItemBody>Probe</ItemBody>
	</ItemRoot>
</AccordionRoot>
