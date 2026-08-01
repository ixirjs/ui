<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { codeBlock, inlineCode, list } from '$docs/md/template';
	import { FrontMatter } from '$docs/md/components';
	let { data } = $props();
	const { metadata, frontmatter } = $derived(data);
</script>

// eslint-disable-next-line @typescript-eslint/no-unused-vars

<FrontMatter {frontmatter} />

# Quick Reference Guide > **For LLMs & Developers**: Fast lookup for common patterns and components
## 🎯 Most Common Patterns ### Basic Component Usage

{codeBlock(
	`<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { Component } from '@svelte-atoms/core/components/component';
</script>

<Component.Root>
	<Component.SubComponent />
</Component.Root>`,
	'svelte'
)}

### With State Binding

{codeBlock(
	`<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { Dropdown } from '@svelte-atoms/core/components/dropdown';

	let value = $state<string[]>([]);
</script>

<Dropdown.Root bind:value>
	<!-- children -->
</Dropdown.Root>`,
	'svelte'
)}

### With Custom Styling

{codeBlock(
	`<Button.Root class="rounded bg-blue-500 px-4 py-2 text-white">Click me</Button.Root>`,
	'svelte'
)}

## 📦 Component Quick Lookup ### Form Components | Component | Import | Basic Usage | Props | |
------------ | ------------------------------------------------------------------- |
---------------------------------------------- | ------------------------------ | | **Input** | {inlineCode(
	"import { Input } from '@svelte-atoms/core/components/input'"
)} | {inlineCode('<Input.Root type="text" placeholder="..." />')} | {inlineCode('type')}, {inlineCode(
	'value'
)}, {inlineCode('placeholder')} | | **Textarea** | {inlineCode(
	"import { Textarea } from '@svelte-atoms/core/components/textarea'"
)} | {inlineCode('<Textarea.Root placeholder="..." />')} | {inlineCode('value')}, {inlineCode(
	'placeholder'
)}, {inlineCode('rows')} | | **Checkbox** | {inlineCode(
	"import { Checkbox } from '@svelte-atoms/core/components/checkbox'"
)} | {inlineCode('<Checkbox.Root bind:checked />')} | {inlineCode('checked')}, {inlineCode(
	'disabled'
)} | | **Radio** | {inlineCode("import { Radio } from '@svelte-atoms/core/components/radio'")} | {inlineCode(
	'<Radio.Root value="..." bind:group />'
)} | {inlineCode('value')}, {inlineCode('group')} | | **Form** | {inlineCode(
	"import { Form } from '@svelte-atoms/core/components/form'"
)} | {inlineCode('<Form.Root><Form.Field /></Form.Root>')} | {inlineCode('onsubmit')} | ### Interactive
Components | Component | Import | Basic Usage | State Binding | | ------------- | ---------------------------------------------------------------------
| --------------------------------------------------------------------------------- | --------------------------
| | **Button** | {inlineCode("import { Button } from '@svelte-atoms/core/components/button'")} | {inlineCode(
	'<Button.Root onclick={...}>Text</Button.Root>'
)} | - | | **Dropdown** | {inlineCode(
	"import { Dropdown } from '@svelte-atoms/core/components/dropdown'"
)} | {inlineCode('<Dropdown.Root><Dropdown.List><Dropdown.Item /></Dropdown.List></Dropdown.Root>')} |
{inlineCode('bind:value')} | | **Combobox** | {inlineCode(
	"import { Combobox } from '@svelte-atoms/core/components/combobox'"
)} | {inlineCode('<Combobox.Root><Combobox.Input /><Combobox.List /></Combobox.Root>')} | {inlineCode(
	'bind:value'
)}, {inlineCode('bind:query')} | | **Accordion** | {inlineCode(
	"import { Accordion } from '@svelte-atoms/core/components/accordion'"
)} | {inlineCode('<Accordion.Root><Accordion.Item /></Accordion.Root>')} | {inlineCode(
	'bind:value'
)} | | **Tabs** | {inlineCode("import { Tabs } from '@svelte-atoms/core/components/tabs'")} | {inlineCode(
	'<Tabs.Root><Tabs.Header /><Tabs.Body /></Tabs.Root>'
)} | {inlineCode('bind:value')} | | **Tree** | {inlineCode(
	"import { Tree } from '@svelte-atoms/core/components/tree'"
)} | {inlineCode('<Tree.Root><Tree.Header /><Tree.Body /></Tree.Root>')} | {inlineCode('bind:open')} |
### Overlay Components | Component | Import | Basic Usage | State Binding | | ----------- | -----------------------------------------------------------------
| --------------------------------------------------------------------- | ------------- | | **Dialog**
| {inlineCode("import { Dialog } from '@svelte-atoms/core/components/dialog'")} | {inlineCode(
	'<Dialog.Root><Dialog.Content /></Dialog.Root>'
)} | {inlineCode('bind:open')} | | **Drawer** | {inlineCode(
	"import { Drawer } from '@svelte-atoms/core/components/drawer'"
)} | {inlineCode('<Drawer.Root><Drawer.Content /></Drawer.Root>')} | {inlineCode('bind:open')} | | **Popover**
| {inlineCode("import { Popover } from '@svelte-atoms/core/components/popover'")} | {inlineCode(
	'<Popover.Root><Popover.Trigger /><Popover.Content /></Popover.Root>'
)} | {inlineCode('bind:open')} | | **Tooltip** | {inlineCode(
	"import { Tooltip } from '@svelte-atoms/core/components/tooltip'"
)} | {inlineCode('<Tooltip.Root><Tooltip.Trigger /><Tooltip.Content /></Tooltip.Root>')} | - | | **Toast**
| {inlineCode("import { Toast } from '@svelte-atoms/core/components/toast'")} | {inlineCode(
	'<Toast.Root><Toast.Title /><Toast.Description /></Toast.Root>'
)} | - | ### Layout Components | Component | Import | Basic Usage | Props | | ----------- | -----------------------------------------------------------------
| -------------------------------------------------------------------- | ------------------ | | **Card**
| {inlineCode("import { Card } from '@svelte-atoms/core/components/card'")} | {inlineCode(
	'<Card.Root><Card.Header /><Card.Body /><Card.Footer /></Card.Root>'
)} | - | | **Stack** | {inlineCode("import { Stack } from '@svelte-atoms/core/components/stack'")} | {inlineCode(
	'<Stack.Root direction="vertical" gap={4}>...</Stack.Root>'
)} | {inlineCode('direction')}, {inlineCode('gap')} | | **List** | {inlineCode(
	"import { List } from '@svelte-atoms/core/components/list'"
)} | {inlineCode('<List.Root><List.Item /></List.Root>')} | {inlineCode('type')} | | **Divider** | {inlineCode(
	"import { Divider } from '@svelte-atoms/core/components/divider'"
)} | {inlineCode('<Divider.Root />')} | {inlineCode('orientation')} | ### Display Components | Component
| Import | Basic Usage | Props | | ---------- | ---------------------------------------------------------------
| ------------------------------------- | ------------ | | **Avatar** | {inlineCode(
	"import { Avatar } from '@svelte-atoms/core/components/avatar'"
)} | {inlineCode('<Avatar.Root src="..." alt="..." />')} | {inlineCode('src')}, {inlineCode('alt')} |
| **Badge** | {inlineCode("import { Badge } from '@svelte-atoms/core/components/badge'")} | {inlineCode(
	'<Badge.Root>Text</Badge.Root>'
)} | {inlineCode('variant')} | | **Icon** | {inlineCode(
	"import { Icon } from '@svelte-atoms/core/components/icon'"
)} | {inlineCode('<Icon src={IconComponent} />')} | {inlineCode('src')} | ## 🔧 Common Props ### All Components
Accept - {inlineCode('class')} - CSS classes (string or array) - {inlineCode('style')} - Inline styles
- {inlineCode('id')} - Element ID - {inlineCode('as')} - Change underlying HTML element ### State Management
Props - {inlineCode('bind:value')} - Two-way binding for value - {inlineCode('bind:open')} - Two-way binding
for open/closed state - {inlineCode('bind:checked')} - Two-way binding for checked state - {inlineCode(
	'bind:selected'
)} - Two-way binding for selected items ### Animation Props - {inlineCode('initial')} - Set initial state
before enter - {inlineCode('enter')} - Enter animation - {inlineCode('exit')} - Exit animation - {inlineCode(
	'animate'
)} - Animate on data changes ### Lifecycle Props - {inlineCode('onmount')} - Called when component mounts
- {inlineCode('ondestroy')} - Called when component unmounts ## 🎨 Styling Patterns ### TailwindCSS Classes

