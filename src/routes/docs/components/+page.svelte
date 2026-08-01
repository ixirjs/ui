<script lang="ts">
	import ComponentPreview from './component-preview.svelte';

	const components = [
		// Form
		{
			name: 'Button',
			description: 'Interactive element for triggering actions and navigation',
			category: 'Form',
			status: 'Stable',
			href: '/docs/components/button'
		},
		{
			name: 'Checkbox',
			description: 'Single-checkbox or group selection with indeterminate support',
			category: 'Form',
			status: 'Stable',
			href: '/docs/components/checkbox'
		},
		{
			name: 'Combobox',
			description: 'Searchable input that filters a dropdown list of options',
			category: 'Form',
			status: 'Beta',
			href: '/docs/components/combobox'
		},
		{
			name: 'Form',
			description: 'Form layout with field validation and accessible error display',
			category: 'Form',
			status: 'Beta',
			href: '/docs/components/form'
		},
		{
			name: 'Input',
			description: 'Text input with optional prefix, suffix, and validation states',
			category: 'Form',
			status: 'Stable',
			href: '/docs/components/input'
		},
		{
			name: 'Label',
			description: 'Accessible label that associates with form controls',
			category: 'Form',
			status: 'Stable',
			href: '/docs/components/label'
		},
		{
			name: 'Radio',
			description: 'Radio button group for mutually exclusive selection',
			category: 'Form',
			status: 'Beta',
			href: '/docs/components/radio'
		},
		{
			name: 'Select',
			description: 'Styled select with grouped options and keyboard navigation',
			category: 'Form',
			status: 'Stable',
			href: '/docs/components/select'
		},
		{
			name: 'Slider',
			description: 'Range input for selecting numeric values with thumb and track',
			category: 'Form',
			status: 'Beta',
			href: '/docs/components/slider'
		},
		{
			name: 'Textarea',
			description: 'Multi-line text input with resize support',
			category: 'Form',
			status: 'Beta',
			href: '/docs/components/textarea'
		},
		// Display
		{
			name: 'Avatar',
			description: 'Display user profile pictures or initials as fallback',
			category: 'Display',
			status: 'Stable',
			href: '/docs/components/avatar'
		},
		{
			name: 'Badge',
			description: 'Small status label for metadata, counts, and categories',
			category: 'Display',
			status: 'Stable',
			href: '/docs/components/badge'
		},
		{
			name: 'Card',
			description: 'Structured content container with header, body, and footer',
			category: 'Display',
			status: 'Stable',
			href: '/docs/components/card'
		},
		{
			name: 'DataGrid',
			description: 'Sortable, filterable data table with column configuration',
			category: 'Display',
			status: 'Beta',
			href: '/docs/components/datagrid'
		},
		{
			name: 'Kbd',
			description: 'Keyboard shortcut display styled as key cap badges',
			category: 'Display',
			status: 'Stable',
			href: '/docs/components/kbd'
		},
		{
			name: 'List',
			description: 'Structured list with item grouping, dividers, and icons',
			category: 'Display',
			status: 'Beta',
			href: '/docs/components/list'
		},
		{
			name: 'Swatch',
			description: 'Color swatch tile for palette display and color picker UIs',
			category: 'Display',
			status: 'Stable',
			href: '/docs/components/swatch'
		},
		{
			name: 'Tree',
			description: 'Collapsible hierarchical data display with expand and select',
			category: 'Display',
			status: 'Beta',
			href: '/docs/components/tree'
		},
		// Layout
		{
			name: 'Accordion',
			description: 'Collapsible content sections with single or multi-open support',
			category: 'Layout',
			status: 'Stable',
			href: '/docs/components/accordion'
		},
		{
			name: 'Collapsible',
			description: 'Show and hide a single content region with animated height',
			category: 'Layout',
			status: 'Stable',
			href: '/docs/components/collapsible'
		},
		{
			name: 'Divider',
			description: 'Horizontal or vertical separator for content sections',
			category: 'Layout',
			status: 'Stable',
			href: '/docs/components/divider'
		},
		{
			name: 'Scrollable',
			description: 'Custom scrollbar container with styled track and thumb',
			category: 'Layout',
			status: 'Stable',
			href: '/docs/components/scrollable'
		},
		{
			name: 'Sidebar',
			description: 'Collapsible navigation sidebar with header, body, and footer',
			category: 'Layout',
			status: 'Beta',
			href: '/docs/components/sidebar'
		},
		{
			name: 'Stack',
			description: 'Horizontal or vertical flex layout primitive with gap control',
			category: 'Layout',
			status: 'Stable',
			href: '/docs/components/stack'
		},
		// Navigation
		{
			name: 'Breadcrumb',
			description: 'Hierarchical trail showing the current page path',
			category: 'Navigation',
			status: 'Stable',
			href: '/docs/components/breadcrumb'
		},
		{
			name: 'Link',
			description: 'Styled anchor element with active state and external link support',
			category: 'Navigation',
			status: 'Stable',
			href: '/docs/components/link'
		},
		{
			name: 'Stepper',
			description: 'Multi-step wizard with progress indicator and step navigation',
			category: 'Navigation',
			status: 'Stable',
			href: '/docs/components/stepper'
		},
		{
			name: 'Tabs',
			description: 'Tab panel navigation for organizing grouped content',
			category: 'Navigation',
			status: 'Beta',
			href: '/docs/components/tabs'
		},
		// Overlay
		{
			name: 'Context Menu',
			description: 'Right-click contextual menu for element-level actions',
			category: 'Overlay',
			status: 'Beta',
			href: '/docs/components/context-menu'
		},
		{
			name: 'Dialog',
			description: 'Accessible modal overlay for critical user interactions',
			category: 'Overlay',
			status: 'Stable',
			href: '/docs/components/dialog'
		},
		{
			name: 'Drawer',
			description: 'Side panel that slides in from any screen edge with focus trap',
			category: 'Overlay',
			status: 'Stable',
			href: '/docs/components/drawer'
		},
		{
			name: 'Dropdown Menu',
			description: 'Floating action menu anchored to a trigger element',
			category: 'Overlay',
			status: 'Stable',
			href: '/docs/components/dropdown-menu'
		},
		{
			name: 'Popover',
			description: 'Floating content panel with smart positioning and arrow',
			category: 'Overlay',
			status: 'Beta',
			href: '/docs/components/popover'
		},
		{
			name: 'Tooltip',
			description: 'Contextual help text shown on hover or focus',
			category: 'Overlay',
			status: 'Beta',
			href: '/docs/components/tooltip'
		},
		// Feedback
		{
			name: 'Alert',
			description: 'Contextual status messages with title, description, and dismiss',
			category: 'Feedback',
			status: 'Stable',
			href: '/docs/components/alert'
		},
		{
			name: 'Progress',
			description: 'Linear and circular progress indicators with indeterminate support',
			category: 'Feedback',
			status: 'Stable',
			href: '/docs/components/progress'
		},
		{
			name: 'Toast',
			description: 'Temporary notification messages with position and duration control',
			category: 'Feedback',
			status: 'Stable',
			href: '/docs/components/toast'
		},
		// Utility
		{
			name: 'HtmlAtom',
			description: 'The base primitive every component is built on — preset, variants, bond',
			category: 'Utility',
			status: 'Stable',
			href: '/docs/components/atom'
		}
	];

	const categories = [
		'All',
		'Form',
		'Display',
		'Layout',
		'Navigation',
		'Overlay',
		'Feedback',
		'Utility'
	];

	let selectedCategory = $state('All');
	let searchQuery = $state('');

	const filteredComponents = $derived(
		components.filter((c) => {
			const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
			const matchesSearch =
				searchQuery.trim() === '' ||
				c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.description.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesCategory && matchesSearch;
		})
	);

	const stableCount = $derived(components.filter((c) => c.status === 'Stable').length);
	const betaCount = $derived(components.filter((c) => c.status === 'Beta').length);

	function categoryCount(cat: string) {
		return cat === 'All' ? components.length : components.filter((c) => c.category === cat).length;
	}

	function statusClass(status: string) {
		return status === 'Stable' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground';
	}
