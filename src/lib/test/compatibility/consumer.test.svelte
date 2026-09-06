<script lang="ts">
	import { Accordion, Card, Select, Form, Field, createVirtual } from '@ixirjs/ui';
	import { CardRoot, CardTitle } from '@ixirjs/ui/components/card';
	import { CardBond } from '@ixirjs/ui/experimental';
	import { definePreset, setPreset } from '@ixirjs/ui/preset';
	import type { CardRootProps } from '@ixirjs/ui/components/card';
	import { Kernel, createDisclosure } from '@ixirjs/ui/shared';

	let authoredOpen = $state(false);
	const disclosure = createDisclosure({
		get: () => authoredOpen,
		set: (next) => {
			authoredOpen = next;
		}
	});
	const context = Kernel.context<typeof disclosure>('consumer/disclosure');
	context.share(disclosure);
	const authored = Kernel.element(() => ({ 'data-testid': 'authored' }), {
		class: '',
		state: context,
		attrs: () => ({ 'aria-expanded': disclosure.isOpen, onclick: () => disclosure.toggle() })
	});

	let value = $state('');
	let calls = $state(0);
	let ref = $state<{ getBond(): CardBond }>();
	const factory: NonNullable<CardRootProps['factory']> = (props) => new CardBond(props);
	// These consumer-owned names must not be captured by a future library prop.
	setPreset(definePreset({ card: () => ({ attrs: { 'data-theme': 'consumer' } }) }));
	const rows = ['alpha', 'beta', 'gamma'];
	const virtual = createVirtual({
		count: () => rows.length,
		getKey: (i) => rows[i],
		height: 80,
		estimateSize: 40
	});

	function committed(next: string | undefined) {
		if (value !== next) throw new Error('callback ran before binding committed');
		calls++;
	}
</script>

<button {...authored.attrs}>Authored part</button>
<Card.Root {factory} bind:this={ref} data-testid="card" class="consumer-class">
	{#snippet children({ card })}
		<Card.Title>Stable title</Card.Title>
		<output data-testid="identity">{card === ref?.getBond() || !ref}</output>
	{/snippet}
</Card.Root>
<CardRoot><CardTitle>Direct parts</CardTitle></CardRoot>
<Accordion bind:value onvaluechange={committed} collapsible>
	{#snippet children({ accordion })}
		<button data-testid="choose" onclick={() => accordion.open(['alpha'])}>Choose</button>
		<output data-testid="value">{value || 'none'}:{calls}</output>
	{/snippet}
</Accordion>
<Select.Root value="alpha" options={rows} optionValue={(row) => row}>
	{#snippet children({ select })}
		<output data-testid="selection">{select.selection.values.join(',')}</output>
	{/snippet}
</Select.Root>
<Form onsubmit={(event: SubmitEvent) => event.preventDefault()}>
	<Field.Root name="name"><Field.Control value="Ada" /></Field.Root>
</Form>
<div {...virtual.viewport()}>
	<div {...virtual.content()}>
		{#each virtual.items as item (item.key)}
			<div {...virtual.item(item)}>{rows[item.index]}</div>
		{/each}
	</div>
</div>
