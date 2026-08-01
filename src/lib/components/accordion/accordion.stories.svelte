<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Accordion as AAccordion, AccordionItem } from '.';

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
					<AccordionItem.Indicator class="ml-auto" />
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
					<AccordionItem.Indicator class="ml-auto" />
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
					<AccordionItem.Indicator class="ml-auto" />
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
		<AAccordion class="w-96" multiple collapsible {...args}>
			<AccordionItem.Root>
				<AccordionItem.Header>
					<div>Section One</div>
					<AccordionItem.Indicator class="ml-auto" />
				</AccordionItem.Header>

				<AccordionItem.Body>
					<div class="p-3 text-sm">
						Multiple items can be expanded simultaneously. Toggle any header to expand or collapse.
					</div>
				</AccordionItem.Body>
			</AccordionItem.Root>

			<AccordionItem.Root>
				<AccordionItem.Header>
					<div>Section Two</div>
					<AccordionItem.Indicator class="ml-auto" />
				</AccordionItem.Header>

				<AccordionItem.Body>
					<div class="p-3 text-sm">
						This item can be open alongside Section One. The collapsible flag also allows both to be
						closed.
					</div>
				</AccordionItem.Body>
			</AccordionItem.Root>

			<AccordionItem.Root>
				<AccordionItem.Header>
					<div>Section Three</div>
					<AccordionItem.Indicator class="ml-auto" />
				</AccordionItem.Header>

				<AccordionItem.Body>
					<div class="p-3 text-sm">
						A third independent section. Expand all three at once to verify multi-open behaviour.
					</div>
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
					<AccordionItem.Indicator class="ml-auto" />
				</AccordionItem.Header>

				<AccordionItem.Body>
					<div class="p-3 text-sm">This content is not reachable while the accordion is disabled.</div>
				</AccordionItem.Body>
			</AccordionItem.Root>

			<AccordionItem.Root>
				<AccordionItem.Header>
					<div>Another Locked Section</div>
					<AccordionItem.Indicator class="ml-auto" />
				</AccordionItem.Header>

				<AccordionItem.Body>
					<div class="p-3 text-sm">All items are non-interactive when disabled is set on the root.</div>
				</AccordionItem.Body>
			</AccordionItem.Root>
		</AAccordion>
	{/snippet}
</Story>
