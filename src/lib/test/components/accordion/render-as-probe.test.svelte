<script lang="ts">
	import { Accordion, AccordionItem } from '$ixirjs/ui/components/accordion';
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';
	// A theme retags every accordion item: the docs preset does exactly this.
	setPreset({ ...defaultPreset, 'accordion.item': () => ({ render: { as: 'li' } }) });
</script>

<Accordion>
	<AccordionItem.Root value="a">
		<AccordionItem.Header>A</AccordionItem.Header>
		<AccordionItem.Body>Body</AccordionItem.Body>
	</AccordionItem.Root>
</Accordion>