{codeBlock(
	`<Button.Root class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600">
	Button
</Button.Root>`,
	'svelte'
)}

### Conditional Classes

{codeBlock(
	`<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	let active = $state(false);
</script>

<Button.Root class={active ? 'bg-blue-500' : 'bg-gray-500'}>Toggle</Button.Root>`,
	'svelte'
)}

### Multiple Classes

{codeBlock(
	`<Card.Root class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">Content</Card.Root>`,
	'svelte'
)}

## 🎭 Animation Examples ### With @svelte-atoms/vibra

{codeBlock(
	`<script>
	import { animate } from '@svelte-atoms/vibra';

	function handleEnter(el) {
		return animate(el, { opacity: [0, 1], y: [-20, 0] }, { duration: 0.3 });
	}
</script>

<Dialog.Root bind:open enter={handleEnter}>
	<Dialog.Content>...</Dialog.Content>
</Dialog.Root>`,
	'svelte'
)}

### With GSAP

{codeBlock(
	`<script>
	import gsap from 'gsap';

	function handleEnter(el) {
		return gsap.fromTo(el, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3 });
	}
</script>

<Popover.Root enter={handleEnter}>
	<Popover.Content>...</Popover.Content>
</Popover.Root>`,
	'svelte'
)}

## 🔍 Common Use Cases ### Building a Form

