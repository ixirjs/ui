<script lang="ts">
	import { Section, CodeBlock, DocCallout } from '$docs/components';
	import { Button } from '$lib/components/button';
	import { metadata } from './shared';

	const tailwindExample = `<!-- Layout and spacing -->
<Card.Title class="text-lg font-semibold">Title</Card.Title>

<!-- Interactive states -->
<button class="bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 active:bg-primary/100">
  Action
</button>

<!-- Responsive -->
<h2 class="text-2xl md:text-3xl lg:text-4xl">Responsive heading</h2>

<!-- With opacity modifier -->
<div class="bg-foreground/10">Subtle background</div>`;

	const cnExample = `import { cn } from '@ixirjs/ui/utils';

// Resolves Tailwind conflicts — last one wins
cn('px-2 py-1', 'px-4');
// Result: 'py-1 px-4'

// Handles conditionals cleanly
cn('base', isActive && 'active', false && 'ignored');
// Result: 'base active'

// Works with arrays
cn(['text-sm', 'font-medium'], 'text-lg');
// Result: 'font-medium text-lg'`;

	const colorTokensExample = `<!-- Semantic color tokens -->
<div class="bg-background text-foreground">Page background</div>
<Button class="bg-primary text-primary-foreground">Primary button</Button>

<!-- With opacity modifier -->
<div class="bg-foreground/10 text-foreground/50">Subtle styling</div>

<!-- Available token pairs -->
<div class="bg-secondary text-secondary-foreground">Secondary</div>
<div class="bg-muted text-muted-foreground">Muted</div>
<div class="bg-accent text-accent-foreground">Accent</div>
<div class="bg-destructive text-destructive-foreground">Destructive</div>
<Card.Root class="border border-border bg-card text-card-foreground">Card</Card.Root>`;

	const conditionalExample = `${'<'}script>
  let isOpen = $state(false);
  let isActive = $state(true);
${'<'}/script>

${'<'}!-- Array with conditions -->
${'<'}Collapsible.Body
  class={[
    'pointer-events-none h-0 opacity-0',
    isOpen && 'pointer-events-auto h-auto opacity-100'
  ]}
>
  Content
${'<'}/Collapsible.Body>

${'<'}!-- Ternary -->
${'<'}Tab.Root class={isActive ? 'opacity-100' : 'opacity-50'}>
  Tab content
${'<'}/Tab.Root>

${'<'}!-- Multiple conditions -->
${'<'}Button
  class={[
    'base-button',
    isActive && 'bg-primary',
    isDisabled && 'opacity-50 pointer-events-none',
    size === 'large' && 'px-6 py-3'
  ]}
>
  Button
${'<'}/Button>`;

	const variantBasicExample = `${'<'}script lang="ts">
  import { defineVariants } from '@ixirjs/ui/utils';
  import { HtmlAtom } from '@ixirjs/ui';

  const buttonVariants = defineVariants({
    class: 'inline-flex items-center justify-center rounded-md font-medium',
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground'
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg'
      }
    },
    defaults: {
      variant: 'primary',
      size: 'md'
    }
  });

  let { variant, size, ...props } = $props();
${'<'}/script>

${'<'}HtmlAtom variants={buttonVariants} {variant} {size} {...props}>
  {@render children?.()}
${'<'}/HtmlAtom>`;

	const compoundVariantsExample = `const alertVariants = defineVariants({
  class: 'rounded-lg p-4 border',
  variants: {
    variant: {
      error: 'bg-destructive/10 border-destructive/50 text-destructive'
    },
    size: {
      lg: 'text-lg p-6'
    }
  },
  // Applied only when variant=error AND size=lg both match
  compounds: [
    {
      variant: 'error',
      size: 'lg',
      class: 'font-bold',
      role: 'alert',
      'aria-live': 'assertive'
    }
  ]
});`;

	const reactiveVariantsExample = `// Pass a function to access component Bond values
const accordionVariants = defineVariants((bond) => ({
  class: 'border rounded-md transition-all',
  variants: {
    state: {
      open: {
        class: bond?.isOpen ? 'bg-primary/5 border-primary' : 'bg-card',
        'aria-expanded': bond?.isOpen,
        'data-state': bond?.isOpen ? 'open' : 'closed'
      }
    }
  }
}));`;

	const inlineStyleExample = `${'<'}script>
  let width = $state(240);
  let opacity = $state(1);
${'<'}/script>

${'<'}!-- Good: dynamic values that can't be expressed as classes -->
${'<'}div style="width: {width}px; opacity: {opacity}">
  Dynamic sizing
${'<'}/div>

${'<'}!-- Good: transform values for animation -->
${'<'}div style="transform: translateX({offset}px) rotate({angle}deg)">
  Animated element
${'<'}/div>

${'<'}!-- Avoid: static styling — use Tailwind instead -->
${'<'}div style="padding: 16px; background: blue;">
  Use class="p-4 bg-blue-500" instead
${'<'}/div>`;

	const presetPlaceholderExample = `<!-- Preset classes are inserted automatically -->
<HtmlAtom preset="button" class={['component-classes', klass]} />

<!-- Result order: preset-classes component-classes user-classes -->`;

	const classPropFormats = [
		{
			label: 'String',
			code: 'class="bg-primary text-white px-4"',
			description: 'Simple static classes'
		},
		{
			label: 'Array',
			code: "class={['base', isActive && 'active']}",
			description: 'Mix static and conditional'
		},
		{
			label: 'Object',
			code: 'class={{ active: isActive, hidden: !show }}',
			description: 'Boolean-keyed map'
		},
		{
			label: 'Mixed',
			code: "class={['base', condition && 'cls', klass]}",
			description: 'Combine all forms'
		}
	];

	const variantFeatures = [
		{ title: 'Base Classes', description: 'Shared styling that applies to every variant' },
		{ title: 'Multiple Dimensions', description: 'Combine variant, size, state independently' },
		{ title: 'Default Values', description: 'Sensible fallbacks for all variant dimensions' },
		{ title: 'Type Safety', description: 'Automatic TypeScript inference for variant options' },
		{ title: 'Compound Variants', description: 'Extra classes when multiple conditions match' },
		{ title: 'Attribute Support', description: 'Return aria-*, data-*, and any HTML attribute' }
	];

	const bestPractices = [
		{
			num: '01',
			title: 'Prefer Tailwind utilities',
			description:
				'Use Tailwind classes for 90% of styling — optimized, tree-shaken in production, consistent design tokens.'
		},
		{
			num: '02',
			title: 'User classes override last',
			description:
				'Place the user-provided class prop last in your array so it can always override component defaults and preset styles.'
		},
		{
			num: '03',
			title: 'Use presets for repeating patterns',
			description:
				'Define component defaults once in a preset rather than copying classes across the codebase.'
		},
		{
			num: '04',
			title: 'Merge with cn()',
			description:
				'Always use cn() when combining class values. It handles Tailwind conflicts and conditionals in one call.'
		},
		{
			num: '05',
			title: 'Reserve inline styles for dynamic values',
			description:
				'Inline style is for values that change at runtime (widths, transforms, opacity). Static styling belongs in Tailwind classes.'
		},
		{
			num: '06',
			title: 'Keep specificity low',
			description:
				'Avoid !important and overly specific selectors. Let cascade and class order handle overrides naturally.'
		},
		{
			num: '07',
			title: 'Use semantic color tokens',
			description:
				'Prefer bg-primary over bg-blue-500. Semantic tokens adapt to theme changes and dark mode automatically.'
		},
		{
			num: '08',
			title: 'Extract reusable variants',
			description:
				'When the same variant pattern repeats across components, extract it into a defineVariants() definition.'
		}
	];
