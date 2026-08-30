<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CollapsibleContext } from './bond.svelte';
	import type { CollapsibleHeaderProps } from './types';

	let {
		as = undefined,
		base = undefined,
		children = undefined,
		...restProps
	}: CollapsibleHeaderProps = $props();
	const bond = CollapsibleContext.getOrThrow(
		'<Collapsible.Header /> must be used within a <Collapsible.Root />'
	);

	// Pointer and Enter/Space toggle; a consumer preventing the default keeps the state as it is.
	function onclick(event: MouseEvent) {
		if (event.defaultPrevented || bond.isDisabled) return;
		bond.stageOpenChange({ event, reason: 'trigger' });
		bond.toggle();
	}
	function onkeydown(event: KeyboardEvent) {
		if (event.defaultPrevented || (event.key !== 'Enter' && event.key !== ' ')) return;
		event.preventDefault();
		if (bond.isDisabled) return;
		bond.stageOpenChange({ event, reason: 'trigger' });
		bond.toggle();
	}

	// Dispatches: `as`/`base` stay available to a consumer, and a theme may retag the header.
	const el = Kernel.element(() => restProps, {
		preset: 'collapsible.header',
		class: 'border-border flex cursor-pointer items-center gap-2',
		state: bond,
		as: () => as,
		base: () => base,
		attrs: () => {
			const disabled = bond.isDisabled;
			// `as`, not the rendered node: the same answer on the server and after hydration.
			const isButton = as === 'button';
			const attrs: Record<string, unknown> = {
				id: bond.headerId,
				'aria-disabled': disabled ? 'true' : 'false',
				disabled: isButton ? disabled || undefined : undefined,
				role: isButton ? undefined : 'button',
				tabindex: isButton ? undefined : disabled ? -1 : 0,
				'aria-controls': bond.bodyId,
				'aria-expanded': bond.isOpen,
				'data-state': bond.isOpen ? 'open' : 'closed',
				onclick,
				onkeydown
			};
			return attrs;
		}
	});
	// Bound once, in the script: `{@render leaf(...)}` with a plain identifier compiles to a direct
	// call on both platforms — no snippet block, no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { collapsible: bond })}
