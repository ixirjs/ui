<script lang="ts" generics="E extends HtmlElementTagName, B extends Base = Base">
	import { PortalBond, PortalsBond } from '$svelte-atoms/core/components/portal';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import type { HtmlElementTagName } from '$svelte-atoms/core/components/element';
	import { clickout } from '$svelte-atoms/core/attachments';
	import { PopoverBond } from './bond.svelte';
	import { animatePopoverContent } from './motion.svelte';
	import type { PopoverContentProps } from './types';
	import Floating from './strategies/floating.svelte';
	import PopoverOverlay from './popover-overlay.svelte';

	const bond = PopoverBond.get();

	if (!bond) {
		throw new Error('<PopoverOverlay /> must be used within a <Popover />');
	}

	const activePortalBond = $derived.by(() => {
		const key = bond.state.props.portal;
		if (key instanceof PortalBond) {
			return key;
		}

		if (typeof key === 'string') {
			return PortalsBond.get()?.state.get(key);
		}

		return PortalBond.get();
	});

	let {
		class: klass = '',
		overlay: Overlay = PopoverOverlay,
		preset = undefined,
		children = undefined,
		onclickoutside = undefined,
		fallback = {
			animate: animatePopoverContent()
		},
		...restProps
	}: PopoverContentProps<E, B> = $props();

	const atom = bond.atom('content');

	const presentation = $derived({ preset: preset ?? atom.preset });

	const portalId = $derived(activePortalBond?.id);

	const contentProps = $derived({
		...atom.spread,
		...restProps
	});

	function clickoutAttachement(node: HTMLElement) {
		const cleanup = clickout((ev) => {
			if (onclickoutside) {
				onclickoutside(ev, bond);
				return;
			}

			const trigger = bond.element('trigger');

			if (trigger instanceof Element && (trigger.contains(ev.target as Node) || trigger === ev.target)) {
				return;
			}

			bond.state.close();
		}, {})(node);

		return cleanup;
	}
</script>

<Floating />

<Overlay portal={portalId ?? 'root.l0'} as="div">
	<HtmlAtom
		{@attach clickoutAttachement}
		{bond}
		{fallback}
		class={[
			'popover-content bg-popover text-popover-foreground border-border rounded-md border p-2 opacity-0 shadow-lg outline-none',
			'$preset',
			klass
		]}
		{...presentation}
		{...contentProps}
	>
		{@render children?.({ popover: bond })}
	</HtmlAtom>
</Overlay>
