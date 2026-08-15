<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import {
		mergeAtomProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';
	import { createAtomInstance, type Atom } from '$ixirjs/ui/shared/bond';
	import { createPopoverAtom, PopoverBond, setPopoverTracking } from './bond.svelte';
	import type { PopoverTriggerProps } from './types';

	const bond = PopoverBond.getOrThrow('<PopoverTrigger /> must be used within a <Popover />');

	let {
		class: klass = '',
		as = 'button' as E,
		preset = undefined,
		children = undefined,
		onclick = undefined,
		onkeydown = undefined,
		onpointerenter = undefined,
		...restProps
	}: PopoverTriggerProps<E, B> & BasePropsOf<B> = $props();

	const atom = createAtomInstance<Atom<PopoverBond, HTMLElement>, PopoverBond, HTMLElement>(
		'trigger',
		{
			bond,
			factory: (owner) => createPopoverAtom(owner as PopoverBond, 'trigger')
		}
	);

	const triggerProps = $derived(
		mergeAtomProps(atom, preset, restProps, bond.presetLayer('trigger'))
	);

	function handleClick(event: MouseEvent) {
		onclick?.(event);
		if (event.defaultPrevented || event.button === 2) return;

		bond.stageOpenChange({ event, reason: 'trigger' });
		(triggerProps.onclick as ((event: MouseEvent) => void) | undefined)?.(event);
	}

	function handleKeydown(event: KeyboardEvent) {
		onkeydown?.(event);
		if (event.defaultPrevented) return;

		if (event.key === 'Enter' || event.key === ' ') {
			bond.stageOpenChange({ event, reason: 'trigger' });
		}
		(triggerProps.onkeydown as ((event: KeyboardEvent) => void) | undefined)?.(event);
	}

	function handlePointerEnter(event: PointerEvent) {
		onpointerenter?.(event);
		if (event.defaultPrevented) return;

		setPopoverTracking(bond, true);
	}

	// The merged props already fold the Atom spread; build Kernel once during initialization.
	const bodyArg = { popover: bond };
	const el = Kernel.element(
		{ atom: undefined, bond, preset: undefined, presetLayer: undefined },
		() => ({
			as,
			bond,
			class: ['flex w-fit cursor-pointer rounded-md p-2', '$preset', klass],
			type: as === 'button' ? 'button' : undefined,
			...triggerProps,
			onclick: handleClick,
			onkeydown: handleKeydown,
			onpointerenter: handlePointerEnter
		})
	);
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), children, bodyArg, el.motion(), el)}
