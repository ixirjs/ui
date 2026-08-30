<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { AlertContext } from './bond.svelte';
	import type { AlertDescriptionProps } from './types';

	const props: AlertDescriptionProps = $props();
	const alert = AlertContext.getOptional();
	const el = Kernel.element(() => props, {
		preset: 'alert.description',
		class: 'alert-description border-border mt-1 text-sm leading-relaxed',
		state: alert,
		as: () => props.as ?? 'p',
		base: () => props.base,
		attrs: () => (alert ? { id: alert.descriptionId } : {})
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, props.children, { alert: alert! })}
