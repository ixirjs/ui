<script lang="ts">
	import { Section, CodeBlock } from '$docs/components';
	import { metadata } from './shared';

	const {
		keyboard: keyboardExample,
		aria: ariaExample,
		focusTrap: focusTrapExample,
		focusManagement: focusManagementExample,
		semantic: semanticExample,
		screenReader: screenReaderExample,
		customAttributes: customAttributesExample,
		disabledState: disabledStateExample,
		visualIndicators: visualIndicatorsExample,
		reducedMotion: reducedMotionExample,
		colorContrast: colorContrastExample,
		testing: testingExample
	} = metadata.examples;

	const universalKeys = [
		{ key: 'Tab', description: 'Move focus to the next focusable element' },
		{ key: 'Shift+Tab', description: 'Move focus to the previous element' },
		{ key: 'Enter', description: 'Activate buttons and links' },
		{ key: 'Space', description: 'Activate buttons, toggle checkboxes' },
		{ key: 'Escape', description: 'Close dialogs, drawers, and popovers' }
	];

	const listKeys = [
		{ key: '↑ ↓', description: 'Navigate menu and list items' },
		{ key: 'Home', description: 'Jump to first item' },
		{ key: 'End', description: 'Jump to last item' }
	];

	const tabKeys = [
		{ key: '← →', description: 'Navigate between tabs' },
		{ key: 'Home', description: 'Jump to first tab' },
		{ key: 'End', description: 'Jump to last tab' }
	];

	const ariaAttributes = [
		{ attr: 'aria-expanded', description: 'Collapsed / expanded state' },
		{ attr: 'aria-selected', description: 'Selection state (tabs, menu items)' },
		{ attr: 'aria-checked', description: 'Checkbox state, including mixed' },
		{ attr: 'aria-disabled', description: 'Disabled state' },
		{ attr: 'aria-haspopup', description: 'Triggers a popup element' },
		{ attr: 'aria-controls', description: 'Links trigger to controlled element' },
		{ attr: 'aria-labelledby', description: 'Associates a visible label' },
		{ attr: 'aria-describedby', description: 'Associates a description' },
		{ attr: 'aria-hidden', description: 'Hides decorative elements' },
		{ attr: 'aria-live', description: 'Announces live region updates' }
	];

	const focusFeatures = [
		{
			num: '01',
			title: 'Focus Trap',
			description:
				'Modal components (Dialog, Drawer) trap focus within their boundaries. Tab and Shift+Tab cycle through focusable elements without leaving the overlay.'
		},
		{
			num: '02',
			title: 'Focus Restoration',
			description:
				'When a modal closes, focus automatically returns to the trigger element. Users never lose their place in the document.'
		},
		{
			num: '03',
			title: 'Initial Focus',
			description:
				'Overlays focus the first focusable element when opened, or the overlay itself if no focusable children are present.'
		},
		{
			num: '04',
			title: 'Visible Focus Indicators',
			description:
				'All interactive elements use :focus-visible for clear keyboard focus rings that do not appear on mouse click.'
		}
	];

	const bestPractices = [
		{
			num: '01',
			title: 'Use semantic HTML',
			description:
				'Prefer <button>, <nav>, <main> over generic <div> elements with ARIA roles. Native semantics are more reliable.'
		},
		{
			num: '02',
			title: 'Provide accessible labels',
			description:
				'Every interactive element needs an accessible name. Use visible labels, or aria-label for icon-only buttons.'
		},
		{
			num: '03',
			title: "Don't override automatic ARIA",
			description:
				'The Bond system manages ARIA attributes reactively. Only override them when you have a specific, well-understood reason.'
		},
		{
			num: '04',
			title: 'Test with real assistive technology',
			description:
				'Automated tools catch common issues, but real screen reader testing (NVDA, JAWS, VoiceOver) finds usability problems they miss.'
		},
		{
			num: '05',
			title: 'Maintain logical focus order',
			description:
				'Tab order should follow the visual flow. Never use positive tabindex values — they disrupt the natural reading order.'
		},
		{
			num: '06',
			title: 'Ensure sufficient contrast',
			description:
				'Verify all text meets WCAG AA: 4.5:1 for normal text, 3:1 for large text. The default theme passes both.'
		},
		{
			num: '07',
			title: 'Support keyboard for everything',
			description:
				'Every interaction reachable by mouse must be reachable and operable by keyboard alone — no exceptions.'
		},
		{
			num: '08',
			title: 'Respect user preferences',
			description:
				'Honor prefers-reduced-motion, prefers-color-scheme, and prefers-contrast system settings.'
		}
	];

	const testingChecklist = [
		{
			num: '01',
			title: 'Keyboard navigation',
			description:
				'Tab through every interactive element. Verify all are reachable and activatable using Tab, Enter, Space, and Arrow keys.'
		},
		{
			num: '02',
			title: 'Screen reader testing',
			description:
				'Test with NVDA (Windows), JAWS (Windows), or VoiceOver (macOS/iOS) to verify announcements and navigation.'
		},
		{
			num: '03',
			title: 'Automated scanning',
			description:
				'Run axe DevTools, Lighthouse, or WAVE to catch common issues programmatically before manual testing.'
		},
		{
			num: '04',
			title: 'Color contrast',
			description:
				'Verify all text color pairs meet WCAG AA ratios using browser DevTools or a contrast checker extension.'
		},
		{
			num: '05',
			title: 'Focus visibility',
			description:
				'Navigate with only the keyboard and confirm focus indicators are clearly visible on every interactive element.'
		}
	];
