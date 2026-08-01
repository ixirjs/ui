<script lang="ts">
	import { colorScheme } from '$lib/runes';
	import { setPreset } from '$lib/preset';
	import Root from '$ixirjs/ui/components/root/root.svelte';
	import { storiesPreset } from './stories-preset';

	let { children = undefined, colorScheme: colorSchemeGlobal = 'system' } = $props();

	const scheme = colorScheme();

	// The Storybook toolbar global ('system' | 'light' | 'dark') overrides the OS-tracked
	// scheme; 'system' falls back to the colorScheme() rune.
	const resolvedScheme = $derived(
		colorSchemeGlobal === 'system' ? scheme.current : colorSchemeGlobal
	);

	// Minimalist styling lives at this decorator-preset level (see stories-preset.ts).
	// Stories override only when needed via a story-level `class`.
	setPreset(storiesPreset);
</script>

<Root class={['ixirjs-story-root', resolvedScheme === 'dark' ? 'dark' : 'light']}>
	<div
		class="bg-background bg-dot-grid flex min-h-full w-full flex-col items-center justify-center overflow-y-auto p-0"
	>
		{@render children?.()}
	</div>
</Root>
