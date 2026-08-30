<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetKey } from '$ixirjs/ui/preset';
	import { Input } from '$ixirjs/ui/components/input';
	import { ComboboxContext } from './bond.svelte';
	import type { InputControlProps } from '$ixirjs/ui/components/input';
	import type { ComboboxControlProps } from './types';

	const bond = ComboboxContext.getOrThrow('ComboboxControl must be used within a Combobox');

	let {
		value = $bindable(),
		class: klass = '',
		preset = undefined,
		...restProps
	}: ComboboxControlProps = $props();

	const id = Kernel.id(bond.id, `${bond.name}-control`);

	// Trigger control is the `value` box: it shows the selection, and setting it commits. Filtering
	// lives in a separate `Combobox.Query` (the `query` field).
	const controlAttrs = $derived.by(() => {
		const active = bond.roving.activeId;
		const isDisabled = bond.isDisabled;
		return {
			id,
			role: 'combobox',
			'aria-autocomplete': 'list' as const,
			'aria-expanded': bond.isOpen,
			'aria-controls': bond.partId('content'),
			'aria-activedescendant': active === null ? undefined : bond.itemDomId(active),
			'aria-disabled': isDisabled,
			disabled: isDisabled || undefined,
			tabindex: isDisabled ? -1 : 0
		};
	});

	// Typing replaces the current single selection; Enter in multi-select mode adds a free entry.
	function oninput() {
		if (bond.props.multiple) return;
		bond.props.values = [];
	}

	function onkeydown(event: KeyboardEvent) {
		if (bond.isDisabled || !bond.props.multiple) return;
		if (event.key !== 'Enter') return;
		const text = (event.currentTarget as HTMLInputElement).value.trim();
		if (text !== '') bond.addSelection(text);
	}
</script>

<Input.Control
	bind:value={
		() => bond.input.get('value'),
		(v) => {
			bond.input.set(v, 'value');
			value = v;
		}
	}
	class={['border-border flex-1 py-1', '$preset', klass]}
	preset={preset ?? (`${bond.name}.control` as PresetKey)}
	presetLayer={bond.props.presets?.control}
	{...controlAttrs}
	{oninput}
	{onkeydown}
	{...restProps as unknown as InputControlProps}
/>
