<script lang="ts">
	import { colorScheme } from '$lib';
	import { setPreset } from '$lib/context';
	import Root from '$svelte-atoms/core/components/root/root.svelte';
	import { storiesPreset } from './stories-preset';

	let { children = undefined } = $props();

	const scheme = colorScheme();

	// Minimalist styling lives at this decorator-preset level (see stories-preset.ts).
	// Stories override only when needed via a story-level `class`.
	setPreset(storiesPreset);
</script>

<Root class={['svelte-atoms-story-root', scheme.current === 'dark' ? 'dark' : 'light']}>
	<div class="flex min-h-full w-full flex-col items-center justify-center overflow-y-auto p-0">
		{@render children?.()}
	</div>
</Root>
