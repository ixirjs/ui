<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { TreeContext } from './bond.svelte';
	import type { TreeHeaderProps } from './types';

	let { children = undefined, ...restProps }: TreeHeaderProps = $props();
	const bond = TreeContext.getOrThrow('<Tree.Header /> must be used within a <Tree.Root />');
	const owner = bond.keyboardOwner;

	// The treeitem's id, written here so the root (`aria-labelledby`) and the body
	// (`aria-labelledby`) can name it — and so the keyboard model can list this node.
	const id = Kernel.id(bond.id, 'tree-header');
	bond.headerId = id;

	// A consumer's handler composes before these and cancels them by preventing default.
	function onpointerdown(event: PointerEvent) {
		if (event.defaultPrevented || event.button > 0 || event.isPrimary === false) return;
		if (bond.isDisabled) return;
		bond.stageOpenChange({ event, reason: 'trigger' });
		bond.toggle();
	}
	function onkeydown(event: KeyboardEvent) {
		if (event.defaultPrevented) return;
		const key = event.key;
		if (key === 'Enter' || key === ' ') {
			if (event.repeat) return;
			event.preventDefault();
			if (bond.isDisabled) return;
			bond.stageOpenChange({ event, reason: 'trigger' });
			bond.toggle();
			return;
		}
		// Horizontal arrows on a tree are expand/collapse, not "move the highlight"; vertical arrows
		// and Home/End walk the owner's visible treeitems.
		if (key === 'ArrowRight') {
			if (!bond.isOpen && bond.hasChildren) bond.open();
			else if (bond.isOpen) owner.focusNode(bond.firstChildHeaderId);
			else return;
		} else if (key === 'ArrowLeft') {
			if (bond.isOpen) bond.close();
			else owner.focusNode(bond.parentHeaderId);
		} else if (!owner.move(key)) return;
		event.preventDefault();
	}
	function onfocus() {
		owner.notifyFocused(id);
	}

	const el = Kernel.element(() => restProps, {
		preset: 'tree.header',
		class: 'cursor-pointer',
		state: bond,
		layer: () => bond.props.presets?.header,
		attrs: () => {
			const disabled = bond.isDisabled;
			// Roving tabindex over the visible treeitems — exactly one node is in the tab order.
			const attrs: Record<string, unknown> = {
				id,
				tabindex: disabled || owner.focusedId !== id ? -1 : 0,
				role: 'treeitem',
				'aria-controls': bond.bodyId,
				'aria-expanded': bond.isOpen,
				onpointerdown,
				onkeydown,
				onfocus
			};
			if (disabled) {
				attrs.disabled = true;
				attrs['aria-disabled'] = 'true';
			}
			return attrs;
		}
	});
</script>

<div {...el.attrs}>{@render children?.({ tree: bond })}</div>
