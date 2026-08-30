<script lang="ts">
	import { setPreset } from '$ixirjs/ui/preset';
	import KernelElement from '$ixirjs/ui/test/components/atom/kernel-element.test.svelte';
	import { createPresentation } from '$ixirjs/ui/kernel/presentation.svelte';

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

<KernelElement
	data-testid="full"
	as="div"
	preset="button"
	class="consumer-class"
	defaults={{ 'data-default': 'default' }}
	data-consumer="consumer"
></KernelElement>
