const compositionCode = `
<script lang="ts">
  import { HtmlAtom } from '@ixirjs/ui';
  import { Button } from '@ixirjs/ui/components/button';
</script>

<!-- Use Button as base, add custom styles -->
<HtmlAtom base={Button} class="custom-additional-styles">
  Composed Button
</HtmlAtom>`.trim();

const animationCode = `
<script lang="ts">
  import { HtmlAtom } from '@ixirjs/ui';
  import { fade, slide } from 'svelte/transition';
  
  let show = $state(true);
</script>

{#if show}
  <HtmlAtom 
    enter={(node) => fade(node, { duration: 200 })}
    exit={(node) => slide(node, { duration: 200 })}
  >
    Animated content
  </HtmlAtom>
{/if}`.trim();

const customComponentCode = `
<script lang="ts">
  import { HtmlAtom, type HtmlAtomProps } from '@ixirjs/ui/components/atom';
  
  type Props = HtmlAtomProps<'button'> & {
    variant?: 'primary' | 'secondary' | 'danger';
  };
  
  let { 
    variant = 'primary', 
    class: klass = '', 
    children, 
    ...restProps 
  }: Props = $props();
  
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };
</script>

<HtmlAtom 
  as="button" 
  class="{variantClasses[variant]} rounded px-4 py-2 {klass}" 
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</HtmlAtom>`.trim();

const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  atom: () => ({
    class: 'REPLACE_WITH_PRESET_CLASSES'
  })
});
`.trim();

const accessibilityFeatures = [
	'ARIA attributes',
	'Keyboard navigation',
	'Focus management',
	'Screen reader support'
];

const useCases = [
	{
		title: 'Custom Elements',
		description:
			'Render any HTML element type via the `as` prop while retaining all atom capabilities.'
	},
	{
		title: 'Animation Hooks',
		description:
			'Attach enter/exit/animate functions directly to elements without wrapper components.'
	},
	{
		title: 'Preset Styling',
		description: 'Apply named preset styles that are overridable at the theme level.'
	},
	{
		title: 'Bond Integration',
		description: 'Connect elements to Bond state machines for reactive ARIA attribute management.'
	},
	{
		title: 'Polymorphic Components',
		description:
			'Build higher-level components that delegate the underlying element type to consumers.'
	}
];

export const metadata = {
	title: 'Atom - Svelte Atoms',
	description: 'The HtmlAtom UI primitive and its relationship to runtime Atom classes.',
	componentTitle: 'Atom',
	componentDescription:
		'HtmlAtom is the renderable UI primitive. Runtime Atom classes are separate objects used for node ownership, capabilities, and Bond integration.',
	componentType: 'simple' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { HtmlAtom } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Atom' }],
	useCases,
	examples: {
		composition: compositionCode,
		animation: animationCode,
		customComponent: customComponentCode,
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
