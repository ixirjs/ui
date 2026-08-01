<script lang="ts">
	import { Accordion, AccordionItem } from '$lib/components/accordion';
</script>

<div class="flex h-96 w-full items-center justify-center">
	<Accordion class="border-border overflow-hidden rounded-lg border">
		<AccordionItem.Root>
			<AccordionItem.Header>
				<span class="text-foreground font-medium">What is Svelte Atoms?</span>
				<AccordionItem.Indicator class="ml-auto" />
			</AccordionItem.Header>
			<AccordionItem.Body>
				Svelte Atoms is a modular, accessible, and extensible Svelte 5 UI component library built
				with TailwindCSS.
			</AccordionItem.Body>
		</AccordionItem.Root>
		<AccordionItem.Root>
			<AccordionItem.Header>
				<span class="text-foreground font-medium">How do I install it?</span>
				<AccordionItem.Indicator class="ml-auto" />
			</AccordionItem.Header>
			<AccordionItem.Body>
				Simply run npm install @ixirjs/ui to add it to your project.
			</AccordionItem.Body>
		</AccordionItem.Root>
		<AccordionItem.Root>
			<AccordionItem.Header>
				<span class="text-foreground font-medium">Is it accessible?</span>
				<AccordionItem.Indicator class="ml-auto" />
			</AccordionItem.Header>
			<AccordionItem.Body>
				Yes — all components include ARIA attributes, keyboard navigation, and screen reader
				support.
			</AccordionItem.Body>
		</AccordionItem.Root>
	</Accordion>
</div>
