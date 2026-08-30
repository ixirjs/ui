<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetKey } from '$ixirjs/ui/preset';
	import { Input } from '$ixirjs/ui/components/input';
	import { SelectContext } from './bond.svelte';
	import type { InputControlProps } from '$ixirjs/ui/components/input';
	import type { SelectQueryProps } from './types';

	const bond = SelectContext.getOrThrow('SelectQuery must be used within a Select');

	let {
		value = $bindable(),
		class: klass = '',
		preset = undefined,
		...restProps
	}: SelectQueryProps = $props();

	const id = Kernel.id(bond.id, `${bond.name}-query`);

	// The combobox a11y `inputCapability` projected onto the `'input'`/`'query'` role, written
	// literally. The control's text IS the bond's `query`: typing filters the items, Escape
	// (`onEscape` → clear-then-close) empties it.
	const inputAttrs = $derived.by(() => {
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
</script>

<Input.Control
	bind:value={
		() => bond.props.query ?? '',
		(v) => {
			bond.props.query = v;
			value = v;
		}
	}
	class={['inline-flex h-auto w-auto flex-1 py-1', '$preset', klass]}
	preset={preset ?? (`${bond.name}.query` as PresetKey)}
	presetLayer={bond.props.presets?.query}
	{...inputAttrs}
	{...restProps as unknown as InputControlProps}
/>