</script>

<svelte:head>
	<title>{metadata.title}</title>
	<meta name="description" content={metadata.description} />
</svelte:head>

<!-- Hero -->
<div class="border-border/60 mb-14 border-b pb-12">
	<p class="text-primary mb-3 text-sm font-medium uppercase tracking-wide">Styling System</p>
	<h1 class="text-foreground mb-4 text-4xl font-bold tracking-tight">Style with full control.</h1>
	<p class="text-muted-foreground mb-8 max-w-xl text-lg leading-relaxed">
		{metadata.pageDescription}
	</p>
	<div class="flex flex-wrap gap-3">
		<Button href="/docs/preset" as="a" variant="primary" class="gap-2 px-5">
			Preset System
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
				aria-hidden="true"
			>
				<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
			</svg>
		</Button>
		<Button href="/docs/accessibility" as="a" variant="outline" class="px-5"
			>Accessibility Guide</Button
		>
	</div>
</div>

<!-- Overview -->
<Section.Root>
	<Section.Header>
		<Section.Title>Overview</Section.Title>
		<Section.Subtitle>
			Tailwind utilities, a variant system, global presets, and cn() — all composable, all optional.
		</Section.Subtitle>
	</Section.Header>

	<div class="space-y-3 mb-8">
		<p class="text-muted-foreground leading-relaxed">
			Every component accepts a <code
				class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-sm">class</code
			>
			prop that supports strings, arrays, and objects. The styling system builds on Tailwind CSS utilities,
			enhanced by the
			<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-sm">cn()</code> utility
			for intelligent merging, and integrated with the preset system for global theming.
		</p>
	</div>

	<div class="grid gap-3 sm:grid-cols-2 md:grid-cols-4 mb-8">
		{#each classPropFormats as fmt (fmt.label)}
			<div class="border-border rounded-lg border p-4">
				<p class="text-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
					{fmt.label}
				</p>
				<code class="text-primary block font-mono text-xs leading-relaxed break-all"
					>{fmt.code}</code
				>
				<p class="text-muted-foreground mt-2 text-xs">{fmt.description}</p>
			</div>
		{/each}
	</div>

	<div class="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
		{#each metadata.keyFeatures as feature, i (i)}
			<div class="border-border rounded-lg border p-4">
				<div class="flex items-start gap-2">
					<div
						class="bg-primary/10 text-primary mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="9"
							height="9"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M20 6 9 17l-5-5" />
						</svg>
					</div>
					<p class="text-muted-foreground text-xs leading-relaxed">{feature}</p>
				</div>
			</div>
		{/each}
	</div>
</Section.Root>

<!-- TailwindCSS -->
<Section.Root>
	<Section.Header>
		<Section.Title>Tailwind CSS utilities</Section.Title>
		<Section.Subtitle>
			Use Tailwind utility classes for 90% of your styling needs with full responsive support.
		</Section.Subtitle>
	</Section.Header>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		All component props and the class array accept any Tailwind utility. Responsive prefixes, state
		variants, and opacity modifiers work exactly as expected.
	</p>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="html" code={tailwindExample} />
	</div>
</Section.Root>

<!-- cn() Utility -->
<Section.Root>
	<Section.Header>
		<Section.Title>The cn() utility</Section.Title>
		<Section.Subtitle>
			Intelligent class merging — combines clsx for conditionals with tailwind-merge for conflict
			resolution.
		</Section.Subtitle>
	</Section.Header>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		When two conflicting Tailwind utilities are provided, the last one wins.
		<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs">cn()</code> handles
		arrays, strings, objects, and falsy values transparently.
	</p>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={cnExample} />
	</div>
</Section.Root>

<!-- Color Tokens -->
<Section.Root>
	<Section.Header>
		<Section.Title>CSS custom properties</Section.Title>
		<Section.Subtitle>
			Semantic color tokens follow shadcn/ui conventions for maximum compatibility and
			theme-awareness.
		</Section.Subtitle>
	</Section.Header>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		Use token-based utilities like <code
			class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs">bg-primary</code
		> instead of specific colors. Tokens adapt automatically to dark mode and custom themes.
	</p>

	<div class="grid gap-2 sm:grid-cols-2 mb-6">
		{#each metadata.colorTokens as token (token.token)}
			<div class="border-border flex items-center gap-3 rounded-lg border px-3 py-2">
				<code class="bg-primary/10 text-primary shrink-0 rounded px-1.5 py-0.5 font-mono text-xs"
					>{token.token}</code
				>
				<span class="text-muted-foreground text-xs">{token.usage}</span>
			</div>
		{/each}
	</div>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="html" code={colorTokensExample} />
	</div>
</Section.Root>

<!-- Conditional Classes -->
<Section.Root>
	<Section.Header>
		<Section.Title>Conditional styling</Section.Title>
		<Section.Subtitle>
			Apply classes based on component state using arrays, ternaries, and logical expressions.
		</Section.Subtitle>
	</Section.Header>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		Falsy values (<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs"
			>false</code
		>,
		<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs">null</code>,
		<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs">undefined</code
		>) are silently dropped. Arrays can be arbitrarily nested.
	</p>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={conditionalExample} />
	</div>
</Section.Root>

<!-- Variant System -->
<Section.Root>
	<Section.Header>
		<Section.Title>Variant system</Section.Title>
		<Section.Subtitle>
			Define reusable, type-safe component variants with full TypeScript inference and Bond value
			access.
		</Section.Subtitle>
	</Section.Header>

	<DocCallout variant="info" title="Local vs global variants">
		<p class="text-muted-foreground text-sm leading-relaxed">
			<strong>Local variants</strong> — defined with
			<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs"
				>defineVariants()</code
			>
			in the component file. Best for component-specific styling. <strong>Global variants</strong> —
			defined in the
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href="/docs/preset" class="text-primary font-medium hover:underline">Preset System</a>
			via
			<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs"
				>setPreset()</code
			>. Apply consistently across your entire app.
		</p>
	</DocCallout>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs"
			>defineVariants()</code
		> creates a type-safe variant configuration for use at the component level. Variants support multiple
		dimensions (size, variant, state), defaults, compound rules, and any HTML attribute — not just class.
	</p>

	<div class="overflow-hidden rounded-lg mb-8">
		<CodeBlock lang="svelte" code={variantBasicExample} />
	</div>

	<div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
		{#each variantFeatures as feature (feature.title)}
			<div class="border-border rounded-lg border p-4">
				<p class="text-foreground mb-1 text-sm font-semibold">{feature.title}</p>
				<p class="text-muted-foreground text-xs leading-relaxed">{feature.description}</p>
			</div>
		{/each}
	</div>
</Section.Root>

<!-- Compound Variants -->
<Section.Root>
	<Section.Header>
		<Section.Title>Compound variants</Section.Title>
		<Section.Subtitle>
			Apply additional classes and attributes only when a specific combination of variants is
			active.
		</Section.Subtitle>
	</Section.Header>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		Compound variants fire when all listed variant keys match simultaneously. They can set classes,
		ARIA attributes, <code
			class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs">role</code
		>, or any other HTML attribute — useful for accessibility patterns that depend on combined
		state.
	</p>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={compoundVariantsExample} />
	</div>
</Section.Root>

<!-- Reactive Variants -->
<Section.Root>
	<Section.Header>
		<Section.Title>Reactive variants</Section.Title>
		<Section.Subtitle>
			Access component Bond values for variants that update automatically when internal state
			changes.
		</Section.Subtitle>
	</Section.Header>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		Pass a function to <code
			class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs"
			>defineVariants()</code
		>
		to receive the bond. This lets variant classes react to state like
		<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs">isOpen</code>,
		<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs">isActive</code
		>, or
		<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs"
			>isDisabled</code
		> without extra prop wiring.
	</p>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={reactiveVariantsExample} />
	</div>
</Section.Root>

<!-- Preset class order -->
<Section.Root>
	<Section.Header>
		<Section.Title>Preset class order</Section.Title>
		<Section.Subtitle
			>Preset classes are inserted automatically; no sentinel is public.</Section.Subtitle
		>
	</Section.Header>

	<p class="text-muted-foreground mb-6 text-sm leading-relaxed">
		Preset classes form the baseline. Component defaults and consumer classes follow, so local
		customization wins Tailwind conflicts.
	</p>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="html" code={presetPlaceholderExample} />
	</div>
</Section.Root>

<!-- Inline Styles -->
<Section.Root>
	<Section.Header>
		<Section.Title>Inline styles</Section.Title>
		<Section.Subtitle>
			Reserve inline styles for dynamic values that cannot be expressed as Tailwind classes.
		</Section.Subtitle>
	</Section.Header>

	<div class="grid gap-3 sm:grid-cols-2 mb-6">
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-3 text-sm font-semibold">Use for dynamic values</p>
			<ul class="space-y-1.5">
				{#each ['Dynamic dimensions (width, height) driven by state', 'Transform values for animation (translate, rotate, scale)', 'CSS custom property values computed at runtime'] as item, i (i)}
					<li class="flex items-start gap-2 text-sm">
						<span class="text-success mt-0.5 shrink-0 font-mono text-xs leading-5">+</span>
						<span class="text-muted-foreground">{item}</span>
					</li>
				{/each}
			</ul>
		</div>
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-3 text-sm font-semibold">Avoid for static values</p>
			<ul class="space-y-1.5">
				{#each ['Static colors, padding, margins — use Tailwind', 'Fixed dimensions or spacing — use Tailwind', 'State-based classes — use conditional arrays'] as item, i (i)}
					<li class="flex items-start gap-2 text-sm">
						<span class="text-muted-foreground/50 mt-0.5 shrink-0 font-mono text-xs leading-5"
							>−</span
						>
						<span class="text-muted-foreground">{item}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={inlineStyleExample} />
	</div>
</Section.Root>

<!-- Best Practices -->
<Section.Root class="mb-0">
	<Section.Header>
		<Section.Title>Best practices</Section.Title>
		<Section.Subtitle>
			Guidelines for maintainable, consistent styling across your application.
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
