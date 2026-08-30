<script lang="ts" generics="T extends HtmlElementTagName = 'button', B extends Base = Base">
	import { untrack } from 'svelte';
	import { BROWSER } from 'esm-env';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetModuleName } from '$ixirjs/ui/preset';
	import { clickTrigger, triggerAttrs } from '$ixirjs/ui/components/overlay/behavior.svelte';
	import { DropdownMenuContext, menuKeydown } from './bond.svelte';
	import type { Base, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import type { DropdownMenuTriggerProps } from './types';

	const bond = DropdownMenuContext.getOrThrow(
		'<DropdownMenu.Trigger /> must be used within a <DropdownMenu.Root />'
	);

	let {
		as = 'button' as T,
		children = undefined,
		...restProps
	}: DropdownMenuTriggerProps<T, B> = $props();

	const id = Kernel.id(bond.id, `${bond.name}-trigger`);
	const release = bond.attachPart('trigger', id);
	$effect(() => release);

	// A real `<button>` carries `disabled` and no redundant role; anything else gets `role="button"`.
	// The server never renders the element, so it keeps the role either way, as Popover's does.
	const isButton = BROWSER && untrack(() => as) === 'button';
	const click = clickTrigger(bond);
	const navigate = menuKeydown(bond);

	function onkeydown(event: KeyboardEvent) {
		// Arrow / Home / End navigation and printable-key typeahead — what `navigationCapability`
		// and `typeaheadCapability` projected onto the `trigger` role.
		navigate(event);
		if (bond.isDisabled) return;
		if (event.key === 'Enter' || event.key === ' ') {
			// Open menu with a highlighted item: activate it. Otherwise the trigger's own gesture.
			const active = bond.isOpen ? bond.roving.activeItem : null;
			if (active) {
				event.preventDefault();
				active.element?.click();
			} else if (bond.triggerToggles) {
				click.onkeydown(event);
			}
			return;
		}
		if (event.key === 'Tab') {
			bond.element('content')?.focus();
			return;
		}
		if (event.key === 'Escape') bond.close();
	}

	// Hover-opened menus start tracking the position before they open.
	function onpointerenter() {
		bond.tracking = true;
	}

	const bodyArg = { popover: bond };
	const el = Kernel.element(() => restProps, {
		preset: `${bond.name}.trigger` as PresetModuleName,
		class: 'flex w-fit cursor-pointer rounded-md p-2',
		state: bond,
		as: () => as,
		layer: () => bond.props.presets?.trigger,
		attrs: () => ({
			type: as === 'button' ? 'button' : undefined,
			id,
			role: isButton ? '' : 'button',
			...triggerAttrs(bond, bond.ariaHasPopup),
			disabled: isButton ? bond.isDisabled : undefined,
			onclick: bond.triggerToggles ? click.onclick : undefined,
			onkeydown,
			onpointerenter
		})
	});
	// Bound once: an identifier callee in `{@render}` compiles to a direct call — no snippet block,
	// no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, bodyArg)}