</script>

<svelte:head>
	<title>{metadata.title}</title>
	<meta name="description" content={metadata.description} />
</svelte:head>

<!-- Hero -->
<div class="border-border/60 mb-14 border-b pb-12">
	<p class="text-primary mb-3 text-sm font-medium uppercase tracking-wide">Accessibility</p>
	<h1 class="text-foreground mb-4 text-4xl font-bold tracking-tight">Accessible by default.</h1>
	<p class="text-muted-foreground mb-8 max-w-xl text-lg leading-relaxed">
		{metadata.pageDescription}
	</p>
	<div class="flex flex-wrap gap-3">
		<a
			href="https://www.w3.org/WAI/ARIA/apg/"
			target="_blank"
			rel="noopener noreferrer"
			class="border-border bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md border px-5 py-2 text-sm font-medium transition-colors"
		>
			WAI-ARIA Practices
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="12"
				height="12"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M15 3h6v6" /><path d="M10 14 21 3" /><path
					d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
				/>
			</svg>
		</a>
		<a
			href="https://webaim.org/"
			target="_blank"
			rel="noopener noreferrer"
			class="border-border hover:bg-muted/50 inline-flex items-center gap-2 rounded-md border px-5 py-2 text-sm font-medium transition-colors"
		>
			WebAIM
		</a>
	</div>
</div>

