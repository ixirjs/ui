<script lang="ts">
	// One representative composition per bonded component family, selected by name.
	//
	// This is the fidelity fixture behind `family-ssr.spec.ts`: it exists so a change to the
	// presentation kernel or the part authoring seam can be shown to leave rendered markup
	// untouched, family by family, rather than only on the four benchmark layers. Compositions
	// deliberately exercise the seams that carry cross-part state — disclosure, relationship ARIA,
	// roles, nested bonds — not just a root with a child.
	import { Accordion, AccordionItem } from '$ixirjs/ui/components/accordion';
	import { Alert } from '$ixirjs/ui/components/alert';
	import { Card } from '$ixirjs/ui/components/card';
	import { Collapsible } from '$ixirjs/ui/components/collapsible';
	import { Tabs, Tab } from '$ixirjs/ui/components/tabs';
	import { Stepper, Step } from '$ixirjs/ui/components/stepper';
	import { Breadcrumb } from '$ixirjs/ui/components/breadcrumb';
	import { List } from '$ixirjs/ui/components/list';
	import { ProgressLinear } from '$ixirjs/ui/components/progress';
	import { Stack } from '$ixirjs/ui/components/stack';
	import { Tree } from '$ixirjs/ui/components/tree';

	export type Family =
		| 'accordion'
		| 'alert'
		| 'card'
		| 'collapsible'
		| 'tabs'
		| 'stepper'
		| 'breadcrumb'
		| 'list'
		| 'progress'
		| 'stack'
		| 'tree';

	let { family }: { family: Family } = $props();
</script>

{#if family === 'accordion'}
	<Accordion value="one">
		<AccordionItem.Root value="one">
			<AccordionItem.Header>First<AccordionItem.Indicator /></AccordionItem.Header>
			<AccordionItem.Body>First body</AccordionItem.Body>
		</AccordionItem.Root>
		<AccordionItem.Root value="two">
			<AccordionItem.Header>Second<AccordionItem.Indicator /></AccordionItem.Header>
			<AccordionItem.Body>Second body</AccordionItem.Body>
		</AccordionItem.Root>
	</Accordion>
{:else if family === 'alert'}
	<Alert.Root>
		<Alert.Icon />
		<Alert.Content>
			<Alert.Title>Heads up</Alert.Title>
			<Alert.Description>Something happened.</Alert.Description>
		</Alert.Content>
		<Alert.Actions><Alert.CloseButton /></Alert.Actions>
	</Alert.Root>
{:else if family === 'card'}
	<Card.Root>
		<Card.Media>media</Card.Media>
		<Card.Header>
			<Card.Title>Title</Card.Title>
			<Card.Subtitle>Subtitle</Card.Subtitle>
			<Card.Description>Description</Card.Description>
		</Card.Header>
		<Card.Body>Body</Card.Body>
		<Card.Footer>Footer</Card.Footer>
	</Card.Root>
{:else if family === 'collapsible'}
	<Collapsible.Root open={true}>
		<Collapsible.Header>Header<Collapsible.Indicator /></Collapsible.Header>
		<Collapsible.Body>Body</Collapsible.Body>
	</Collapsible.Root>
{:else if family === 'tabs'}
	<Tabs.Root value="a">
		<Tabs.Header>
			<Tab.Root value="a">
				<Tab.Header>A</Tab.Header>
				<Tab.Body>A body</Tab.Body>
			</Tab.Root>
			<Tab.Root value="b">
				<Tab.Header>B</Tab.Header>
				<Tab.Body>B body</Tab.Body>
			</Tab.Root>
		</Tabs.Header>
	</Tabs.Root>
{:else if family === 'stepper'}
	<Stepper.Root>
		<Stepper.Header>
			<Step.Root index={0}
				><Step.Indicator>1</Step.Indicator><Step.Title>Step one</Step.Title></Step.Root
			>
		</Stepper.Header>
	</Stepper.Root>
{:else if family === 'breadcrumb'}
	<Breadcrumb.Root>
		<Breadcrumb.Item>Home</Breadcrumb.Item>
		<Breadcrumb.Item>Library</Breadcrumb.Item>
	</Breadcrumb.Root>
{:else if family === 'list'}
	<List.Root>
		<List.Item>One</List.Item>
		<List.Item>Two</List.Item>
	</List.Root>
{:else if family === 'progress'}
	<ProgressLinear value={40} />
{:else if family === 'tree'}
	<Tree.Root open>
		<Tree.Header>
			<Tree.Indicator>indicator</Tree.Indicator>
			Node
		</Tree.Header>
		<Tree.Body>
			<Tree.Root>
				<Tree.Header><Tree.Indicator>indicator</Tree.Indicator>Child</Tree.Header>
				<Tree.Body>Child body</Tree.Body>
			</Tree.Root>
		</Tree.Body>
	</Tree.Root>
{:else}
	<Stack.Root>
		<div>a</div>
		<div>b</div>
	</Stack.Root>
{/if}
