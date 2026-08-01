<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Accordion as AAccordion, AccordionItem } from '..';

	const { Story } = defineMeta({
		title: 'Atoms/Accordion',

		parameters: {
			layout: 'centered'
		},
		args: {
			collapsible: false,
			multiple: false,
			disabled: false
		},
		argTypes: {
			collapsible: {
				control: 'boolean',
				description: 'Allow all items to be collapsed (no forced-open item)'
			},
			multiple: {
				control: 'boolean',
				description: 'Allow more than one item to be open at the same time'
			},
			disabled: {
				control: 'boolean',
				description: 'Disable interaction for all accordion items'
			}
		}
	});
</script>

<Story name="Basic">
	{#snippet template(args)}
		<AAccordion class="w-96 backdrop-blur-sm" {...args}>
			<AccordionItem.Root>
				<AccordionItem.Header>
					<div>Getting Started</div>
					<AccordionItem.Indicator />
				</AccordionItem.Header>

				<AccordionItem.Body>
					<div class="p-3 text-sm">
						Learn the basics and get up to speed quickly. This section covers installation,
						configuration, and your first component.
					</div>
				</AccordionItem.Body>
			</AccordionItem.Root>

			<AccordionItem.Root>
				<AccordionItem.Header>
					<div>Configuration</div>
					<AccordionItem.Indicator />
				</AccordionItem.Header>

				<AccordionItem.Body>
					<div class="p-3 text-sm">
						Customize the component to fit your needs. Adjust presets, variants, and layout options
						through the atom configuration system.
					</div>
				</AccordionItem.Body>
			</AccordionItem.Root>

			<AccordionItem.Root>
				<AccordionItem.Header>
					<div>Advanced Usage</div>
					<AccordionItem.Indicator />
				</AccordionItem.Header>

				<AccordionItem.Body>
					<div class="p-3 text-sm">
						Explore advanced patterns such as controlled state, custom factories, and nested
						accordions for complex UI requirements.
					</div>
				</AccordionItem.Body>
			</AccordionItem.Root>
		</AAccordion>
	{/snippet}
</Story>

<Story name="Multiple">
	{#snippet template(args)}
		<!-- multiple + collapsible: any number of items (including none) can be open at once -->
		<AAccordion class="w-96" multiple collapsible {...args}>
			<AccordionItem.Root>
				<AccordionItem.Header>
					<div>Section One</div>
					<AccordionItem.Indicator />
				</AccordionItem.Header>

				<AccordionItem.Body>
					<div class="p-3 text-sm">Toggle any header to expand or collapse this section.</div>
				</AccordionItem.Body>
			</AccordionItem.Root>

			<AccordionItem.Root>
				<AccordionItem.Header>
					<div>Section Two</div>
					<AccordionItem.Indicator />
				</AccordionItem.Header>

				<AccordionItem.Body>
					<div class="p-3 text-sm">This item can stay open alongside Section One.</div>
				</AccordionItem.Body>
			</AccordionItem.Root>
		</AAccordion>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet template(args)}
		<AAccordion class="w-96" disabled {...args}>
			<AccordionItem.Root>
				<AccordionItem.Header>
					<div>Unavailable Section</div>
					<AccordionItem.Indicator />
				</AccordionItem.Header>

				<AccordionItem.Body>
					<div class="p-3 text-sm">
						All items are non-interactive when disabled is set on the root.
					</div>
				</AccordionItem.Body>
			</AccordionItem.Root>
		</AAccordion>
	{/snippet}
</Story>

<Story name="FAQ">
	<!-- Real-world use case: a product help / FAQ panel -->
	<div class="w-md">
		<h2 class="mb-3 text-lg font-semibold">Frequently asked questions</h2>
		<AAccordion class="w-full" collapsible>
			<AccordionItem.Root>
				<AccordionItem.Header>
					<div>How do I upgrade my plan?</div>
					<AccordionItem.Indicator />
				</AccordionItem.Header>
				<AccordionItem.Body>
					<div class="text-muted-foreground p-3 text-sm">
						Open Settings, select Billing, then choose the plan that fits your team. Changes take
						effect immediately and are prorated for the current cycle.
					</div>
				</AccordionItem.Body>
			</AccordionItem.Root>

			<AccordionItem.Root>
				<AccordionItem.Header>
					<div>Can I invite teammates?</div>
					<AccordionItem.Indicator />
				</AccordionItem.Header>
				<AccordionItem.Body>
					<div class="text-muted-foreground p-3 text-sm">
						Yes. Go to Members and send an invite by email. Seats are billed only when an invite is
						accepted.
					</div>
				</AccordionItem.Body>
			</AccordionItem.Root>

			<AccordionItem.Root>
				<AccordionItem.Header>
					<div>How do I cancel?</div>
					<AccordionItem.Indicator />
				</AccordionItem.Header>
				<AccordionItem.Body>
					<div class="text-muted-foreground p-3 text-sm">
						You can cancel anytime from Billing. Your workspace stays active until the end of the
						paid period.
					</div>
				</AccordionItem.Body>
			</AccordionItem.Root>
		</AAccordion>
	</div>
</Story>
