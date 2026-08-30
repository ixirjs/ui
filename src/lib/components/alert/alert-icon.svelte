<script lang="ts">
	import { Icon } from '$ixirjs/ui/components/icon';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { AlertContext } from './bond.svelte';
	import type { AlertIconProps } from './types';

	let { base = Icon, children = undefined, ...restProps }: AlertIconProps = $props();
	const alert = AlertContext.getOptional();

	// `base` defaults to Icon; `base={null}` deliberately selects a native element leaf.
	const el = Kernel.element(() => restProps, {
		preset: 'alert.icon',
		class:
			'alert-icon border-border inline-flex aspect-square h-5 items-center justify-center rounded-full text-sm font-medium',
		state: alert,
		as: () => restProps.as,
		base: () => base,
		attrs: () => (alert ? { id: alert.iconId, 'aria-hidden': true } : { 'aria-hidden': true })
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { alert: alert! })}
