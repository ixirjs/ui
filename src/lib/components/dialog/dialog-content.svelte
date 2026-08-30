<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetModuleName } from '$ixirjs/ui/preset';
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import { PortalHost } from '$ixirjs/ui/components/portal/instance';
	import { focusContentOnMount } from '$ixirjs/ui/components/overlay/behavior.svelte';
	import { DialogContext } from './bond.svelte';
	import type { DialogContentProps } from './types';
	import { animateDialogContent } from './motion.svelte';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DialogContentProps<E, B> & BasePropsOf<B> = $props();

	const bond = DialogContext.getOrThrow('<Dialog.Content /> must be used within a <Dialog.Root />');
	const id =
		untrack(() => restProps.id as string | undefined) ?? Kernel.id(bond.id, `${bond.name}-content`);
	const detach = bond.attachPart('content', id);
	$effect(() => detach);

	const defaults = {
		animate: animateDialogContent()
	};

	// Focus moves into the content when it mounts already open; opening later is the root's effect.
	function focusOnMount(node: HTMLElement) {
		focusContentOnMount(bond, node);
	}
</script>

<!-- Handed to `PortalHost` — another component — which forwards `presetLayer` and `defaults`. -->
<PortalHost
	{@attach focusOnMount}
	class={[
		'bg-card text-foreground flex h-fit w-full max-w-[90svw] flex-col rounded-md border py-4 shadow-sm opacity-0',
		'$preset',
		klass
	]}
	preset={preset ?? (`${bond.name}.content` as PresetModuleName)}
	presetLayer={bond.props.presets?.content}
	{defaults}
	elementId={id}
	id={`${id}-portal`}
	role="document"
	{...restProps}
>
	{@render children?.({ dialog: bond })}
</PortalHost>
