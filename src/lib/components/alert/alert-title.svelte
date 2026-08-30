<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { AlertContext } from './bond.svelte';
	import type { AlertTitleProps } from './types';

	const props: AlertTitleProps = $props();
	// Optional context: a bare <Alert.Title> renders without a root.
	const alert = AlertContext.getOptional();
	const el = Kernel.element(() => props, {
		preset: 'alert.title',
		class: 'alert-title border-border text-sm leading-tight font-medium',
		state: alert,
		as: () => props.as ?? 'h4',
		base: () => props.base,
		attrs: () => (alert ? { id: alert.titleId } : {})
	});
	// Bound once, in the script: `{@render leaf(...)}` with a plain identifier compiles to a direct
	// call on both platforms — no snippet block, no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, props.children, { alert: alert! })}
