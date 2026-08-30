<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { clickTrigger, triggerAttrs } from '$ixirjs/ui/components/overlay/behavior.svelte';
	import { DatePickerContext } from './bond.svelte';
	import type { PopoverTriggerProps } from '$ixirjs/ui/components/popover/types';

	const bond = DatePickerContext.getOrThrow(
		'<DatePicker.Trigger /> must be used within a <DatePicker.Root />'
	);

	let {
		as = 'button',
		base = undefined,
		children = undefined,
		...restProps
	}: PopoverTriggerProps<'button'> = $props();

	const id = Kernel.id(bond.id, `${bond.name}-trigger`);
	const release = bond.attachPart('trigger', id);
	$effect(() => release);

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

	// The combobox surface over the overlay trigger: `aria-expanded`, `aria-controls`,
	// `aria-disabled` and `tabindex` come from the core; the rest is what `DatePickerTriggerAtom`
	// projected — a readonly, labelled combobox that is disabled with the picker.
	const bodyArg = { popover: bond };
	const el = Kernel.element(() => restProps, {
		preset: 'datepicker.trigger',
		class: 'flex w-fit cursor-pointer rounded-md p-2',
		state: bond,
		as: () => as,
		base: () => base,
		layer: () => bond.props.presets?.trigger,
		attrs: () => ({
			type: as === 'button' ? 'button' : undefined,
			id,
			...triggerAttrs(bond),
			role: 'combobox',
			'aria-label': 'Date picker',
			placeholder: bond.props.placeholder ?? 'Select a date',
			disabled: bond.props.disabled ?? false,
			readonly: true,
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
