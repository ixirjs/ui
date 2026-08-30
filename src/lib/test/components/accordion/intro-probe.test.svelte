<script lang="ts">
	// Two items, the first open at mount. `Bond.isSettled` decides whether the first body's enter
	// animates (it must not — it was open all along) while the second, opened later, still does.
	import { Accordion } from '$ixirjs/ui/components/accordion';
	import { AccordionItem } from '$ixirjs/ui/components/accordion/item';
</script>

<Accordion multiple values={['a']}>
	<AccordionItem.Root value="a">
		<AccordionItem.Header data-testid="header-a">A</AccordionItem.Header>
		<AccordionItem.Body data-testid="body-a">Body A</AccordionItem.Body>
	</AccordionItem.Root>
	<AccordionItem.Root value="b">
		<AccordionItem.Header data-testid="header-b">B</AccordionItem.Header>
		<AccordionItem.Body data-testid="body-b">Body B</AccordionItem.Body>
	</AccordionItem.Root>
</Accordion>
