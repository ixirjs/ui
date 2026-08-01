<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { PortalHost } from '$ixirjs/ui/components/portal/instance';
	import { usePart } from '$ixirjs/ui/shared';
	import { DialogBond } from './bond.svelte';
	import type { DialogContentProps } from './types';
	import { animateDialogContent } from './motion.svelte';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DialogContentProps<E, B> = $props();

	const defaults = {
		animate: animateDialogContent()
	};

	const part = usePart(DialogBond, 'content', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;
</script>

<PortalHost
	class={[
		'bg-card text-foreground flex h-fit w-full max-w-[90svw] flex-col rounded-md border py-4 shadow-sm opacity-0',
		'$preset',
		klass
	]}
	{bond}
	{defaults}
	{...part.props}
>
	{@render children?.({ dialog: bond })}
</PortalHost>