</script>

<svelte:head>
	<title>Components - Svelte Atoms</title>
	<meta
		name="description"
		content="Browse all available components in the Svelte Atoms library — accessible, composable, and built for Svelte 5."
	/>
</svelte:head>

<!-- Hero -->
<div class="border-border/60 mb-10 border-b pb-10">
	<p class="text-primary mb-3 text-sm font-medium uppercase tracking-wide">Components</p>
	<h1 class="text-foreground mb-4 text-4xl font-bold tracking-tight">Every UI piece you need.</h1>
	<p class="text-muted-foreground mb-8 max-w-xl text-lg leading-relaxed">
		Accessible, composable components built for Svelte 5. Each one is unstyled by default and fully
		configurable through the preset system.
	</p>
	<div class="flex flex-wrap gap-4">
		<div class="border-border rounded-lg border px-4 py-2 text-center">
			<p class="text-foreground text-2xl font-bold">{components.length}</p>
			<p class="text-muted-foreground text-xs">Components</p>
		</div>
		<div class="border-border rounded-lg border px-4 py-2 text-center">
			<p class="text-primary text-2xl font-bold">{stableCount}</p>
			<p class="text-muted-foreground text-xs">Stable</p>
		</div>
		<div class="border-border rounded-lg border px-4 py-2 text-center">
			<p class="text-muted-foreground text-2xl font-bold">{betaCount}</p>
			<p class="text-muted-foreground text-xs">Beta</p>
		</div>
		<div class="border-border rounded-lg border px-4 py-2 text-center">
			<p class="text-foreground text-2xl font-bold">{categories.length - 1}</p>
			<p class="text-muted-foreground text-xs">Categories</p>
		</div>
	</div>
