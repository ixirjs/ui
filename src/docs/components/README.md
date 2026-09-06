# Documentation Components

Reusable components for creating consistent, rich, and easy-to-maintain component documentation pages.

## Components

### PageHeader

Displays the component title, description, and status badge.

```svelte
<PageHeader
	title="Accordion"
	description="Collapsible content sections for organizing information."
	status="stable"
/>
```

**Props:**

- `title: string` - Component name
- `description: string` - Component description
- `status?: 'stable' | 'beta' | 'experimental' | 'deprecated'` - Status badge (default: 'stable')
- `children?: Snippet` - Optional additional content

---

### Breadcrumb

Navigation breadcrumb trail.

```svelte
<Breadcrumb items={[{ label: 'Components', href: '/components' }, { label: 'Accordion' }]} />
```

**Props:**

- `items: Array<{ label: string; href?: string }>` - Breadcrumb items

---

### Section

Section container with title and optional description.

```svelte
<Section title="Examples" description="Explore different variations">
	<!-- Content -->
</Section>
```

**Props:**

- `title: string` - Section title
- `description?: string` - Optional section description
- `children: Snippet` - Section content
- `class?: string` - Optional CSS classes

---

### Installation

Installation and import instructions with copy functionality.

```svelte
<Installation
	packageName="@svelte-atoms/core"
	importCode="import {Accordion} from '@svelte-atoms/core/accordion';"
/>
```

**Props:**

- `packageName: string` - NPM package name
- `importCode: string` - Import statement code

---

### FeatureGrid

Grid display of component features with icons.

```svelte
<FeatureGrid
	columns={2}
	features={[
		{
			title: 'Fully Accessible',
			description: 'Built with ARIA best practices...',
			color: 'purple',
			iconPath: '<svg>...</svg>'
		}
	]}
/>
```

**Props:**

- `features: Array<Feature>` - Array of features
- `columns?: 1 | 2 | 3 | 4` - Grid columns (default: 2)

**Feature Object:**

- `title: string` - Feature title
- `description: string` - Feature description
- `color: 'purple' | 'blue' | 'green' | 'pink' | 'yellow' | 'red'` - Color theme
- `icon?: Snippet` - Optional icon snippet
- `iconPath?: string` - Optional icon SVG string (easier to use)

---

### AccessibilityInfo

Accessibility features information panel.

```svelte
<AccessibilityInfo
	features={['Proper ARIA attributes', 'Keyboard navigation support', 'Focus management']}
/>
```

**Props:**

- `features: string[]` - List of accessibility features
- `title?: string` - Optional custom title (default: 'Built-in Accessibility Features')

---

### PageNavigation

Previous/next page navigation links.

```svelte
<PageNavigation
	prev={{ label: 'Back to Components', href: '/components' }}
	next={{ label: 'Next: Button', href: '/components/button' }}
/>
```

**Props:**

- `prev?: { label: string; href: string }` - Previous page link
- `next?: { label: string; href: string }` - Next page link

---

### DemoExample

Interactive component example with preview and code display.

```svelte
<DemoExample
	title="Basic Accordion"
	description="Simple accordion with collapsible sections"
	code={accordionCode}
>
	<Accordion>
		<!-- Demo content -->
	</Accordion>
</DemoExample>
```

**Props:**

- `title: string` - Example title
- `description?: string` - Optional example description
- `code: string` - Code to display
- `children: Snippet` - Component preview/demo

---

### Props

API reference table for component props.

```svelte
<Props
	data={[
		{
			name: 'multiple',
			type: 'boolean',
			default: 'false',
			description: 'Allow multiple panels open'
		}
	]}
/>
```

**Props:**

- `data: Array<PropItem>` - Array of prop definitions

**PropItem Object:**

- `name: string` - Prop name
- `type: string` - TypeScript type
- `default: string` - Default value
- `description: string` - Prop description

---

## Usage Example

```svelte
<script lang="ts">
	import { YourComponent } from '$lib/components/your-component';
	import {
		PageHeader,
		Breadcrumb,
		Section,
		Installation,
		FeatureGrid,
		AccessibilityInfo,
		PageNavigation,
		DemoExample,
		Props
	} from '$docs/components';

	const basicCode = `<YourComponent>
  Basic usage
</YourComponent>`;
</script>

<svelte:head>
	<title>YourComponent - Atomic SV</title>
	<meta name="description" content="Component description" />
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
	<Breadcrumb items={[{ label: 'Components', href: '/components' }, { label: 'YourComponent' }]} />

	<PageHeader title="YourComponent" description="What your component does" status="stable" />

	<Section title="Installation">
		<Installation
			packageName="@svelte-atoms/core"
			importCode="import {YourComponent} from '@svelte-atoms/core/your-component';"
		/>
	</Section>

	<Section title="Examples">
		<DemoExample title="Basic Example" code={basicCode}>
			<YourComponent>Demo</YourComponent>
		</DemoExample>
	</Section>

	<Section title="Features">
		<FeatureGrid
			features={[
				/* features */
			]}
		/>
	</Section>

	<Section title="API Reference">
		<Props
			data={[
				/* props */
			]}
		/>
	</Section>

	<Section title="Accessibility">
		<AccessibilityInfo
			features={[
				/* features */
			]}
		/>
	</Section>

	<PageNavigation
		prev={{ label: 'Previous', href: '/prev' }}
		next={{ label: 'Next', href: '/next' }}
	/>
</div>
```

## Benefits

✅ **Consistency** - All component pages follow the same structure  
✅ **Maintainability** - Update one component, all pages benefit  
✅ **Speed** - Create new documentation pages quickly  
✅ **Rich Features** - Copy buttons, syntax highlighting, responsive design  
✅ **Easy Updates** - Simple props interface for customization

## See Also

- [Component Documentation Template](../COMPONENT_DOCUMENTATION_TEMPLATE.md) - Full template and guidelines
- [Accordion Example](../../src/routes/components/accordion/+page.svelte) - Complete working example
- [Button Example](../../src/routes/components/button/+page.svelte) - Another example implementation
