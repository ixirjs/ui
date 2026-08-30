<script lang="ts">
	import { untrack } from 'svelte';
	import { BROWSER } from 'esm-env';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetModuleName } from '$ixirjs/ui/preset';
	import { clickTrigger, triggerAttrs } from '$ixirjs/ui/components/overlay/behavior.svelte';
	import { PopoverContext } from './bond.svelte';
	import type { PopoverTriggerProps } from './types';

	const bond = PopoverContext.getOrThrow('<PopoverTrigger /> must be used within a <Popover />');

	let {
		as = 'button',
		base = undefined,
		children = undefined,
		...restProps
	}: PopoverTriggerProps<'button'> = $props();

	const id = Kernel.id(bond.id, `${bond.name}-trigger`);
	const release = bond.attachPart('trigger', id);
	$effect(() => release);

	// A real `<button>` carries `disabled` and no redundant role; anything else gets `role="button"`.
	// The server never renders the element, so it keeps the role either way — as it always did. The
	// tag is decided once at init (`Kernel.element`'s `as` thunk reads it then too).
	const isButton = BROWSER && untrack(() => as) === 'button';
	const click = clickTrigger(bond);

	// Enter/Space toggle (from the core), then the popover's own routing: Tab moves into the content,
	// Escape closes from the trigger.
	function onkeydown(event: KeyboardEvent) {
		click.onkeydown(event);
		if (bond.isDisabled) return;
		if (event.key === 'Tab') {
			bond.element('content')?.focus();
			return;
		}
		if (event.key === 'Escape') bond.close();
	}

	// Hover-opened popovers start tracking the position before they open.
	function onpointerenter() {
		bond.tracking = true;
	}

	const bodyArg = { popover: bond };
	const el = Kernel.element(() => restProps, {
		preset: `${bond.name}.trigger` as PresetModuleName,
		class: 'flex w-fit cursor-pointer rounded-md p-2',
		state: bond,
		as: () => as,
		// Declared, not discovered: Kernel escalates to a renderer only for a `base` the part names,
		// and this one is a documented consumer prop (`<Popover.Trigger base={Button} />`).
		base: () => base,
		layer: () => bond.props.presets?.trigger,
		attrs: () => ({
			type: as === 'button' ? 'button' : undefined,
			id,
			role: isButton ? '' : 'button',
			...triggerAttrs(bond),
			disabled: isButton ? bond.isDisabled : undefined,
			onclick: click.onclick,
			onkeydown,
			onpointerenter
		})
	});
	// Bound once: an identifier callee in `{@render}` compiles to a direct call — no snippet block, no
	// hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, bodyArg)}
