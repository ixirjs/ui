<script lang="ts" generics="T extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetModuleName } from '$ixirjs/ui/preset';
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import { Chip } from '$ixirjs/ui/components/chip';
	import { SelectContext } from './bond.svelte';
	import type { SelectSelectionProps } from './types';

	const bond = SelectContext.getOrThrow('SelectSelection must be used within a Select');

	let {
		as = 'div' as T,
		base = undefined,
		selection,
		children,
		ondismiss,
		...restProps
	}: SelectSelectionProps<T, B> & BasePropsOf<B> = $props();

	const isMultiple = $derived(bond.props.multiple);
	const _base = $derived((base ?? isMultiple) ? Chip : undefined);

	function handleDismiss(ev: MouseEvent) {
		ondismiss?.(ev);
		if (ev.defaultPrevented) return;
		selection.unselect();
	}

	// `_base` is a component only for multiple selection; single selection reaches a native leaf.
	const el = Kernel.element(() => restProps, {
		preset: `${bond.name}.value` as PresetModuleName,
		class:
			'select-value border-border inline-flex h-6 flex-nowrap items-center gap-1 rounded-sm px-2 whitespace-nowrap',
		state: bond,
		as: () => as,
		base: () => _base,
		layer: () => bond.props.presets?.value,
		attrs: () => ({ ondismiss: handleDismiss })
	});
	// Bound once: an identifier callee in `{@render}` compiles to a direct call — no snippet block,
	// no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children ?? fallback)}

{#snippet fallback()}
	{selection?.label}
{/snippet}
