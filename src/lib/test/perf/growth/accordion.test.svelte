<script lang="ts">
	// One accordion, n items — see README: one owner, n children.
	import { Accordion } from '$ixirjs/ui/components/accordion';
	import { AccordionItem } from '$ixirjs/ui/components/accordion/item';

	let { n = 100 }: { n?: number } = $props();
</script>

<Accordion>
	{#each { length: n } as _, i (i)}
		<AccordionItem.Root value={String(i)}>
			<AccordionItem.Header>Section {i}</AccordionItem.Header>
			<AccordionItem.Body>Body {i}</AccordionItem.Body>
		</AccordionItem.Root>
	{/each}
</Accordion>
