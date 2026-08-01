<script lang="ts">
	import { Accordion, AccordionItem } from '$lib/components/accordion';
</script>

<div class="w-52">
	<Accordion
		values={['acc-what']}
		class="border-none overflow-hidden rounded-lg border divide-y divide-border p-1"
	>
		<AccordionItem.Root value="acc-what" class="py-1">
			<AccordionItem.Header class="text-xs px-1.5 py-0.5 cursor-pointer">
				<span class="font-medium">What is it?</span>
				<AccordionItem.Indicator class="ml-auto h-3 w-3" />
			</AccordionItem.Header>
			<AccordionItem.Body class="text-xs text-muted-foreground px-2 pb-0.5">
				A composable Svelte 5 UI library.
			</AccordionItem.Body>
		</AccordionItem.Root>
		<AccordionItem.Root value="acc-install" class="py-1">
			<AccordionItem.Header class="text-xs px-1.5 py-0.5 cursor-pointer">
				<span class="font-medium">How do I install?</span>
				<AccordionItem.Indicator class="ml-auto h-3 w-3" />
			</AccordionItem.Header>
			<AccordionItem.Body class="text-xs text-muted-foreground px-2 pb-0.5">
				Run <code class="font-mono">npm i @ixirjs/ui</code>.
			</AccordionItem.Body>
		</AccordionItem.Root>
	</Accordion>
</div>
