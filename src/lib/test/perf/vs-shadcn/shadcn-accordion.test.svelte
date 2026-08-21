<script lang="ts">
	// bits-ui primitives with shadcn-svelte's own class strings, rather than the vendored wrapper:
	// `shadcn/accordion/accordion-trigger.svelte` hard-imports a lucide chevron, and the icon is not
	// what this pair measures. Everything else — the `cn()` call, the class strings, the
	// `data-slot` attributes, the Header/Trigger split — is shadcn's, copied from that file.
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { cn } from '$shadcn/shadcn/utils';
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();

	const values = $derived([...Array.from({ length: n }, (_, i) => String(i)), 'probe']);

	const TRIGGER =
		'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-start text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180';
</script>

<AccordionPrimitive.Root type="multiple" value={values} data-slot="accordion">
	{#each { length: n } as _, i (i)}
		<AccordionPrimitive.Item
			value={String(i)}
			data-slot="accordion-item"
			class={cn('border-b last:border-b-0', tint)}
		>
			<AccordionPrimitive.Header level={3} class="flex">
				<AccordionPrimitive.Trigger data-slot="accordion-trigger" class={cn(TRIGGER)}>
					Section {i}
				</AccordionPrimitive.Trigger>
			</AccordionPrimitive.Header>
			<AccordionPrimitive.Content
				data-slot="accordion-content"
				class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
			>
				<div class={cn('pt-0 pb-4')}>Body {i}</div>
			</AccordionPrimitive.Content>
		</AccordionPrimitive.Item>
	{/each}
	<AccordionPrimitive.Item
		value="probe"
		data-slot="accordion-item"
		class={cn('border-b last:border-b-0', bump)}
	>
		<AccordionPrimitive.Header level={3} class="flex">
			<AccordionPrimitive.Trigger data-slot="accordion-trigger" class={cn(TRIGGER)}>
				Probe
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
		<AccordionPrimitive.Content
			data-slot="accordion-content"
			class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
		>
			<div class={cn('pt-0 pb-4')}>Probe</div>
		</AccordionPrimitive.Content>
	</AccordionPrimitive.Item>
</AccordionPrimitive.Root>