</div>

<!-- Search + Filter -->
<div class="mb-8 space-y-4">
	<div class="relative max-w-sm">
		<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="text-muted-foreground h-4 w-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
			</svg>
		</div>
		<input
			type="search"
			placeholder="Search components..."
			class="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 block w-full rounded-lg border py-2 pr-3 pl-9 text-sm focus:ring-2 focus:outline-none"
			bind:value={searchQuery}
		/>
	</div>

	<div class="flex flex-wrap gap-2">
		{#each categories as category (category)}
			<button
				class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors {selectedCategory ===
				category
					? 'bg-primary text-primary-foreground'
					: 'bg-muted text-muted-foreground hover:text-foreground'}"
				onclick={() => (selectedCategory = category)}
			>
				{category}
				<span class="ml-1 opacity-60 text-xs">{categoryCount(category)}</span>
			</button>
		{/each}
	</div>
</div>

<!-- Results count -->
{#if searchQuery.trim() || selectedCategory !== 'All'}
	<p class="text-muted-foreground mb-6 text-sm">
		{filteredComponents.length} of {components.length} component{filteredComponents.length !== 1
			? 's'
			: ''}
		{selectedCategory !== 'All' ? `in ${selectedCategory}` : ''}
		{searchQuery.trim() ? `matching "${searchQuery.trim()}"` : ''}
	</p>
{/if}

<!-- Component Grid -->
{#if filteredComponents.length > 0}
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each filteredComponents as component (component.href)}
			<div
				class="group border-border hover:border-primary/40 flex flex-col rounded-xl border overflow-hidden transition-all hover:shadow-sm"
			>
				<!-- Interactive preview -->
				<div
					class="border-border/50 border-b bg-muted/20 flex h-36 items-center justify-center overflow-hidden p-4"
				>
					<ComponentPreview name={component.name} />
				</div>

				<!-- Info + link -->
				<a
					href={component.href}
					class="flex flex-1 flex-col p-4 transition-colors hover:bg-muted/10"
				>
					<div class="mb-2 flex items-start justify-between gap-3">
						<p
							class="text-foreground group-hover:text-primary text-sm font-semibold transition-colors"
						>
							{component.name}
						</p>
						<span
							class="shrink-0 rounded px-1.5 py-0.5 font-mono text-xs {statusClass(
								component.status
							)}"
						>
							{component.status}
						</span>
					</div>

					<p class="text-muted-foreground mb-3 flex-1 text-xs leading-relaxed">
						{component.description}
					</p>

					<div class="flex items-center justify-between">
						<span class="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
							{component.category}
						</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-muted-foreground/50 group-hover:text-primary transition-colors"
							aria-hidden="true"
						>
							<path d="m9 18 6-6-6-6" />
						</svg>
					</div>
				</a>
			</div>
		{/each}
	</div>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{:else}
	<div class="py-16 text-center">
		<div class="bg-muted mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="text-muted-foreground h-6 w-6"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
			</svg>
		</div>
		<p class="text-foreground mb-1 text-sm font-semibold">No components found</p>
		<p class="text-muted-foreground text-sm">Try a different search term or category.</p>
		<button
			class="text-primary mt-4 text-sm hover:underline"
			onclick={() => {
				searchQuery = '';
				selectedCategory = 'All';
			}}
		>
			Clear filters
		</button>
	</div>
{/if}