{codeBlock(
	`<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { Form } from '@svelte-atoms/core/components/form';
	import { Input } from '@svelte-atoms/core/components/input';
	import { Button } from '@svelte-atoms/core/components/button';

	let formData = $state({ email: '', password: '' });
</script>

<Form.Root bind:value={formData}>
	<Form.Field name="email">
		<Form.Field.Label>Email</Form.Field.Label>
		<Form.Field.Control>
			<Input.Root type="email" />
		</Form.Field.Control>
	</Form.Field>

	<Form.Field name="password">
		<Form.Field.Label>Password</Form.Field.Label>
		<Form.Field.Control>
			<Input.Root type="password" />
		</Form.Field.Control>
	</Form.Field>

	<Button.Root type="submit">Submit</Button.Root>
</Form.Root>`,
	'svelte'
)}

### Creating a Modal Dialog

{codeBlock(
	`<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { Dialog } from '@svelte-atoms/core/components/dialog';
	import { Button } from '@svelte-atoms/core/components/button';

	let open = $state(false);
</script>

<Button.Root onclick={() => (open = true)}>Open Dialog</Button.Root>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<h2>Dialog Title</h2>
			<Dialog.CloseButton />
		</Dialog.Header>
		<Dialog.Body>
			<p>Dialog content goes here</p>
		</Dialog.Body>
		<Dialog.Footer>
			<Button.Root onclick={() => (open = false)}>Close</Button.Root>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>`,
	'svelte'
)}

### Building a Dropdown Menu

{codeBlock(
	`<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { Dropdown } from '@svelte-atoms/core/components/dropdown';

	let selected = $state<string[]>([]);
</script>

<Dropdown.Root bind:value={selected}>
	<Dropdown.Trigger>
		<Dropdown.Value placeholder="Select an option" />
	</Dropdown.Trigger>

	<Dropdown.List>
		<Dropdown.Item value="option1">Option 1</Dropdown.Item>
		<Dropdown.Item value="option2">Option 2</Dropdown.Item>
		<Dropdown.Item value="option3">Option 3</Dropdown.Item>
	</Dropdown.List>
</Dropdown.Root>`,
	'svelte'
)}

### Creating Tabs

{codeBlock(
	`<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { Tabs } from '@svelte-atoms/core/components/tabs';

	let activeTab = $state('tab1');
</script>

<Tabs.Root bind:value={activeTab}>
	<Tabs.Header>
		<Tabs.Tab value="tab1">
			<Tabs.Tab.Header>Tab 1</Tabs.Tab.Header>
		</Tabs.Tab>
		<Tabs.Tab value="tab2">
			<Tabs.Tab.Header>Tab 2</Tabs.Tab.Header>
		</Tabs.Tab>
	</Tabs.Header>

	<Tabs.Body>
		<Tabs.Tab value="tab1">
			<Tabs.Tab.Body>Content 1</Tabs.Tab.Body>
		</Tabs.Tab>
		<Tabs.Tab value="tab2">
			<Tabs.Tab.Body>Content 2</Tabs.Tab.Body>
		</Tabs.Tab>
	</Tabs.Body>
</Tabs.Root>`,
	'svelte'
)}

## 🚫 Common Mistakes to Avoid ### ❌ Don't Use Low-Level API

{codeBlock(
	`<!-- WRONG -->
<script>
  const state = new DropdownState({ ... });
  const dropdown = new DropdownBond(state);
</script>`,
	'svelte'
)}

### ✅ Use High-Level Components

{codeBlock(
	`<!-- CORRECT -->
<script>
	import { Dropdown } from '@svelte-atoms/core/components/dropdown';
	let selected = $state([]);
</script>

<Dropdown.Root bind:value={selected}>
	<!-- ... -->
</Dropdown.Root>`,
	'svelte'
)}

### ❌ Don't Use Legacy Stores

{codeBlock(
	`<!-- WRONG -->
<script>
	import { writable } from 'svelte/store';
	const value = writable('');
</script>`,
	'svelte'
)}

### ✅ Use Svelte 5 Runes

{codeBlock(
	`<!-- CORRECT -->
<script>
	let value = $state('');
</script>`,
	'svelte'
)}

## 📚 Documentation Links - **Full Overview**: [overview.md](./overview.md) - **Philosophy**:
[philosophy.md](./philosophy.md) - **Naming Conventions**:
[naming-convention.md](./naming-convention.md) - **Component Index**:
[components/README.MD](./components/README.MD) - **Individual Components**:
[components/\\*.md](./components/) ## 🔗 External Resources - [Svelte 5 Runes
Documentation](https://svelte.dev/docs/runes) - [TailwindCSS
Documentation](https://tailwindcss.com/docs) - [ARIA Authoring
Practices](https://www.w3.org/WAI/ARIA/apg/)
