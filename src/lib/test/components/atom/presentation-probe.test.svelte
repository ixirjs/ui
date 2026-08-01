<script lang="ts">
	import { setPreset } from '$ixirjs/ui/preset';
	import { HtmlAtom } from '$ixirjs/ui/components/atom';
	import { createPresentation } from '$ixirjs/ui/components/atom/presentation.svelte';

	setPreset({
		button: () => ({
			class: 'theme-class',
			attrs: { 'data-theme': 'theme' }
		})
	});

	const lightweight = createPresentation({
		preset: () => 'button',
		class: () => 'consumer-class',
		defaults: () => ({ 'data-default': 'default' }),
		restProps: () => ({ 'data-consumer': 'consumer' })
	});
</script>

<div
	data-testid="lightweight"
	class={lightweight.class}
	{...lightweight.attrs}
	data-default={lightweight.attrs['data-default'] ?? undefined}
></div>

<HtmlAtom
	data-testid="full"
	as="div"
	preset="button"
	class="consumer-class"
	defaults={{ 'data-default': 'default' }}
	data-consumer="consumer"
></HtmlAtom>
