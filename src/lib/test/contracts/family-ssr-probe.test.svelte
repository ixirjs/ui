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
	import { ProgressLinear, ProgressCircular } from '$ixirjs/ui/components/progress';
	import { Stack } from '$ixirjs/ui/components/stack';
	import { Toast } from '$ixirjs/ui/components/toast';
	import { Tree } from '$ixirjs/ui/components/tree';
	import { Button } from '$ixirjs/ui/components/button';
	import { Badge } from '$ixirjs/ui/components/badge';
	import { Divider } from '$ixirjs/ui/components/divider';
	import { Label } from '$ixirjs/ui/components/label';
	import { Link } from '$ixirjs/ui/components/link';
	import { Kbd } from '$ixirjs/ui/components/kbd';
	import { Chip } from '$ixirjs/ui/components/chip';
	import { Swatch } from '$ixirjs/ui/components/swatch';
	import { Image } from '$ixirjs/ui/components/image';
	import { Avatar } from '$ixirjs/ui/components/avatar';
	import { Shortcut } from '$ixirjs/ui/components/kbd';
	import { Popover } from '$ixirjs/ui/components/popover';
	import { Calendar } from '$ixirjs/ui/components/calendar';
	import type { Day } from '$ixirjs/ui/components/calendar/types';
	import { Scrollable } from '$ixirjs/ui/components/scrollable';

	// Calendar defaults `pivote` to `new Date()`; a snapshot off the wall clock would change daily, so
	// pin a date.
	const PIVOT = new Date('2026-03-15T00:00:00.000Z');

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
		| 'toast'
		| 'tree'
		| 'popover'
		| 'calendar'
		| 'scrollable'
		| 'button'
		| 'badge'
		| 'primitives';

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
		<!-- Separator renders its default through the `children ?? fallback` dispatch, the one shape
		     in this family that is not a plain children pass-through. It was outside the probe. -->
		<Breadcrumb.Separator />
		<Breadcrumb.Item>Library</Breadcrumb.Item>
	</Breadcrumb.Root>
{:else if family === 'list'}
	<List.Root>
		<List.Item>One</List.Item>
		<List.Item>Two</List.Item>
	</List.Root>
{:else if family === 'progress'}
	<ProgressLinear value={40} />
	<!-- Circular renders through SvgElement, a different renderer path from linear's. -->
	<ProgressCircular value={40} />
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
{:else if family === 'toast'}
	<!-- Appended after `tree` on purpose: an `{:else if}` inserted mid-chain shifts every later
	     branch index, which moves unrelated snapshots for no real change. -->
	<Toast.Root open>
		<Toast.Title>Saved</Toast.Title>
		<Toast.Description>Your changes are live.</Toast.Description>
		<Toast.Close />
	</Toast.Root>
{:else if family === 'popover'}
	<!-- Appended, like `toast`, so earlier branch indices do not shift. Only the trigger and its
	     indicator render on the server; the content is portalled. -->
	<Popover.Root open>
		<Popover.Trigger>Open<Popover.Indicator /></Popover.Trigger>
		<Popover.Content>Panel<Popover.Tail /></Popover.Content>
	</Popover.Root>
{:else if family === 'calendar'}
	<Calendar.Root pivote={PIVOT} value={PIVOT}>
		<Calendar.Header />
		<Calendar.Body weekday={undefined}>
			{#snippet children({ day }: { day: Day })}
				<Calendar.Day {day} />
			{/snippet}
		</Calendar.Body>
	</Calendar.Root>
{:else if family === 'scrollable'}
	<Scrollable.Root orientation="horizontal">
		<Scrollable.Container>
			<Scrollable.Content>Scrolling content</Scrollable.Content>
		</Scrollable.Container>
		<Scrollable.Track orientation="horizontal">
			<Scrollable.Thumb orientation="horizontal" />
		</Scrollable.Track>
	</Scrollable.Root>
{:else if family === 'button'}
	<!-- Appended at the end for the same reason `toast` was: inserting mid-chain shifts every later
	     family's `$props.id()` seed and rewrites snapshots that did not change.

	     Button and Badge are the static, Bond-less shape: no Atom or registration. -->
	<Button>Click</Button>
{:else if family === 'badge'}
	<Badge>New</Badge>
{:else if family === 'primitives'}
	<!-- The small static leaves. Individually trivial, collectively the most-rendered components in
	     any real page, and none of them had a byte-level check anywhere. Grouped into one entry
	     rather than five so the probe chain — and every later family's `$props.id()` seed — moves
	     once instead of five times. -->
	<Divider />
	<Label>Name</Label>
	<Link href="/docs">Docs</Link>
	<Kbd>⌘K</Kbd>
	<Chip>Tag</Chip>
	<Swatch color="#336699" />
	<Image src="/x.png" alt="x" />
	<Avatar>AB</Avatar>
	<Shortcut keys={['Ctrl', 'K']} />
{:else}
	<Stack.Root>
		<!-- Item, not bare divs: it is the part that carries an Atom and the z-index style, and it
		     was outside the probe entirely. -->
		<Stack.Item value="a">a</Stack.Item>
		<Stack.Item value="b">b</Stack.Item>
	</Stack.Root>
{/if}
