<script lang="ts" module>
	import type { AccordionItemBond } from '$ixirjs/ui/components/accordion/item/bond.svelte';

	export let capturedBond: AccordionItemBond | undefined;

	export function resetCapturedBond() {
		capturedBond = undefined;
	}
</script>

<script lang="ts">
	import { Accordion, AccordionItem } from '$ixirjs/ui/components/accordion';

	function capture(bond: AccordionItemBond): string {
		capturedBond = bond;
		return '';
	}
</script>

<Accordion value="one">
	<AccordionItem.Root value="one">
		{#snippet children({ accordionItem }: { accordionItem: AccordionItemBond })}
			{capture(accordionItem)}
			<AccordionItem.Header>
				<span>Section one</span>
				<AccordionItem.Indicator />
			</AccordionItem.Header>
			<AccordionItem.Body>
				<span>Panel one</span>
			</AccordionItem.Body>
		{/snippet}
	</AccordionItem.Root>
</Accordion>
