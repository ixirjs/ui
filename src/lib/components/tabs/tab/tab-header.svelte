<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { portal } from '$ixirjs/ui/attachments/portal.svelte';
	import { TabContext } from './bond.svelte';
	import type { TabHeaderProps } from '$ixirjs/ui/components/tabs/types';

	let { as = undefined, base = undefined, children, ...restProps }: TabHeaderProps = $props();
	const bond = TabContext.getOrThrow('<Tab.Header /> must be used within a <Tab.Root />');

	// Every header lives in the tablist: portaled into `Tabs.Header`, hidden when there is none.
	// Key AND function are minted once, so a state change never re-parents (and blurs) the header.
	const portalKey = createAttachmentKey();
	const intoHeader = (node: HTMLElement) => {
		const headerElement = bond.tabs?.headerElement;
		if (!headerElement) {
			node.hidden = true;
			return;
		}
		return portal(headerElement)(node);
	};

	function onclick() {
		if (bond.props.disabled) return;
		bond.select();
	}

	const el = Kernel.element(() => restProps, {
		preset: 'tab.header',
		class:
			'text-foreground/50 bg-foreground/0 hover:bg-foreground/5 active:bg-foreground/10 flex cursor-pointer items-center px-2 py-2 text-sm font-medium transition-colors duration-100',
		state: bond,
		as: () => as ?? 'button',
		base: () => base,
		// The selected/disabled classes ride the instance layer, under the consumer's own layer.
		layer: () => {
			const own = bond.props.presets?.header;
			const state = `${bond.isActive ? 'text-primary bg-primary/5 hover:bg-primary/10 active:bg-primary/15' : ''} ${bond.props.disabled ? 'opacity-50' : ''}`;
			return own === undefined
				? { class: state }
				: ({ bond: context }) => {
						const layer = typeof own === 'function' ? own({ bond: context }) : own;
						return { ...layer, class: [state, (layer as { class?: unknown })?.class] };
					};
		},
		attrs: () => {
			const disabled = bond.props.disabled ?? false;
			const active = bond.isActive;
			const attrs: Record<string, unknown> = {
				id: bond.headerId,
				'aria-disabled': disabled,
				'data-controler-id': bond.tabs?.id,
				'data-active': active,
				// Roving tabindex (APG tabs): Tab enters the tablist once, arrows move between tabs.
				tabindex: active ? 0 : -1,
				'aria-selected': active,
				'data-selected': active ? '' : undefined,
				role: 'tab',
				type: 'button',
				onclick,
				[portalKey]: intoHeader
			};
			if (disabled) attrs.disabled = true;
			if (bond.panelId) attrs['aria-controls'] = bond.panelId;
			return attrs;
		}
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { tab: bond })}
