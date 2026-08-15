<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { SelectBond } from './bond.svelte';
	const PART = Kernel.part(SelectBond, 'placeholder', { class: '' });
</script>

<script lang="ts">
	import type { PresetKey } from '$ixirjs/ui/preset';

	let {
		class: klass = '',
		preset = undefined as PresetKey | undefined,
		children = undefined,
		...restProps
	} = $props();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
	const bond = part.bond;
	const hasValue = $derived(!!bond.props.values?.length);

	const el = Kernel.element(part, () => ({
		class: [
			'border-border absolute inset-0 flex h-full w-full items-center px-2 leading-1 opacity-50 outline-none',
			'$preset',
			klass
		],
		...restProps
	}));
</script>

{@render (!hasValue ? placeholder : undefined)?.()}

{#snippet placeholder()}
	{@render Kernel.render(el)(
		el.tag(),
		el.class(),
		el.attrs(),
		children,
		undefined,
		el.motion(),
		el
	)}
{/snippet}
