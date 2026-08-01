<script lang="ts">
	import { codeBlock, list, inlineCode } from '$docs/md/template';
	import { FrontMatter } from '$docs/md/components';

	let { data } = $props();
	const { metadata, frontmatter } = $derived(data);
</script>

<FrontMatter {frontmatter} />

# {metadata.pageTitle}

{metadata.pageDescription}

## Overview

{metadata.overview}

The preset system is a powerful theming mechanism that allows you to: - Define component styles once
and apply them everywhere - Override styles at different levels (global, route, component) - Create
dynamic styles based on component state - Maintain consistency across your application - Support
multiple themes or design variations ## Key Features

{list(metadata.keyFeatures)}

## Preset Levels The preset system works hierarchically with three levels:

{#each metadata.presetLevels as level, i (i)}
	### {level.level}

	**Location:** {level.location}
	**Scope:** {level.scope}
	**Use Case:** {level.useCase}
	**Priority:** {level.priority}
{/each}

## Setting Up Presets ### Global Preset (App Root) Define your base theme in the root layout file:

{codeBlock(
	`// src/routes/+layout.svelte
<script>
  import { setPreset } from '@svelte-atoms/core/context';

  const theme = {
    button: () => ({
      class: 'rounded-md px-4 py-2 font-semibold transition-colors'
    }),
    
    card: () => ({
      class: 'rounded-xl border border-border bg-card shadow-sm'
    }),
    
    'card.title': () => ({
      class: 'text-xl font-bold text-card-foreground'
    })
  };

  setPreset(theme);
</script>
`,
	'svelte'
)}

### Route-Level Preset Override presets for specific routes:

{codeBlock(
	`// src/routes/dashboard/+layout.svelte
<script>
  import { setPreset } from '@svelte-atoms/core/context';

  // Extends and overrides the global preset
  setPreset({
    button: () => ({
      class: 'rounded-lg shadow-md hover:shadow-lg'
    }),
    
    card: () => ({
      class: 'bg-slate-50 border-slate-200'
    })
  });
</script>
`,
	'svelte'
)}

### Component-Level Preset Override presets for specific component subtrees:

{codeBlock(
	`// components/Settings.svelte
<script>
  import { setPreset } from '@svelte-atoms/core/context';

  // Component-level preset for this subtree
  setPreset({
    'card.title': () => ({
      class: 'text-purple-600'
    })
  });
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Settings</Card.Title>
  </Card.Header>
</Card.Root>`,
	'svelte'
)}

## Preset Keys

{#each Object.entries(metadata.presetKeys) as [type, info] (type)}
	### {type.charAt(0).toUpperCase() + type.slice(1)} Components

	{info.description}

	**Examples:** `{info.example}`
{/each}

## Compound Component Presets Use dot notation to style sub-components:

{codeBlock(
	`setPreset({
  // Parent component
  alert: () => ({
    class: 'rounded-lg border p-4'
  }),
  
  // Child components
  'alert.icon': () => ({
    class: 'h-4 w-4'
  }),
  
  'alert.title': () => ({
    class: 'mb-1 font-semibold leading-tight'
  }),
  
  'alert.description': () => ({
    class: 'text-sm leading-relaxed opacity-90'
  }),
  
  'alert.actions': () => ({
    class: 'mt-3 flex items-center gap-2'
  })
});`,
	'typescript'
)}

## Reactive Presets (Dynamic Styling) Access component Bond values for dynamic styling:

{codeBlock(
	`import { setPreset } from '@svelte-atoms/core/context';

setPreset({
  'accordion.item.header': (bond) => {
    return () => ({
      class: bond?.isOpen ? 'bg-accent' : 'bg-background'
    });
  },
  
  'collapsible.trigger': (bond) => ({
    class: bond?.isOpen ? 'rotate-180' : 'rotate-0'
  })
});`,
	'typescript'
)}

## The $preset Placeholder Control where preset classes are inserted:

{codeBlock(
	`<script>
  // HtmlAtom component with preset support
</script>

<HtmlAtom
  preset="button"
  class="my-custom-class $preset user-class"
/>

<!-- Result: 'my-custom-class rounded-lg px-4 py-2 font-semibold user-class' -->`,
	'svelte'
)}

## Extended Attributes Presets can set any HTML attributes, not just classes:

{codeBlock(
	`setPreset({
  button: () => ({
    class: 'rounded-lg px-4 py-2',
    'data-component': 'button',
    'data-version': '1.0',
    role: 'button',
    tabindex: 0
  }),
  
  'card.title': () => ({
    class: 'text-xl font-bold',
    role: 'heading',
    'aria-level': 2
  })
});`,
	'typescript'
)}

## Extending Presets Presets at different levels merge together:

{codeBlock(
	`// Base theme (global)
setPreset({
  button: () => ({
    class: 'rounded-md px-4 py-2 font-semibold'
  })
});

// Extended theme (route or component level)
setPreset({
  button: () => ({
    class: 'shadow-lg hover:shadow-xl'
  })
});

// Result: Classes are merged
// 'rounded-md px-4 py-2 font-semibold shadow-lg hover:shadow-xl'`,
	'typescript'
)}

## Advanced Features

{#each metadata.advancedFeatures as feature, i (i)}
	### {feature.feature}

	{feature.description}

	**Example:** {feature.example}
{/each}

## Performance Optimization The preset system is optimized for performance:

{codeBlock(
	`// Preset resolution is memoized
// - Only recomputes when preset key or bond changes
// - Class string interpolation is cached
// - Early exit for components without $preset placeholder

const preset = $derived.by(() => {
  if (!presetKey) return undefined;
  return getPreset(presetKey)?.apply?.(bond, [bond]);
});

const presetClassString = $derived(cn(preset?.class));

const _klass = $derived.by(() => {
  const merged = cn(klass, mergedVariants?.class ?? '');
  // Early exit if no $preset placeholder
  if (!merged.includes('$preset')) return merged;
  return merged.replaceAll('$preset', presetClassString);
});`,
	'typescript'
)}

## Common Patterns ### Theme Switching

{codeBlock(
	`<script>
  import { setPreset } from '@svelte-atoms/core/context';
  
  let theme = $state('light');
  
  $effect(() => {
    const lightTheme = {
      button: () => ({ class: 'bg-white text-black' })
    };
    
    const darkTheme = {
      button: () => ({ class: 'bg-black text-white' })
    };
    
    setPreset(theme === 'light' ? lightTheme : darkTheme);
  });
</script>`,
	'svelte'
)}

### Component Variants via Presets

{codeBlock(
	`setPreset({
  button: () => ({
    class: 'base-button-styles'
  }),
  
  'button.primary': () => ({
    class: 'bg-primary text-primary-foreground'
  }),
  
  'button.secondary': () => ({
    class: 'bg-secondary text-secondary-foreground'
  })
});`,
	'typescript'
)}

### Conditional Presets

{codeBlock(
	`setPreset({
  card: () => {
    const isLarge = window.innerWidth > 1024;
    return {
      class: isLarge ? 'max-w-2xl' : 'max-w-md'
    };
  }
});`,
	'typescript'
)}

## Best Practices ### ✅ DO - Set global presets at app root for base theme - Override at route
level for section-specific theming - Use dot notation for compound component specificity - Access
Bond values for reactive styling - Keep preset logic simple and focused - Use presets for common
patterns ### ❌ DON'T - Override presets for one-off styling (use component props instead) - Create
overly complex preset functions - Rely on presets for critical functionality - Duplicate logic
across preset levels - Use presets for layout (use component composition) ## Examples ###
Multi-Theme Setup

{codeBlock(
	`// themes/light.ts
export const lightTheme = {
  button: () => ({
    class: 'bg-white text-black border-gray-200'
  }),
  card: () => ({
    class: 'bg-white border-gray-200'
  })
};

// themes/dark.ts
export const darkTheme = {
  button: () => ({
    class: 'bg-gray-800 text-white border-gray-700'
  }),
  card: () => ({
    class: 'bg-gray-800 border-gray-700'
  })
};

// +layout.svelte
<script>
  import { setPreset } from '@svelte-atoms/core/context';
  import { lightTheme } from './themes/light';
  
  setPreset(lightTheme);
</script>`,
	'typescript'
)}

### Dashboard-Specific Styling

{codeBlock(
	`// routes/dashboard/+layout.svelte
<script>
  import { setPreset } from '@svelte-atoms/core/context';
  
  setPreset({
    card: () => ({
      class: 'bg-gradient-to-br from-slate-50 to-slate-100'
    }),
    'card.title': () => ({
      class: 'text-lg font-bold text-slate-900'
    })
  });
</script>`,
	'svelte'
)}

### Component Library Presets

{codeBlock(
	`// lib/presets/components.ts
export const componentPresets = {
  button: () => ({
    class: 'rounded-md transition-all duration-200'
  }),
  dialog: () => ({
    class: 'max-w-lg rounded-xl shadow-2xl'
  }),
  'dialog.overlay': () => ({
    class: 'bg-black/50 backdrop-blur-sm'
  })
};`,
	'typescript'
)}

## Debugging Presets

{codeBlock(
	`import { getPreset } from '@svelte-atoms/core/context';

// Check what preset is active
const buttonPreset = getPreset('button');
console.log('Button preset:', buttonPreset);

// Check preset resolution
const Dialog.Root preset="dialog" class="debug">
  <!-- Check DevTools to see resolved classes -->
</Dialog.Root>`,
	'typescript'
)}

## Migration Guide ### From Inline Styles

{codeBlock(
	`<!-- Before -->
<Button class="rounded-lg px-4 py-2 bg-primary">Click</Button>
<Button class="rounded-lg px-4 py-2 bg-primary">Another</Button>

<!-- After -->
<script>
  setPreset({
    button: () => ({
      class: 'rounded-lg px-4 py-2 bg-primary'
    })
  });
</script>

<Button>Click</Button>
<Button>Another</Button>`,
	'svelte'
)}

### From CSS Classes

{codeBlock(
	`<!-- Before -->
<style>
  .my-button {
    @apply rounded-lg px-4 py-2 bg-primary;
  }
</style>

<button class="my-button">Click</button>

<!-- After -->
<script>
  setPreset({
    button: () => ({
      class: 'rounded-lg px-4 py-2 bg-primary'
    })
  });
</script>

<Button>Click</Button>`,
	'svelte'
)}

## TypeScript Support ### Basic Preset Typing

{codeBlock(
	`import type { Preset } from '@svelte-atoms/core/types';

const myPreset: Preset = {
  button: () => ({
    class: 'rounded-md px-4 py-2',
    'data-component': 'button'
  })
};

setPreset(myPreset);`,
	'typescript'
)}

### Extending Component Props for Custom Variants When creating custom variants using presets,
extend the component prop types in your {inlineCode('app.d.ts')} file to get full TypeScript support:

{codeBlock(
	`// app.d.ts

// Extend @svelte-atoms/core types globally
declare module '@svelte-atoms/core' {
  // Add custom variants to Button
  export interface ButtonProps {
    variant?: 'ghost' | 'primary' | 'secondary' | 'destructive' | 'outline';
  }
  
  // Add custom variants to Card
  export interface CardProps {
    variant?: 'elevated' | 'outlined' | 'filled';
  }
  
  // Add custom variants to Alert
  export interface AlertProps {
    variant?: 'info' | 'warning' | 'error' | 'success';
  }
}

export {};`,
	'typescript'
)}

**Important Notes:** - The interface name must match the component name + "Props" (e.g., {inlineCode(
	'ButtonProps'
)}, {inlineCode('CardProps')}) - TypeScript will merge your custom properties with the original
component props - This provides autocomplete and type checking for your custom variants - Place this
in {inlineCode('src/app.d.ts')} or any {inlineCode('.d.ts')} file included in your TypeScript config ###
Usage with Full Type Safety

{codeBlock(
	`<script lang="ts">
  // TypeScript now knows about your custom variants
  // Example of variant type from ButtonProps
</script>

<!-- Autocomplete works for variant prop -->
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>

<!-- TypeScript error: "invalid" is not a valid variant -->
<Button variant="invalid">Error</Button>`,
	'svelte'
)}

### Advanced: Extending Multiple Properties

{codeBlock(
	`// app.d.ts
declare module '@svelte-atoms/core' {
  export interface ButtonProps {
    variant?: 'ghost' | 'primary' | 'secondary' | 'destructive' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  }
  
  export interface CardProps {
    variant?: 'elevated' | 'outlined' | 'filled';
    padding?: 'none' | 'sm' | 'md' | 'lg';
  }
}

export {};`,
	'typescript'
)}

### Type-Safe Reactive Presets

{codeBlock(
	`import type { Preset } from '@svelte-atoms/core/types';
import type { Bond } from '@svelte-atoms/core/types/bond';

const accordionPresets: Preset = {
  'accordion.item.header': (bond?: Bond) => {
    const isOpen = bond?.state?.isOpen ?? false;
    
    return {
      class: isOpen 
        ? 'bg-accent text-accent-foreground' 
        : 'hover:bg-accent/50'
    };
  }
};`,
	'typescript'
)}

### Best Practices **✅ DO:** - Define custom variants in {inlineCode('app.d.ts')} for global type extensions
- Use type inference for preset definitions - Keep variant names descriptive and consistent - Document
your custom variants in code comments - Use union types for variant options **❌ DON'T:** - Override original
component props (extend only) - Use overly generic variant names like "type1", "type2" - Mix different
naming conventions - Forget to export the empty object in {inlineCode('app.d.ts')}

## Next Steps - Learn about [Styling](/docs/styling) patterns and techniques - Explore
[Variants](/docs/styling#variants) for component-level styling - Check out [Atoms](/docs/atoms) to
understand the underlying components - Review [Component Examples](/docs/components) to see presets
in action
