<script lang="ts">
	import { Accordion, AccordionItem } from '$lib/components/accordion';
</script>

<div class="flex h-96 w-full items-center justify-center">
	<Accordion class="border-border overflow-hidden rounded-lg border" collapsible>
		<AccordionItem.Root>
			<AccordionItem.Header>
				<span class="text-foreground font-medium">What is Svelte Atoms?</span>
				<AccordionItem.Indicator class="ml-auto" />
			</AccordionItem.Header>
			<AccordionItem.Body>A modular UI component library for Svelte 5.</AccordionItem.Body>
		</AccordionItem.Root>
		<AccordionItem.Root>
			<AccordionItem.Header>
				<span class="text-foreground font-medium">How do I install it?</span>
				<AccordionItem.Indicator class="ml-auto" />
			</AccordionItem.Header>
			<AccordionItem.Body>Run: npm install @ixirjs/ui</AccordionItem.Body>
		</AccordionItem.Root>
	</Accordion>
</div>
