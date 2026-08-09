<script lang="ts">
	import { Accordion, AccordionItem } from '$ixirjs/ui/components/accordion';

	// `three` is disabled: arrow navigation must skip it.
	const items = [
		{ value: 'one', disabled: false },
		{ value: 'two', disabled: false },
		{ value: 'three', disabled: true }
	];
</script>

<Accordion collapsible>
	{#each items as item (item.value)}
		<AccordionItem.Root value={item.value} disabled={item.disabled}>
			<AccordionItem.Header>{item.value}</AccordionItem.Header>
			<AccordionItem.Body>panel {item.value}</AccordionItem.Body>
		</AccordionItem.Root>
	{/each}
</Accordion>
