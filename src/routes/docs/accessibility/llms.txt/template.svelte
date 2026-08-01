<script lang="ts">
	import { FrontMatter } from '$docs/md/components';
	import { list } from '$docs/md/template';

	let { data } = $props();
	const { metadata, frontmatter } = $derived(data);
</script>

<FrontMatter {frontmatter} />

# {metadata.pageTitle}

{metadata.pageDescription}

## Overview

{metadata.overview}

## Key Features

{list(metadata.keyFeatures)}

## Accessibility Features

{#each metadata.sections as section, i (i)}
	### {section.title}

	{section.description}
{/each}

## Keyboard Navigation All interactive components in Svelte Atoms support comprehensive keyboard
navigation:

{list(metadata.keyboardNavigation)}

## ARIA Attributes Components automatically apply appropriate ARIA attributes based on their state:

{list(metadata.ariaAttributes)}

## Focus Management Focus is carefully managed to ensure a logical and predictable user experience:

{list(metadata.focusManagement)}

## Semantic HTML Components use semantic HTML elements by default and support customization:

{list(metadata.semanticHTML)}

## Screen Reader Support All components are optimized for screen readers:

{list(metadata.screenReaderSupport)}

## Color Contrast The default theme meets WCAG AA requirements:

{ist(metadata.colorContrast)}

## Reduced Motion Components respect the `prefers-reduced-motion` media query:

{ist(metadata.reducedMotion)}

## Testing for Accessibility When building with Svelte Atoms, follow these testing practices:

{ist(metadata.testingPractices, true)}

## Best Practices

{ist(metadata.bestPractices)}

## Resources

{ist(metadata.resources)}
