<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { AlertContext } from './bond.svelte';
	import type { AlertActionsProps } from './types';

	const props: AlertActionsProps = $props();
	const alert = AlertContext.getOptional();
	const el = Kernel.element(() => props, {
		preset: 'alert.actions',
		class: 'alert-actions border-border mt-3 flex items-center gap-2',
		state: alert,
		as: () => props.as,
		base: () => props.base
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, props.children, { alert: alert! })}