<!-- Overview -->
<Section.Root>
	<Section.Header>
		<Section.Title>Overview</Section.Title>
		<Section.Subtitle>
			All components follow the WAI-ARIA Authoring Practices Guide — keyboard, ARIA, and focus
			management built in.
		</Section.Subtitle>
	</Section.Header>

	<div class="space-y-3 mb-8">
		<p class="text-muted-foreground leading-relaxed">
			<strong>@ixirjs/ui</strong> follows the WAI-ARIA Authoring Practices Guide (APG) to ensure components
			are accessible to assistive technology users. Every component includes proper ARIA attributes, keyboard
			navigation, focus management, and semantic HTML by default — you do not need to add these manually.
		</p>
	</div>

	<div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
		{#each metadata.sections as section (section.title)}
			<div class="border-border rounded-lg border p-4">
				<p class="text-foreground mb-1.5 text-sm font-semibold">{section.title}</p>
				<p class="text-muted-foreground text-xs leading-relaxed">{section.description}</p>
			</div>
		{/each}
	</div>
</Section.Root>

<!-- Keyboard Navigation -->
<Section.Root>
	<Section.Header>
		<Section.Title>Keyboard navigation</Section.Title>
		<Section.Subtitle>
			All interactive components support standard keyboard interactions out of the box.
		</Section.Subtitle>
	</Section.Header>

	<div class="grid gap-4 sm:grid-cols-3 mb-8">
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-3 text-xs font-semibold uppercase tracking-wide">Universal</p>
			<div class="space-y-2">
				{#each universalKeys as item (item.key)}
					<div class="flex items-start gap-3">
						<kbd class="bg-muted text-foreground shrink-0 rounded px-1.5 py-0.5 font-mono text-xs"
							>{item.key}</kbd
						>
						<span class="text-muted-foreground text-xs leading-relaxed">{item.description}</span>
					</div>
				{/each}
			</div>
		</div>

		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
				Lists &amp; Menus
			</p>
			<div class="space-y-2">
				{#each listKeys as item (item.key)}
					<div class="flex items-start gap-3">
						<kbd class="bg-muted text-foreground shrink-0 rounded px-1.5 py-0.5 font-mono text-xs"
							>{item.key}</kbd
						>
						<span class="text-muted-foreground text-xs leading-relaxed">{item.description}</span>
					</div>
				{/each}
			</div>
		</div>

		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-3 text-xs font-semibold uppercase tracking-wide">Tabs</p>
			<div class="space-y-2">
				{#each tabKeys as item (item.key)}
					<div class="flex items-start gap-3">
						<kbd class="bg-muted text-foreground shrink-0 rounded px-1.5 py-0.5 font-mono text-xs"
							>{item.key}</kbd
						>
						<span class="text-muted-foreground text-xs leading-relaxed">{item.description}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={keyboardExample} />
	</div>
</Section.Root>

<!-- ARIA Attributes -->
<Section.Root>
	<Section.Header>
		<Section.Title>ARIA attributes</Section.Title>
		<Section.Subtitle>
			Components automatically manage ARIA attributes for roles, states, and element relationships.
		</Section.Subtitle>
	</Section.Header>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		All ARIA state attributes are managed reactively by the Bond system — they update whenever
		component state changes without any manual wiring. You can override them when needed by passing
		the attribute directly as a prop.
	</p>

	<div class="grid gap-2 sm:grid-cols-2 mb-6">
		{#each ariaAttributes as item (item.attr)}
			<div class="border-border flex items-center gap-3 rounded-lg border px-3 py-2">
				<code class="bg-primary/10 text-primary shrink-0 rounded px-1.5 py-0.5 font-mono text-xs"
					>{item.attr}</code
				>
				<span class="text-muted-foreground text-xs">{item.description}</span>
			</div>
		{/each}
	</div>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={ariaExample} />
	</div>
</Section.Root>

<!-- Focus Management -->
<Section.Root>
	<Section.Header>
		<Section.Title>Focus management</Section.Title>
		<Section.Subtitle>
			Automatic focus trapping, restoration, and visible indicators for keyboard navigation.
		</Section.Subtitle>
	</Section.Header>

	<div class="border-border divide-border mb-8 overflow-hidden rounded-lg border divide-y">
		{#each focusFeatures as feature (feature.num)}
			<div class="flex gap-4 p-5">
				<span class="text-primary shrink-0 font-mono text-xs font-semibold pt-0.5"
					>{feature.num}</span
				>
				<div>
					<p class="text-foreground mb-1 text-sm font-semibold">{feature.title}</p>
					<p class="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
				</div>
			</div>
		{/each}
	</div>

	<p class="text-foreground mb-3 text-sm font-semibold">Focus trap example</p>
	<div class="overflow-hidden rounded-lg mb-6">
		<CodeBlock lang="svelte" code={focusTrapExample} />
	</div>

	<p class="text-foreground mb-3 text-sm font-semibold">Focus restoration example</p>
	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={focusManagementExample} />
	</div>
</Section.Root>

<!-- Semantic HTML -->
<Section.Root>
	<Section.Header>
		<Section.Title>Semantic HTML</Section.Title>
		<Section.Subtitle>
			Components use proper semantic elements and can be overridden with the <code
				class="bg-primary/10 text-primary font-mono text-xs">as</code
			> prop.
		</Section.Subtitle>
	</Section.Header>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		Semantic elements convey meaning to screen readers, search engines, and browser accessibility
		APIs. All components default to the semantically correct element. Use the
		<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs">as</code> prop to
		override when needed while preserving all behavior.
	</p>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={semanticExample} />
	</div>
</Section.Root>

<!-- Screen Reader Support -->
<Section.Root>
	<Section.Header>
		<Section.Title>Screen reader support</Section.Title>
		<Section.Subtitle>
			Proper labeling, announcements, and semantic structure for assistive technologies.
		</Section.Subtitle>
	</Section.Header>

	<div class="grid gap-3 sm:grid-cols-2 mb-6">
		{#each [{ label: 'Accessible Names', detail: 'Use aria-label or aria-labelledby for icon-only buttons and controls without visible text.' }, { label: 'Live Regions', detail: 'Use role="alert" or aria-live for dynamic content that should be announced immediately.' }, { label: 'Descriptions', detail: 'Associate help text with inputs via aria-describedby for richer context.' }, { label: 'State Announcements', detail: 'State attributes like aria-expanded update reactively and are announced automatically.' }] as item (item.label)}
			<div class="border-border rounded-lg border p-4">
				<p class="text-foreground mb-1.5 text-sm font-semibold">{item.label}</p>
				<p class="text-muted-foreground text-xs leading-relaxed">{item.detail}</p>
			</div>
		{/each}
	</div>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={screenReaderExample} />
	</div>
</Section.Root>

<!-- Custom Attributes -->
<Section.Root>
	<Section.Header>
		<Section.Title>Custom ARIA attributes</Section.Title>
		<Section.Subtitle>
			Extend components with custom ARIA attributes via variants, presets, or direct props.
		</Section.Subtitle>
	</Section.Header>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		While components provide sensible ARIA defaults, you can add or override them using the variant
		system (for state-dependent attributes), the preset system (for global defaults), or by passing
		them directly as props (for one-off cases).
	</p>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={customAttributesExample} />
	</div>
</Section.Root>

<!-- Disabled States -->
<Section.Root>
	<Section.Header>
		<Section.Title>Disabled states</Section.Title>
		<Section.Subtitle>
			Consistent disabled handling with proper ARIA attributes and visual cues.
		</Section.Subtitle>
	</Section.Header>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		Custom elements use <code
			class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs">aria-disabled</code
		>
		(preserves focus for screen reader announcement) while native form inputs use the HTML
		<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs">disabled</code> attribute
		(excludes from form submission). Visual opacity is applied in both cases.
	</p>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={disabledStateExample} />
	</div>
</Section.Root>

<!-- Focus Indicators -->
<Section.Root>
	<Section.Header>
		<Section.Title>Focus indicators</Section.Title>
		<Section.Subtitle>
			Visible focus rings for all interactive elements using :focus-visible.
		</Section.Subtitle>
	</Section.Header>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		All interactive components use
		<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs"
			>:focus-visible</code
		>
		so focus rings appear for keyboard navigation but not on mouse click. Customize the ring color via
		the
		<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs">--ring</code> CSS
		custom property.
	</p>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={visualIndicatorsExample} />
	</div>
</Section.Root>

<!-- Reduced Motion -->
<Section.Root>
	<Section.Header>
		<Section.Title>Reduced motion</Section.Title>
		<Section.Subtitle>
			Components respect the prefers-reduced-motion user preference automatically.
		</Section.Subtitle>
	</Section.Header>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		When users enable "Reduce motion" in their OS settings, component animations are disabled or
		significantly reduced. Follow the same pattern in any custom animations you write.
	</p>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={reducedMotionExample} />
	</div>
</Section.Root>

<!-- Color Contrast -->
<Section.Root>
	<Section.Header>
		<Section.Title>Color contrast</Section.Title>
		<Section.Subtitle>
			Default theme colors meet WCAG AA standards — 4.5:1 for normal text, 3:1 for large text.
		</Section.Subtitle>
	</Section.Header>

	<div class="grid gap-3 sm:grid-cols-2 mb-6">
		{#each [{ label: 'Normal text', ratio: '4.5:1 minimum', note: 'All foreground/background pairs' }, { label: 'Large text (18px+)', ratio: '3:1 minimum', note: 'Headings and bold text' }, { label: 'Interactive elements', ratio: '3:1 minimum', note: 'Borders and focus rings' }, { label: 'Disabled states', ratio: 'Reduced intentionally', note: 'Still visually distinct' }] as item (item.label)}
			<div class="border-border rounded-lg border p-4">
				<p class="text-foreground mb-1 text-sm font-semibold">{item.label}</p>
				<p class="text-primary font-mono text-xs font-medium">{item.ratio}</p>
				<p class="text-muted-foreground mt-0.5 text-xs">{item.note}</p>
			</div>
		{/each}
	</div>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={colorContrastExample} />
	</div>
</Section.Root>

<!-- Testing -->
<Section.Root>
	<Section.Header>
		<Section.Title>Accessibility testing</Section.Title>
		<Section.Subtitle>
			A five-step checklist for verifying accessibility before shipping.
		</Section.Subtitle>
	</Section.Header>

	<div class="border-border divide-border mb-8 overflow-hidden rounded-lg border divide-y">
		{#each testingChecklist as item (item.num)}
			<div class="flex gap-4 p-5">
				<span class="text-primary shrink-0 font-mono text-xs font-semibold pt-0.5">{item.num}</span>
				<div>
					<p class="text-foreground mb-1 text-sm font-semibold">{item.title}</p>
					<p class="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
				</div>
			</div>
		{/each}
	</div>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={testingExample} />
	</div>
</Section.Root>

<!-- Best Practices -->
<Section.Root class="mb-0">
	<Section.Header>
		<Section.Title>Best practices</Section.Title>
		<Section.Subtitle>
			Guidelines for building accessible applications with @ixirjs/ui.
		</Section.Subtitle>
	</Section.Header>

	<div class="border-border divide-border overflow-hidden rounded-lg border divide-y">
		{#each bestPractices as practice (practice.num)}
			<div class="flex gap-4 p-5">
				<span class="text-primary shrink-0 font-mono text-xs font-semibold pt-0.5"
					>{practice.num}</span
				>
				<div>
					<p class="text-foreground mb-1 text-sm font-semibold">{practice.title}</p>
					<p class="text-muted-foreground text-sm leading-relaxed">{practice.description}</p>
				</div>
			</div>
		{/each}
	</div>
</Section.Root>
