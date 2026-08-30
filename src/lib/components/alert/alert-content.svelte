<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { AlertContext } from './bond.svelte';
	import type { AlertContentProps } from './types';

	const props: AlertContentProps = $props();
	const alert = AlertContext.getOptional();
	const el = Kernel.element(() => props, {
		preset: 'alert.content',
		class: 'alert-content border-border flex-1 space-y-1',
		state: alert,
		as: () => props.as,
		base: () => props.base
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, props.children, { alert: alert! })}
