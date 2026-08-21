<script lang="ts">
	// Behavioral family — here the opponent is bits-ui, not "no abstraction". One unit is one
	// accordion ITEM: a Bond, a registered root Atom, disclosure + keyboard capabilities.
	// Indicators are omitted on both sides: shadcn's trigger renders a lucide chevron and ours an
	// `AccordionItem.Indicator`, and an equal-cost `<svg>` on both sides only adds noise to the
	// number this pair exists to produce.
	import { Accordion } from '$ixirjs/ui/components/accordion';
	import { AccordionItem } from '$ixirjs/ui/components/accordion/item';
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();

	// Every item open on BOTH sides. bits-ui renders a closed panel anyway (`hidden` + a style
	// block); we render nothing for one. Leaving them closed would have compared n bodies against
	// zero bodies and called the difference per-item cost.
	const values = $derived([...Array.from({ length: n }, (_, i) => String(i)), 'probe']);
</script>

<Accordion multiple {values}>
	{#each { length: n } as _, i (i)}
		<AccordionItem.Root value={String(i)} class={tint}>
			<AccordionItem.Header>Section {i}</AccordionItem.Header>
			<AccordionItem.Body>Body {i}</AccordionItem.Body>
		</AccordionItem.Root>
	{/each}
	<AccordionItem.Root value="probe" class={bump}>
		<AccordionItem.Header>Probe</AccordionItem.Header>
		<AccordionItem.Body>Probe</AccordionItem.Body>
	</AccordionItem.Root>
</Accordion>
