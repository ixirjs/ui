<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { SelectBond } from './bond.svelte';
	const PART = Kernel.plan(SelectBond, 'value', { class: '' });
</script>

<script lang="ts" generics="T extends HtmlElementTagName = 'div', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { SelectSelectionProps } from './types';
	import { Chip } from '$ixirjs/ui/components/chip';

	let {
		class: klass = '',
		as = 'div' as T,
		base = undefined,
		preset = undefined,
		selection,
		children,
		ondismiss,
		...restProps
	}: SelectSelectionProps<T, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), {
		context: 'required',
		message: 'SelectSelection must be used within a Select'
	});
	const isMultiple = $derived(part.bond.props.multiple);
	const _base = $derived((base ?? isMultiple) ? Chip : undefined);

	function handleDismiss(ev: MouseEvent) {
		ondismiss?.(ev);

		if (ev.defaultPrevented) return;

		selection.unselect();
	}

	// `_base` is a component only for multiple selection; single selection reaches a native leaf.
	const el = Kernel.element(
		{ atom: part.atom, bond: part.bond, preset: part.preset, presetLayer: part.presetLayer },
		() => ({
			as,
			base: _base,
			class: [
				'select-value border-border inline-flex h-6 flex-nowrap items-center gap-1 rounded-sm px-2 whitespace-nowrap',
				'$preset',
				klass
			],
			ondismiss: handleDismiss,
			...restProps
		})
	);
</script>

{@render Kernel.render(el)(el, children ?? fallback)}

{#snippet fallback()}
	{selection?.label}
{/snippet}
