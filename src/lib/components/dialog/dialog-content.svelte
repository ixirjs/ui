<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { DialogBond } from './bond.svelte';
	const PART = Kernel.plan(DialogBond, 'content', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { PortalHost } from '$ixirjs/ui/components/portal/instance';
	import type { DialogContentProps } from './types';
	import { animateDialogContent } from './motion.svelte';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DialogContentProps<E, B> & BasePropsOf<B> = $props();

	const defaults = {
		animate: animateDialogContent()
	};

	const part = Kernel.node(PART, () => ({ preset }), {
		context: 'required',
		rest: () => restProps
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
